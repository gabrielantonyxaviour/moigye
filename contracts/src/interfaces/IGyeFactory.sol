// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {GyeLib} from "../libraries/GyeLib.sol";

/// @title IGyeFactory
/// @notice Interface for the GyeFactory contract
interface IGyeFactory {
    /// @notice Create a new 계 circle
    /// @param config The circle configuration
    /// @return circleId The ID of the newly created circle
    /// @return circleAddress The address of the deployed GyeCircle
    function createCircle(GyeLib.CircleConfig calldata config)
        external
        returns (uint256 circleId, address circleAddress);

    /// @notice Get the address of a circle by ID
    /// @param circleId The circle ID
    /// @return The circle contract address
    function getCircle(uint256 circleId) external view returns (address);

    /// @notice Get all circle IDs for a user
    /// @param user The user address
    /// @return Array of circle IDs the user is part of
    function getUserCircles(address user) external view returns (uint256[] memory);

    /// @notice Get the total number of circles created
    /// @return The circle count
    function getCircleCount() external view returns (uint256);

    /// @notice Register a user as part of a circle (called by GyeCircle)
    /// @param circleId The circle ID
    /// @param user The user address
    function registerUserCircle(uint256 circleId, address user) external;

    /// @notice Create a new 계 circle and join as the first member
    /// @param config The circle configuration
    /// @return circleId The ID of the newly created circle
    /// @return circleAddress The address of the deployed GyeCircle
    function createAndJoinCircle(GyeLib.CircleConfig calldata config)
        external
        payable
        returns (uint256 circleId, address circleAddress);
}
