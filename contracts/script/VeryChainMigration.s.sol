// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {GyeCircle} from "@/GyeCircle.sol";
import {GyeLib} from "@/libraries/GyeLib.sol";

/// @title VeryChainMigration
/// @notice Deploy and test Moigye on VeryChain mainnet
contract VeryChainMigration is Script {
    uint256 constant VERYCHAIN_ID = 4613;

    // Budget tracking (in wei)
    uint256 public totalGasUsed;
    uint256 public startBalance;

    // Deployed contracts
    GyeFactory public factory;

    // Test wallets (derived from deployer key + index)
    address[] public testWallets;
    uint256[] public testWalletKeys;

    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Allow both VeryChain mainnet (4613) and local fork (31337)
        require(block.chainid == VERYCHAIN_ID || block.chainid == 31337, "Not VeryChain or fork");

        startBalance = deployer.balance;
        console2.log("\n=== VERYCHAIN MAINNET MIGRATION ===");
        console2.log("Deployer:", deployer);
        console2.log("Starting balance:", startBalance / 1e18, "VERY");

        vm.startBroadcast(deployerKey);

        // Step 1: Deploy GyeFactory
        _deployFactory();

        // Step 2: Generate and fund test wallets
        _generateWallets(deployerKey);
        _fundWallets();

        vm.stopBroadcast();

        // Step 3: Create circles and perform operations (each wallet broadcasts separately)
        _createAndOperateCircles();

        // Final report
        _reportGasUsage(deployer);
    }

    function _deployFactory() internal {
        console2.log("\n--- Deploying GyeFactory ---");
        uint256 gasBefore = gasleft();

        factory = new GyeFactory();

        uint256 gasUsed = gasBefore - gasleft();
        totalGasUsed += gasUsed;

        console2.log("GyeFactory deployed:", address(factory));
        console2.log("Implementation:", factory.implementation());
        console2.log("Gas used:", gasUsed);
    }

    function _generateWallets(uint256 deployerKey) internal {
        console2.log("\n--- Generating 10 Test Wallets ---");

        for (uint256 i = 1; i <= 10; i++) {
            // Derive wallet from deployer key + salt
            uint256 walletKey = uint256(keccak256(abi.encodePacked(deployerKey, "moigye_test", i)));
            address wallet = vm.addr(walletKey);

            testWalletKeys.push(walletKey);
            testWallets.push(wallet);

            console2.log("Wallet", i, ":", wallet);
        }
    }

    function _fundWallets() internal {
        console2.log("\n--- Funding Test Wallets ---");

        // Each wallet needs: stake (0.01 VERY) + contributions (0.001 VERY * 5 rounds) + gas
        // Estimate: 0.02 VERY per wallet should be enough
        uint256 fundAmount = 0.02 ether; // 0.02 VERY per wallet

        for (uint256 i = 0; i < testWallets.length; i++) {
            (bool success,) = testWallets[i].call{value: fundAmount}("");
            require(success, "Funding failed");
            console2.log("Funded wallet", i + 1, "with 0.02 VERY");
        }

        console2.log("Total funding:", fundAmount * 10 / 1e18, "VERY");
    }

    function _createAndOperateCircles() internal {
        console2.log("\n--- Creating Circles and Operations ---");

        // Circle 1: Small circle (3 members) - FIXED_ORDER
        _createCircle1();

        // Circle 2: Medium circle (5 members) - RANDOM
        _createCircle2();

        // Circle 3: Large circle (10 members) - AUCTION
        _createCircle3();
    }

    function _createCircle1() internal {
        console2.log("\n[Circle 1: Fixed Order - 3 members]");

        // Wallet 0 creates the circle and joins
        vm.startBroadcast(testWalletKeys[0]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Test Circle 1",
            contributionAmount: 0.001 ether,  // 0.001 VERY per round
            frequency: 60,                     // 1 minute rounds for testing
            totalRounds: 3,                    // 3 rounds = 3 members
            stakeRequired: 0.005 ether,        // 0.005 VERY stake
            penaltyRate: 1000,                 // 10% penalty
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: config.stakeRequired}(config);
        console2.log("Circle created:", circleId, "at", circleAddr);

        vm.stopBroadcast();

        // Wallets 1 and 2 join
        GyeCircle circle = GyeCircle(payable(circleAddr));

        for (uint256 i = 1; i < 3; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.join{value: config.stakeRequired}();
            console2.log("Wallet", i + 1, "joined circle 1");
            vm.stopBroadcast();
        }

        // Creator starts the circle
        vm.startBroadcast(testWalletKeys[0]);
        circle.startCircle();
        console2.log("Circle 1 started");
        vm.stopBroadcast();

        // All members contribute to round 1
        for (uint256 i = 0; i < 3; i++) {
            vm.startBroadcast(testWalletKeys[i]);
            circle.contribute{value: config.contributionAmount}();
            console2.log("Wallet", i + 1, "contributed to round 1");
            vm.stopBroadcast();
        }

        console2.log("Circle 1 setup complete - members contributed");
    }

    function _createCircle2() internal {
        console2.log("\n[Circle 2: Random - 5 members]");

        // Wallet 3 creates the circle
        vm.startBroadcast(testWalletKeys[3]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Random Circle",
            contributionAmount: 0.0005 ether, // 0.0005 VERY per round
            frequency: 120,                   // 2 minute rounds
            totalRounds: 5,                   // 5 rounds
            stakeRequired: 0.003 ether,       // 0.003 VERY stake
            penaltyRate: 500,                 // 5% penalty
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
            console2.log("Wallet", i + 1, "joined circle 2");
            vm.stopBroadcast();
        }

        console2.log("Circle 2 setup complete - ready to start");
    }

    function _createCircle3() internal {
        console2.log("\n[Circle 3: Auction - All 10 members]");

        // Wallet 8 creates the circle
        vm.startBroadcast(testWalletKeys[8]);

        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Moigye Auction Circle",
            contributionAmount: 0.0002 ether, // 0.0002 VERY per round
            frequency: 180,                   // 3 minute rounds
            totalRounds: 10,                  // 10 rounds for 10 members
            stakeRequired: 0.002 ether,       // 0.002 VERY stake
            penaltyRate: 2000,                // 20% penalty
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
            console2.log("Wallet", i + 1, "joined circle 3");
            vm.stopBroadcast();
        }

        console2.log("Circle 3 setup complete - all 10 members joined");
    }

    function _reportGasUsage(address deployer) internal view {
        uint256 endBalance = deployer.balance;
        uint256 spent = startBalance - endBalance;

        console2.log("\n=== MIGRATION COMPLETE ===");
        console2.log("Factory address:", address(factory));
        console2.log("Total circles created:", factory.circleCount());
        console2.log("");
        console2.log("--- Cost Report ---");
        console2.log("Starting balance:", startBalance / 1e18, "VERY");
        console2.log("Ending balance:", endBalance / 1e18, "VERY");
        console2.log("Total spent:", spent / 1e18, "VERY");
        console2.log("Remaining:", endBalance / 1e18, "VERY");

        if (spent <= 5 ether) {
            console2.log("STATUS: Within 5 VERY budget!");
        } else {
            console2.log("STATUS: EXCEEDED 5 VERY budget by", (spent - 5 ether) / 1e18, "VERY");
        }
    }
}
