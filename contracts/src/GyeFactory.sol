// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IGyeFactory} from "./interfaces/IGyeFactory.sol";
import {GyeLib} from "./libraries/GyeLib.sol";
import {GyeCircle} from "./GyeCircle.sol";
import {Clones} from "@openzeppelin/proxy/Clones.sol";

/// @title GyeFactory
/// @notice Factory contract to deploy and track 계 circles using minimal proxies
/// @dev Uses EIP-1167 clones for gas-efficient circle deployment
contract GyeFactory is IGyeFactory {
    // ============ State Variables ============

    /// @notice The implementation contract for GyeCircle clones
    address public immutable implementation;

    /// @notice Mapping of circleId to GyeCircle address
    mapping(uint256 => address) public circles;

    /// @notice Mapping of user address to their circle IDs
    mapping(address => uint256[]) public userCircles;

    /// @notice Total number of circles created
    uint256 public circleCount;

    // ============ Constructor ============

    constructor() {
        // Deploy the implementation contract once
        implementation = address(new GyeCircle());
    }

    // ============ External Functions ============

    /// @inheritdoc IGyeFactory
    function createCircle(GyeLib.CircleConfig calldata config)
        external
        returns (uint256 circleId, address circleAddress)
    {
        (circleId, circleAddress) = _createCircle(config);
    }

    /// @inheritdoc IGyeFactory
    function createAndJoinCircle(GyeLib.CircleConfig calldata config)
        external
        payable
        returns (uint256 circleId, address circleAddress)
    {
        (circleId, circleAddress) = _createCircle(config);

        // Join the creator as the first member (only stake required)
        if (msg.value < config.stakeRequired) revert GyeLib.InsufficientStake();

        GyeCircle(payable(circleAddress)).joinFor{value: msg.value}(msg.sender);
    }

    /// @dev Internal function to create a circle using clone
    function _createCircle(GyeLib.CircleConfig calldata config)
        internal
        returns (uint256 circleId, address circleAddress)
    {
        // Validate config
        if (bytes(config.name).length == 0) revert GyeLib.InvalidConfig();
        if (config.contributionAmount == 0) revert GyeLib.InvalidConfig();
        if (config.frequency == 0) revert GyeLib.InvalidConfig();
        if (config.totalRounds == 0) revert GyeLib.InvalidConfig();
        if (config.penaltyRate > 10000) revert GyeLib.InvalidConfig();

        // Increment circle count and assign ID
        circleId = circleCount++;

        // Clone the implementation (much cheaper than deploying new contract)
        circleAddress = Clones.clone(implementation);

        // Initialize the clone
        GyeCircle(payable(circleAddress)).initialize(
            circleId,
            msg.sender,
            config,
            address(this)
        );

        // Store circle address
        circles[circleId] = circleAddress;

        // Register creator in their circles
        userCircles[msg.sender].push(circleId);

        emit GyeLib.CircleCreated(
            circleId,
            msg.sender,
            config.name,
            circleAddress,
            config.contributionAmount,
            config.frequency,
            config.totalRounds,
            config.stakeRequired,
            config.penaltyRate,
            config.payoutMethod
        );
    }

    /// @inheritdoc IGyeFactory
    function getCircle(uint256 circleId) external view returns (address) {
        address circleAddr = circles[circleId];
        if (circleAddr == address(0)) revert GyeLib.CircleNotFound();
        return circleAddr;
    }

    /// @inheritdoc IGyeFactory
    function getUserCircles(address user) external view returns (uint256[] memory) {
        return userCircles[user];
    }

    /// @inheritdoc IGyeFactory
    function getCircleCount() external view returns (uint256) {
        return circleCount;
    }

    /// @inheritdoc IGyeFactory
    function registerUserCircle(uint256 circleId, address user) external {
        // Only allow registered circles to call this
        if (circles[circleId] != msg.sender) revert GyeLib.CircleNotFound();

        // Check if user is already registered for this circle
        uint256[] storage userCircleIds = userCircles[user];
        for (uint256 i = 0; i < userCircleIds.length; i++) {
            if (userCircleIds[i] == circleId) return; // Already registered
        }

        userCircles[user].push(circleId);
    }
}
