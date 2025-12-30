// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {GyeCircle} from "@/GyeCircle.sol";
import {GyeLib} from "@/libraries/GyeLib.sol";

/// @title VeryChainMainnetSeed
/// @notice Seed test data on VeryChain mainnet after deployment
/// @dev Creates 7 circles with different configurations, operations on 2
contract VeryChainMainnetSeed is Script {
    uint256 constant VERYCHAIN_MAINNET = 4613;
    uint256 constant LOCAL_FORK = 31337;

    uint256 constant NUM_TEST_WALLETS = 12;
    uint256 constant FUND_AMOUNT_PER_WALLET = 0.35 ether; // ~4.2 VERY total, enough for all ops

    GyeFactory public factory;
    address[] public testWallets;
    uint256[] public testWalletKeys;
    address[] public createdCircles;

    uint256 public startBalance;

    function run() public {
        _seed(vm.envAddress("FACTORY_ADDRESS"));
    }

    function seedWithFactory(address factoryAddress) public {
        _seed(factoryAddress);
    }

    function _seed(address factoryAddress) internal {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        require(
            block.chainid == VERYCHAIN_MAINNET || block.chainid == LOCAL_FORK,
            "Must be VeryChain mainnet (4613) or local fork (31337)"
        );

        factory = GyeFactory(factoryAddress);
        startBalance = deployer.balance;

        console2.log("");
        console2.log("============================================");
        console2.log("   MOIGYE VERYCHAIN SEEDING (7 CIRCLES)");
        console2.log("============================================");
        console2.log("");
        console2.log("Factory:         ", factoryAddress);
        console2.log("Deployer:        ", deployer);
        console2.log("Balance:         ", startBalance / 1e18, "VERY");
        console2.log("");

        _generateTestWallets(deployerKey);
        _fundTestWallets(deployerKey);
        _createAllCircles();
        _printSeedingSummary(deployer);
    }

    function _generateTestWallets(uint256 deployerKey) internal {
        console2.log("--- Generating Test Wallets ---");

        for (uint256 i = 1; i <= NUM_TEST_WALLETS; i++) {
            uint256 walletKey = uint256(
                keccak256(abi.encodePacked(deployerKey, "moigye_mainnet_v3", i))
            );
            address wallet = vm.addr(walletKey);
            testWalletKeys.push(walletKey);
            testWallets.push(wallet);
            console2.log("  Wallet", i, ":", wallet);
        }
        console2.log("");
    }

    function _fundTestWallets(uint256 deployerKey) internal {
        console2.log("--- Funding Test Wallets ---");

        vm.startBroadcast(deployerKey);

        uint256 funded = 0;
        for (uint256 i = 0; i < testWallets.length; i++) {
            if (testWallets[i].balance < FUND_AMOUNT_PER_WALLET) {
                (bool success,) = testWallets[i].call{value: FUND_AMOUNT_PER_WALLET}("");
                require(success, "Funding failed");
                funded++;
            }
        }

        vm.stopBroadcast();
        console2.log("  Funded:", funded, "wallets");
        console2.log("");
    }

    function _createAllCircles() internal {
        console2.log("--- Creating 7 Circles ---");
        console2.log("");

        // ============================================
        // CIRCLE 1: Active circle with full operations
        // ============================================
        _createCircle1_FullyActive();

        // ============================================
        // CIRCLE 2: Active with partial contributions
        // ============================================
        _createCircle2_PartialActive();

        // ============================================
        // CIRCLES 3-7: Just created, no operations
        // ============================================
        _createCircle3_JustCreated();
        _createCircle4_JustCreated();
        _createCircle5_JustCreated();
        _createCircle6_JustCreated();
        _createCircle7_JustCreated();
    }

    /// @notice Circle 1: Fully active with all members joined and contributed
    function _createCircle1_FullyActive() internal {
        console2.log("[Circle 1: ACTIVE - Full operations]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"서울 직장인 계모임",
            contributionAmount: 0.01 ether,
            frequency: 604800, // 1 week
            totalRounds: 5,
            stakeRequired: 0.05 ether,
            penaltyRate: 1000,
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        // Wallet 0 creates and joins
        vm.startBroadcast(testWalletKeys[0]);
        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        GyeCircle circle = GyeCircle(payable(circleAddr));

        // Wallets 1-4 join (total 5 members)
        for (uint256 i = 1; i < 5; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.join{value: config.stakeRequired}();
            vm.stopBroadcast();
        }
        console2.log("  Members: 5/5 joined");

        // Start circle
        vm.startBroadcast(testWalletKeys[0]);
        circle.startCircle();
        vm.stopBroadcast();
        console2.log("  Status: ACTIVE");

        // All 5 members contribute
        for (uint256 i = 0; i < 5; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.contribute{value: config.contributionAmount}();
            vm.stopBroadcast();
        }
        console2.log("  Round 1: 5/5 contributed");
        console2.log("");
    }

    /// @notice Circle 2: Active with partial contributions (good for demo)
    function _createCircle2_PartialActive() internal {
        console2.log("[Circle 2: ACTIVE - Partial contributions]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"대학 동문 계",
            contributionAmount: 0.005 ether,
            frequency: 2592000, // 1 month
            totalRounds: 8,
            stakeRequired: 0.04 ether,
            penaltyRate: 500,
            payoutMethod: GyeLib.PayoutMethod.AUCTION
        });

        // Wallet 5 creates
        vm.startBroadcast(testWalletKeys[5]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        GyeCircle circle = GyeCircle(payable(circleAddr));

        // Wallets 6-11 join (total 7 members, need 8 for full)
        for (uint256 i = 6; i < 12; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.join{value: config.stakeRequired}();
            vm.stopBroadcast();
        }
        console2.log("  Members: 7/8 joined");

        // One more member to fill it
        vm.startBroadcast(testWalletKeys[0]);
        circle.join{value: config.stakeRequired}();
        vm.stopBroadcast();
        console2.log("  Members: 8/8 joined");

        // Start circle
        vm.startBroadcast(testWalletKeys[5]);
        circle.startCircle();
        vm.stopBroadcast();
        console2.log("  Status: ACTIVE");

        // Only 3 members contribute (partial)
        for (uint256 i = 5; i < 8; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.contribute{value: config.contributionAmount}();
            vm.stopBroadcast();
        }
        console2.log("  Round 1: 3/8 contributed (waiting for others)");
        console2.log("");
    }

    /// @notice Circle 3: Just created, FORMING state
    function _createCircle3_JustCreated() internal {
        console2.log("[Circle 3: FORMING - Just created]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"강남 부동산 스터디 계",
            contributionAmount: 0.02 ether,
            frequency: 604800,
            totalRounds: 10,
            stakeRequired: 0.1 ether,
            penaltyRate: 2000,
            payoutMethod: GyeLib.PayoutMethod.RANDOM
        });

        vm.startBroadcast(testWalletKeys[1]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        console2.log("  Members: 1/10 (creator only)");
        console2.log("  Status: FORMING");
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        console2.log("");
    }

    /// @notice Circle 4: Just created, different config
    function _createCircle4_JustCreated() internal {
        console2.log("[Circle 4: FORMING - Just created]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"20대 재테크 모임",
            contributionAmount: 0.002 ether,
            frequency: 604800,
            totalRounds: 4,
            stakeRequired: 0.01 ether,
            penaltyRate: 500,
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        vm.startBroadcast(testWalletKeys[2]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        console2.log("  Members: 1/4 (creator only)");
        console2.log("  Status: FORMING");
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        console2.log("");
    }

    /// @notice Circle 5: Monthly savings group
    function _createCircle5_JustCreated() internal {
        console2.log("[Circle 5: FORMING - Just created]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"월급쟁이 저축 계",
            contributionAmount: 0.008 ether,
            frequency: 2592000, // monthly
            totalRounds: 12,
            stakeRequired: 0.05 ether,
            penaltyRate: 1500,
            payoutMethod: GyeLib.PayoutMethod.AUCTION
        });

        vm.startBroadcast(testWalletKeys[3]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        console2.log("  Members: 1/12 (creator only)");
        console2.log("  Status: FORMING");
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        console2.log("");
    }

    /// @notice Circle 6: Small friend group
    function _createCircle6_JustCreated() internal {
        console2.log("[Circle 6: FORMING - Just created]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"친구들 소액 계",
            contributionAmount: 0.001 ether,
            frequency: 604800,
            totalRounds: 3,
            stakeRequired: 0.005 ether,
            penaltyRate: 1000,
            payoutMethod: GyeLib.PayoutMethod.RANDOM
        });

        vm.startBroadcast(testWalletKeys[4]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        console2.log("  Members: 1/3 (creator only)");
        console2.log("  Status: FORMING");
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        console2.log("");
    }

    /// @notice Circle 7: Premium high-value circle
    function _createCircle7_JustCreated() internal {
        console2.log("[Circle 7: FORMING - Just created]");

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: unicode"프리미엄 VIP 계",
            contributionAmount: 0.015 ether,
            frequency: 2592000,
            totalRounds: 6,
            stakeRequired: 0.08 ether,
            penaltyRate: 2500,
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        vm.startBroadcast(testWalletKeys[6]);
        (, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("  Created:", circleAddr);
        console2.log("  Members: 1/6 (creator only)");
        console2.log("  Status: FORMING");
        vm.stopBroadcast();

        createdCircles.push(circleAddr);
        console2.log("");
    }

    function _printSeedingSummary(address deployer) internal view {
        uint256 endBalance = deployer.balance;
        uint256 spent = startBalance - endBalance;

        console2.log("");
        console2.log("============================================");
        console2.log("   SEEDING COMPLETE - 7 CIRCLES");
        console2.log("============================================");
        console2.log("");

        console2.log("--- Circle Summary ---");
        console2.log("");

        for (uint256 i = 0; i < createdCircles.length; i++) {
            GyeCircle circle = GyeCircle(payable(createdCircles[i]));
            GyeLib.CircleConfig memory config = circle.getConfig();
            GyeLib.CircleStatus status = circle.getStatus();
            address[] memory members = circle.getMembers();

            string memory statusStr;
            if (status == GyeLib.CircleStatus.FORMING) statusStr = "FORMING";
            else if (status == GyeLib.CircleStatus.ACTIVE) statusStr = "ACTIVE";
            else statusStr = "COMPLETED";

            string memory methodStr;
            if (config.payoutMethod == GyeLib.PayoutMethod.FIXED_ORDER) methodStr = "FIXED";
            else if (config.payoutMethod == GyeLib.PayoutMethod.RANDOM) methodStr = "RANDOM";
            else methodStr = "AUCTION";

            console2.log("Circle", i + 1, ":", createdCircles[i]);
            console2.log("  Name:    ", config.name);
            console2.log("  Status:  ", statusStr);
            console2.log("  Method:  ", methodStr);
            console2.log("  Members: ", members.length, "/", config.totalRounds);
            console2.log("  Contrib: ", config.contributionAmount / 1e15, "mVERY");
            console2.log("  Stake:   ", config.stakeRequired / 1e15, "mVERY");
            console2.log("");
        }

        console2.log("--- Cost Summary ---");
        console2.log("Total Spent:", spent / 1e15, "mVERY");
        console2.log("");
    }
}
