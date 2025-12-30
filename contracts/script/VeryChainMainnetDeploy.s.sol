// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";
import {FreeMintNFT} from "@/FreeMintNFT.sol";

/// @title VeryChainMainnetDeploy
/// @notice Deploy Moigye contracts to VeryChain mainnet (or fork for testing)
/// @dev Run with: forge script script/VeryChainMainnetDeploy.s.sol --rpc-url verychain --broadcast
contract VeryChainMainnetDeploy is Script {
    // Chain ID constants
    uint256 constant VERYCHAIN_MAINNET = 4613;
    uint256 constant LOCAL_FORK = 31337;

    // Deployment tracking
    uint256 public startBalance;
    uint256 public gasUsed;

    // Deployed contracts
    GyeFactory public factory;
    FreeMintToken public testToken;
    FreeMintNFT public testNFT;

    /// @notice Main deployment entry point
    function run() public {
        _deploy(true, true);
    }

    /// @notice Deploy only GyeFactory (minimal deployment)
    function deployFactoryOnly() public {
        _deploy(false, false);
    }

    /// @notice Deploy with test tokens for demo purposes
    function deployWithTestTokens() public {
        _deploy(true, true);
    }

    /// @notice Internal deployment logic
    /// @param deployTestToken Whether to deploy FreeMintToken
    /// @param deployTestNFT Whether to deploy FreeMintNFT
    function _deploy(bool deployTestToken, bool deployTestNFT) internal {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Validate chain
        require(
            block.chainid == VERYCHAIN_MAINNET || block.chainid == LOCAL_FORK,
            "Must be VeryChain mainnet (4613) or local fork (31337)"
        );

        startBalance = deployer.balance;

        console2.log("");
        console2.log("============================================");
        console2.log("   MOIGYE VERYCHAIN MAINNET DEPLOYMENT");
        console2.log("============================================");
        console2.log("");
        console2.log("Chain ID:        ", block.chainid);
        console2.log("Deployer:        ", deployer);
        console2.log("Balance:         ", startBalance / 1e18, "VERY");
        console2.log("");

        vm.startBroadcast(deployerKey);

        // 1. Deploy GyeFactory (required)
        factory = _deployGyeFactory();

        // 2. Deploy test tokens (optional)
        if (deployTestToken) {
            testToken = _deployFreeMintToken();
        }

        if (deployTestNFT) {
            testNFT = _deployFreeMintNFT();
        }

        vm.stopBroadcast();

        // Report
        _printDeploymentSummary(deployer);
    }

    /// @notice Deploy GyeFactory
    function _deployGyeFactory() internal returns (GyeFactory) {
        console2.log("Deploying GyeFactory...");
        uint256 gasBefore = gasleft();

        GyeFactory _factory = new GyeFactory();

        uint256 gasAfter = gasleft();
        gasUsed += (gasBefore - gasAfter);

        console2.log("  Address:       ", address(_factory));
        console2.log("  Implementation:", _factory.implementation());
        console2.log("");

        return _factory;
    }

    /// @notice Deploy FreeMintToken (for testing)
    function _deployFreeMintToken() internal returns (FreeMintToken) {
        console2.log("Deploying FreeMintToken...");
        uint256 gasBefore = gasleft();

        FreeMintToken token = new FreeMintToken(
            "Moigye Test Token",
            "MTK",
            1000 ether // maxMintPerTx
        );

        uint256 gasAfter = gasleft();
        gasUsed += (gasBefore - gasAfter);

        console2.log("  Address:       ", address(token));
        console2.log("  Symbol:        ", token.symbol());
        console2.log("");

        return token;
    }

    /// @notice Deploy FreeMintNFT (for testing)
    function _deployFreeMintNFT() internal returns (FreeMintNFT) {
        console2.log("Deploying FreeMintNFT...");
        uint256 gasBefore = gasleft();

        FreeMintNFT nft = new FreeMintNFT(
            "Moigye Test NFT",
            "MNFT",
            10000, // maxSupply
            100, // maxPerWallet
            "https://api.moigye.io/nft/"
        );

        uint256 gasAfter = gasleft();
        gasUsed += (gasBefore - gasAfter);

        console2.log("  Address:       ", address(nft));
        console2.log("  Symbol:        ", nft.symbol());
        console2.log("");

        return nft;
    }

    /// @notice Print deployment summary
    function _printDeploymentSummary(address deployer) internal view {
        uint256 endBalance = deployer.balance;
        uint256 spent = startBalance - endBalance;

        console2.log("");
        console2.log("============================================");
        console2.log("   DEPLOYMENT COMPLETE");
        console2.log("============================================");
        console2.log("");
        console2.log("--- Deployed Contracts ---");
        console2.log("GyeFactory:      ", address(factory));

        if (address(testToken) != address(0)) {
            console2.log("FreeMintToken:   ", address(testToken));
        }
        if (address(testNFT) != address(0)) {
            console2.log("FreeMintNFT:     ", address(testNFT));
        }

        console2.log("");
        console2.log("--- Cost Summary ---");
        console2.log("Starting Balance:", startBalance / 1e18, "VERY");
        console2.log("Ending Balance:  ", endBalance / 1e18, "VERY");
        console2.log("Total Spent:     ", spent / 1e15, "mVERY");
        console2.log("Gas Used:        ", gasUsed);
        console2.log("");

        // Provide next steps
        console2.log("--- Next Steps ---");
        console2.log("1. Save the GyeFactory address to frontend config");
        console2.log("2. Run VeryChainMainnetSeed to create test circles");
        console2.log("3. Deploy subgraphs pointing to factory address");
        console2.log("");
    }
}
