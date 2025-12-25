// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {GyeLib} from "../libraries/GyeLib.sol";

/// @title IGyeCircle
/// @notice Interface for individual 계 circle contracts
interface IGyeCircle {
    // ============ Member Functions ============

    /// @notice Join the circle with required stake
    /// @dev Must send stake + first contribution with the transaction
    function join() external payable;

    /// @notice Make a contribution for the current round
    function contribute() external payable;

    /// @notice Claim payout (for FIXED_ORDER method when it's your turn)
    function claimPayout() external;

    /// @notice Place a bid for the current round payout (AUCTION method)
    /// @param amount The bid amount (discount willing to give)
    function bid(uint256 amount) external;

    /// @notice Withdraw stake after circle completion
    function withdrawStake() external;

    // ============ Admin Functions ============

    /// @notice Start the circle (move from FORMING to ACTIVE)
    function startCircle() external;

    /// @notice Start a new contribution round
    function startRound() external;

    /// @notice Distribute round funds to the winner
    function distributeRound() external;

    /// @notice Slash a member for late/missing payment
    /// @param member The member to slash
    function slash(address member) external;

    // ============ View Functions ============

    /// @notice Get circle configuration
    function getConfig() external view returns (GyeLib.CircleConfig memory);

    /// @notice Get circle status
    function getStatus() external view returns (GyeLib.CircleStatus);

    /// @notice Get current round info
    function getCurrentRound() external view returns (GyeLib.Round memory);

    /// @notice Get member info
    /// @param member The member address
    function getMember(address member) external view returns (GyeLib.Member memory);

    /// @notice Get all members
    function getMembers() external view returns (address[] memory);

    /// @notice Check if address is a member
    function isMember(address addr) external view returns (bool);

    /// @notice Get the circle ID
    function circleId() external view returns (uint256);

    /// @notice Get the factory address
    function factory() external view returns (address);

    /// @notice Get total pool balance
    function getPoolBalance() external view returns (uint256);

    /// @notice Check if member has contributed this round
    function hasContributed(address member) external view returns (bool);

    /// @notice Get current highest bid (AUCTION method)
    function getHighestBid() external view returns (address bidder, uint256 amount);
}
