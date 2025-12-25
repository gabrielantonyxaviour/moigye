// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {GyeFactory} from "@/GyeFactory.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployScript
/// @notice Main deployment script for Moigye (계) contracts
contract DeployScript is BaseScript {
    /// @notice Main deployment function
    function run() public returns (GyeFactory factory) {
        // Start deployment
        DeploymentConfig memory config = startDeployment();

        // Deploy GyeFactory
        factory = deployGyeFactory();
        saveDeployment("GyeFactory", address(factory));

        // End deployment
        endDeployment();

        // Log summary
        console2.log("\n=== DEPLOYMENT COMPLETE ===");
        console2.log("GyeFactory:", address(factory));
        console2.log("Chain ID:", block.chainid);

        return factory;
    }

    /// @notice Deploy GyeFactory
    function deployGyeFactory() internal returns (GyeFactory) {
        console2.log("\nDeploying GyeFactory...");

        GyeFactory factory = new GyeFactory();

        console2.log("GyeFactory deployed to:", address(factory));
        console2.log("Initial circle count:", factory.circleCount());

        return factory;
    }
}
