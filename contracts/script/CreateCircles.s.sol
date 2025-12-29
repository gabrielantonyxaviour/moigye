// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {GyeCircle} from "@/GyeCircle.sol";
import {GyeLib} from "@/libraries/GyeLib.sol";

/// @title CreateCircles
/// @notice Create circles using only the deployer wallet
contract CreateCircles is Script {
    address constant FACTORY = 0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb;

    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        GyeFactory factory = GyeFactory(FACTORY);

        console2.log("\n=== CREATE CIRCLES ===");
        console2.log("Deployer:", deployer);
        console2.log("Balance:", deployer.balance / 1e18, "VERY");
        console2.log("Current circles:", factory.circleCount());

        vm.startBroadcast(deployerKey);

        if (factory.circleCount() == 0) {
            // Create Circle 1 - deployer only (for testing factory)
            GyeLib.CircleConfig memory config1 = GyeLib.CircleConfig({
                name: "Moigye Test Alpha",
                contributionAmount: 0.001 ether,
                frequency: 300, // 5 minutes
                totalRounds: 2,
                stakeRequired: 0.002 ether,
                penaltyRate: 1000,
                payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
            });

            (uint256 id1, address addr1) = factory.createAndJoinCircle{value: config1.stakeRequired}(config1);
            console2.log("Circle 1 created:", id1, "at", addr1);
        }

        if (factory.circleCount() == 1) {
            // Create Circle 2
            GyeLib.CircleConfig memory config2 = GyeLib.CircleConfig({
                name: "Moigye Test Beta",
                contributionAmount: 0.0005 ether,
                frequency: 600, // 10 minutes
                totalRounds: 3,
                stakeRequired: 0.001 ether,
                penaltyRate: 500,
                payoutMethod: GyeLib.PayoutMethod.RANDOM
            });

            (uint256 id2, address addr2) = factory.createAndJoinCircle{value: config2.stakeRequired}(config2);
            console2.log("Circle 2 created:", id2, "at", addr2);
        }

        if (factory.circleCount() == 2) {
            // Create Circle 3
            GyeLib.CircleConfig memory config3 = GyeLib.CircleConfig({
                name: "Moigye Test Gamma",
                contributionAmount: 0.0002 ether,
                frequency: 900, // 15 minutes
                totalRounds: 5,
                stakeRequired: 0.0005 ether,
                penaltyRate: 2000,
                payoutMethod: GyeLib.PayoutMethod.AUCTION
            });

            (uint256 id3, address addr3) = factory.createAndJoinCircle{value: config3.stakeRequired}(config3);
            console2.log("Circle 3 created:", id3, "at", addr3);
        }

        vm.stopBroadcast();

        console2.log("\n=== COMPLETE ===");
        console2.log("Total circles:", factory.circleCount());
        console2.log("Balance:", deployer.balance / 1e18, "VERY");
    }
}
