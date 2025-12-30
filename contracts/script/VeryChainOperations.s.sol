// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {GyeCircle} from "@/GyeCircle.sol";
import {GyeLib} from "@/libraries/GyeLib.sol";

/// @title VeryChainOperations
/// @notice Continue operations on VeryChain mainnet with deployed factory
contract VeryChainOperations is Script {
    // Deployed factory
    address constant FACTORY = 0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb;

    GyeFactory public factory;
    uint256 public startBalance;

    // Test wallets
    address[] public testWallets;
    uint256[] public testWalletKeys;

    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        factory = GyeFactory(FACTORY);
        startBalance = deployer.balance;

        console2.log("\n=== VERYCHAIN OPERATIONS ===");
        console2.log("Factory:", FACTORY);
        console2.log("Deployer:", deployer);
        console2.log("Starting balance:", startBalance / 1e18, "VERY");

        // Generate wallets deterministically
        _generateWallets(deployerKey);

        // Fund wallets and create circles
        vm.startBroadcast(deployerKey);
        _fundWallets();
        vm.stopBroadcast();

        // Create circles with each wallet broadcasting
        _createAndOperateCircles();

        // Report
        _reportGasUsage(deployer);
    }

    function _generateWallets(uint256 deployerKey) internal {
        console2.log("\n--- Generating 10 Test Wallets ---");

        for (uint256 i = 1; i <= 10; i++) {
            uint256 walletKey = uint256(keccak256(abi.encodePacked(deployerKey, "moigye_test", i)));
            address wallet = vm.addr(walletKey);

            testWalletKeys.push(walletKey);
            testWallets.push(wallet);

            console2.log("Wallet", i, ":", wallet);
        }
    }

    function _fundWallets() internal {
        console2.log("\n--- Funding Test Wallets ---");
        uint256 fundAmount = 0.015 ether; // 0.015 VERY per wallet

        for (uint256 i = 0; i < testWallets.length; i++) {
            if (testWallets[i].balance < fundAmount) {
                (bool success,) = testWallets[i].call{value: fundAmount}("");
                require(success, "Funding failed");
                console2.log("Funded wallet", i + 1);
            } else {
                console2.log("Wallet", i + 1, "already funded");
            }
        }
    }

    function _createAndOperateCircles() internal {
        console2.log("\n--- Creating Circles ---");

        // Circle 1: Fixed Order (3 members) - wallets 0,1,2
        _createCircle1();

        // Circle 2: Random (5 members) - wallets 3,4,5,6,7
        _createCircle2();

        // Circle 3: Auction (10 members) - all wallets
        _createCircle3();
    }

    function _createCircle1() internal {
        console2.log("\n[Circle 1: Fixed Order - 3 members]");

        vm.startBroadcast(testWalletKeys[0]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Test Circle Alpha",
            contributionAmount: 0.001 ether,
            frequency: 60,
            totalRounds: 3,
            stakeRequired: 0.003 ether,
            penaltyRate: 1000,
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("Circle created:", circleId, "at", circleAddr);

        vm.stopBroadcast();

        // Wallets 1 and 2 join
        GyeCircle circle = GyeCircle(payable(circleAddr));

        vm.startBroadcast(testWalletKeys[1]);
        circle.join{value: config.stakeRequired}();
        console2.log("Wallet 2 joined");
        vm.stopBroadcast();

        vm.startBroadcast(testWalletKeys[2]);
        circle.join{value: config.stakeRequired}();
        console2.log("Wallet 3 joined");
        vm.stopBroadcast();

        // Start and contribute
        vm.startBroadcast(testWalletKeys[0]);
        circle.startCircle();
        circle.contribute{value: config.contributionAmount}();
        console2.log("Circle started, wallet 1 contributed");
        vm.stopBroadcast();

        vm.startBroadcast(testWalletKeys[1]);
        circle.contribute{value: config.contributionAmount}();
        console2.log("Wallet 2 contributed");
        vm.stopBroadcast();

        vm.startBroadcast(testWalletKeys[2]);
        circle.contribute{value: config.contributionAmount}();
        console2.log("Wallet 3 contributed");
        vm.stopBroadcast();
    }

    function _createCircle2() internal {
        console2.log("\n[Circle 2: Random - 5 members]");

        vm.startBroadcast(testWalletKeys[3]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Random Circle Beta",
            contributionAmount: 0.0005 ether,
            frequency: 120,
            totalRounds: 5,
            stakeRequired: 0.002 ether,
            penaltyRate: 500,
            payoutMethod: GyeLib.PayoutMethod.RANDOM
        });

        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("Circle created:", circleId, "at", circleAddr);

        vm.stopBroadcast();

        // Wallets 4-7 join
        GyeCircle circle = GyeCircle(payable(circleAddr));

        for (uint256 i = 4; i < 8; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.join{value: config.stakeRequired}();
            console2.log("Wallet", i + 1, "joined");
            vm.stopBroadcast();
        }
    }

    function _createCircle3() internal {
        console2.log("\n[Circle 3: Auction - 10 members]");

        vm.startBroadcast(testWalletKeys[8]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Auction Circle Gamma",
            contributionAmount: 0.0002 ether,
            frequency: 180,
            totalRounds: 10,
            stakeRequired: 0.001 ether,
            penaltyRate: 2000,
            payoutMethod: GyeLib.PayoutMethod.AUCTION
        });

        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("Circle created:", circleId, "at", circleAddr);

        vm.stopBroadcast();

        // All other wallets join
        GyeCircle circle = GyeCircle(payable(circleAddr));

        for (uint256 i = 0; i < 10; i++) {
            if (i == 8) continue; // Creator already joined

            vm.startBroadcast(testWalletKeys[i]);
            circle.join{value: config.stakeRequired}();
            console2.log("Wallet", i + 1, "joined");
            vm.stopBroadcast();
        }
    }

    function _reportGasUsage(address deployer) internal view {
        uint256 endBalance = deployer.balance;
        uint256 spent = startBalance - endBalance;

        console2.log("\n=== OPERATIONS COMPLETE ===");
        console2.log("Total circles:", factory.circleCount());
        console2.log("Spent:", spent / 1e15, "mVERY");

        if (spent <= 5 ether) {
            console2.log("STATUS: Within 5 VERY budget!");
        } else {
            console2.log("STATUS: EXCEEDED budget");
        }
    }
}
