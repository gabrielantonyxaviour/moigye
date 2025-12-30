// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeCircle} from "@/GyeCircle.sol";
import {GyeLib} from "@/libraries/GyeLib.sol";

/// @title MinimalSeed
/// @notice Minimal seeding with strict 0.1 VERY budget
/// @dev Only seeds Circle 0 with 2 additional members and contributions
contract MinimalSeed is Script {
    // Circle 0 address (already exists with 1 member)
    address constant CIRCLE_0 = 0x81fc634E39AcE2240eD68e3C108D979ecc77e3F1;

    // Circle 0 params
    uint256 constant STAKE = 0.001 ether;      // 0.001 VERY
    uint256 constant CONTRIBUTION = 0.0005 ether; // 0.0005 VERY

    // Budget tracking
    uint256 constant MAX_BUDGET = 0.1 ether;   // 0.1 VERY hard limit
    uint256 public totalSpent;
    uint256 public startBalance;

    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        startBalance = deployer.balance;

        console2.log("");
        console2.log("========================================");
        console2.log("  MINIMAL SEED - 0.1 VERY BUDGET");
        console2.log("========================================");
        console2.log("");
        console2.log("Deployer:", deployer);
        console2.log("Balance:", startBalance / 1e18, "VERY");
        console2.log("Budget:", MAX_BUDGET / 1e18, "VERY");
        console2.log("");

        // Generate 2 test wallets deterministically
        uint256 wallet1Key = uint256(keccak256(abi.encodePacked(deployerKey, "minimal_seed_1")));
        uint256 wallet2Key = uint256(keccak256(abi.encodePacked(deployerKey, "minimal_seed_2")));
        address wallet1 = vm.addr(wallet1Key);
        address wallet2 = vm.addr(wallet2Key);

        console2.log("Test Wallet 1:", wallet1);
        console2.log("Test Wallet 2:", wallet2);
        console2.log("");

        GyeCircle circle = GyeCircle(payable(CIRCLE_0));

        // Step 1: Fund wallets (only if needed)
        uint256 fundAmount = STAKE + CONTRIBUTION + 0.001 ether; // stake + contribution + gas buffer
        console2.log("--- Funding Wallets ---");
        console2.log("Fund amount per wallet:", fundAmount / 1e15, "mVERY");

        vm.startBroadcast(deployerKey);

        if (wallet1.balance < fundAmount) {
            (bool s1,) = wallet1.call{value: fundAmount}("");
            require(s1, "Fund 1 failed");
            console2.log("Funded wallet 1");
        }

        if (wallet2.balance < fundAmount) {
            (bool s2,) = wallet2.call{value: fundAmount}("");
            require(s2, "Fund 2 failed");
            console2.log("Funded wallet 2");
        }

        vm.stopBroadcast();

        // Check budget
        _checkBudget(deployer, "after funding");

        // Step 2: Join circle
        console2.log("");
        console2.log("--- Joining Circle 0 ---");

        vm.startBroadcast(wallet1Key);
        circle.join{value: STAKE}();
        console2.log("Wallet 1 joined (stake:", STAKE / 1e15, "mVERY)");
        vm.stopBroadcast();

        vm.startBroadcast(wallet2Key);
        circle.join{value: STAKE}();
        console2.log("Wallet 2 joined (stake:", STAKE / 1e15, "mVERY)");
        vm.stopBroadcast();

        _checkBudget(deployer, "after joins");

        // Step 3: Start circle (as creator - need to find creator)
        console2.log("");
        console2.log("--- Starting Circle ---");

        // The creator is the first member - we need their key
        // For now, let's check if we can start it
        address creator = circle.getMembers()[0];
        console2.log("Circle creator:", creator);
        console2.log("Current members:", circle.getMembers().length);

        // If deployer is creator, start it
        if (creator == deployer) {
            vm.startBroadcast(deployerKey);
            circle.startCircle();
            console2.log("Circle started!");
            vm.stopBroadcast();
        } else {
            console2.log("SKIP: Creator is not deployer, cannot start");
        }

        _checkBudget(deployer, "after start");

        // Step 4: Contribute (if circle is active)
        if (circle.getStatus() == GyeLib.CircleStatus.ACTIVE) {
            console2.log("");
            console2.log("--- Contributing ---");

            // Deployer contributes (if member)
            if (_isMember(circle, deployer)) {
                vm.startBroadcast(deployerKey);
                circle.contribute{value: CONTRIBUTION}();
                console2.log("Deployer contributed:", CONTRIBUTION / 1e15, "mVERY");
                vm.stopBroadcast();
            }

            vm.startBroadcast(wallet1Key);
            circle.contribute{value: CONTRIBUTION}();
            console2.log("Wallet 1 contributed:", CONTRIBUTION / 1e15, "mVERY");
            vm.stopBroadcast();

            vm.startBroadcast(wallet2Key);
            circle.contribute{value: CONTRIBUTION}();
            console2.log("Wallet 2 contributed:", CONTRIBUTION / 1e15, "mVERY");
            vm.stopBroadcast();
        }

        // Final report
        _printFinalReport(deployer);
    }

    function _checkBudget(address deployer, string memory stage) internal view {
        uint256 spent = startBalance - deployer.balance;
        console2.log("Spent at", stage);
        console2.log("  Amount:", spent / 1e15, "mVERY");

        require(spent <= MAX_BUDGET, "BUDGET EXCEEDED!");
    }

    function _isMember(GyeCircle circle, address addr) internal view returns (bool) {
        address[] memory members = circle.getMembers();
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == addr) return true;
        }
        return false;
    }

    function _printFinalReport(address deployer) internal view {
        uint256 spent = startBalance - deployer.balance;

        console2.log("");
        console2.log("========================================");
        console2.log("  SEED COMPLETE");
        console2.log("========================================");
        console2.log("");
        console2.log("Total spent:", spent / 1e15, "mVERY");
        console2.log("Budget used:", (spent * 100) / MAX_BUDGET, "%");
        console2.log("Remaining:", (deployer.balance) / 1e18, "VERY");
        console2.log("");

        if (spent <= MAX_BUDGET) {
            console2.log("STATUS: SUCCESS - Within budget!");
        } else {
            console2.log("STATUS: FAILED - Over budget!");
        }
    }
}
