// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

/// @title GenerateWallets
/// @notice Generate and display test wallets for Moigye seeding
/// @dev Wallets are deterministically derived from PRIVATE_KEY
contract GenerateWallets is Script {
    uint256 constant NUM_WALLETS = 12;

    function run() public view {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console2.log("");
        console2.log("============================================");
        console2.log("   MOIGYE TEST WALLETS");
        console2.log("============================================");
        console2.log("");
        console2.log("Deployer:", deployer);
        console2.log("Salt: moigye_mainnet_v3");
        console2.log("");
        console2.log("IMPORTANT: These wallets are deterministic.");
        console2.log("Same PRIVATE_KEY = Same wallets every time.");
        console2.log("");
        console2.log("--- Wallet Details ---");
        console2.log("");

        for (uint256 i = 1; i <= NUM_WALLETS; i++) {
            uint256 walletKey = uint256(
                keccak256(abi.encodePacked(deployerKey, "moigye_mainnet_v3", i))
            );
            address wallet = vm.addr(walletKey);

            console2.log("Wallet", i);
            console2.log("  Address:    ", wallet);
            console2.log("  Private Key:", vm.toString(bytes32(walletKey)));
            console2.log("");
        }

        console2.log("============================================");
        console2.log("Copy the above to a secure location!");
        console2.log("============================================");
    }
}
