// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title GyeLib
/// @notice Shared types and events for the Moigye ROSCA system
library GyeLib {
    // ============ Enums ============

    /// @notice Method for determining payout order
    enum PayoutMethod {
        AUCTION,      // Members bid for payout priority
        RANDOM,       // Random selection each round
        FIXED_ORDER   // First-come-first-served join order
    }

    /// @notice Circle lifecycle status
    enum CircleStatus {
        FORMING,    // Accepting members
        ACTIVE,     // Contribution rounds in progress
        COMPLETED   // All rounds finished
    }

    // ============ Structs ============

    /// @notice Configuration for creating a new circle
    struct CircleConfig {
        string name;
        uint256 contributionAmount;  // Amount per contribution in wei
        uint256 frequency;           // Time between rounds in seconds
        uint256 totalRounds;         // Total number of payout rounds
        uint256 stakeRequired;       // Stake amount required to join
        uint256 penaltyRate;         // Penalty rate in basis points (10000 = 100%)
        PayoutMethod payoutMethod;
    }

    /// @notice Member information within a circle
    struct Member {
        address addr;
        uint256 stakeDeposited;
        bool hasReceivedPayout;
        uint256 joinedAt;
        uint256 payoutOrder;         // For FIXED_ORDER method
    }

    /// @notice Round information
    struct Round {
        uint256 roundNumber;
        uint256 startTime;
        uint256 deadline;
        uint256 totalContributed;
        address winner;
        bool distributed;
    }

    // ============ Factory Events ============

    /// @notice Emitted when a new circle is created
    event CircleCreated(
        uint256 indexed circleId,
        address indexed creator,
        string name,
        address circleAddress,
        uint256 contributionAmount,
        uint256 frequency,
        uint256 totalRounds,
        uint256 stakeRequired,
        uint256 penaltyRate,
        PayoutMethod payoutMethod
    );

    // ============ Circle Events ============

    /// @notice Emitted when a member joins a circle
    event MemberJoined(
        uint256 indexed circleId,
        address indexed member,
        uint256 stake
    );

    /// @notice Emitted when a contribution is made
    event ContributionMade(
        uint256 indexed circleId,
        address indexed member,
        uint256 round,
        uint256 amount
    );

    /// @notice Emitted when payout is distributed
    event PayoutDistributed(
        uint256 indexed circleId,
        uint256 indexed round,
        address indexed winner,
        uint256 amount
    );

    /// @notice Emitted when a member is slashed
    event MemberSlashed(
        uint256 indexed circleId,
        address indexed member,
        uint256 penalty
    );

    /// @notice Emitted when a new round starts
    event RoundStarted(
        uint256 indexed circleId,
        uint256 indexed round,
        uint256 deadline
    );

    /// @notice Emitted when circle status changes
    event CircleStatusChanged(
        uint256 indexed circleId,
        CircleStatus newStatus
    );

    /// @notice Emitted when a bid is placed (AUCTION method)
    event BidPlaced(
        uint256 indexed circleId,
        uint256 indexed round,
        address indexed bidder,
        uint256 amount
    );

    /// @notice Emitted when stake is withdrawn
    event StakeWithdrawn(
        uint256 indexed circleId,
        address indexed member,
        uint256 amount
    );

    // ============ Errors ============

    error CircleNotFound();
    error CircleNotForming();
    error CircleNotActive();
    error CircleAlreadyActive();
    error AlreadyMember();
    error NotMember();
    error InsufficientStake();
    error InsufficientContribution();
    error RoundNotActive();
    error RoundDeadlinePassed();
    error RoundNotEnded();
    error AlreadyContributed();
    error AlreadyReceivedPayout();
    error PayoutAlreadyDistributed();
    error NoBidPlaced();
    error BidTooLow();
    error NotEligibleForPayout();
    error CircleNotCompleted();
    error InvalidConfig();
    error MaxMembersReached();
    error TransferFailed();
}
