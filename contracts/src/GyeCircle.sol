// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IGyeCircle} from "./interfaces/IGyeCircle.sol";
import {IGyeFactory} from "./interfaces/IGyeFactory.sol";
import {GyeLib} from "./libraries/GyeLib.sol";

/// @title GyeCircle
/// @notice Individual 계 instance with ROSCA logic (Clone-compatible)
/// @dev Uses initializer pattern for EIP-1167 minimal proxy compatibility
contract GyeCircle is IGyeCircle {
    // ============ State Variables ============

    uint256 public circleId;
    address public factory;
    address public creator;
    bool private _initialized;
    uint256 private _reentrancyStatus;

    GyeLib.CircleConfig private _config;
    GyeLib.CircleStatus private _status;
    GyeLib.Round private _currentRound;

    address[] private _memberAddresses;
    mapping(address => GyeLib.Member) private _members;
    mapping(address => bool) private _isMember;
    mapping(uint256 => mapping(address => bool)) private _roundContributions;
    mapping(uint256 => mapping(address => uint256)) private _roundBids;

    address private _highestBidder;
    uint256 private _highestBid;
    uint256 private _nextPayoutIndex;

    // ============ Constants ============
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    // ============ Modifiers ============

    modifier nonReentrant() {
        require(_reentrancyStatus != ENTERED, "ReentrancyGuard: reentrant call");
        _reentrancyStatus = ENTERED;
        _;
        _reentrancyStatus = NOT_ENTERED;
    }

    modifier onlyMember() {
        if (!_isMember[msg.sender]) revert GyeLib.NotMember();
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier inStatus(GyeLib.CircleStatus status) {
        if (_status != status) {
            if (status == GyeLib.CircleStatus.FORMING) revert GyeLib.CircleNotForming();
            if (status == GyeLib.CircleStatus.ACTIVE) revert GyeLib.CircleNotActive();
            if (status == GyeLib.CircleStatus.COMPLETED) revert GyeLib.CircleNotCompleted();
        }
        _;
    }

    // ============ Initializer ============

    /// @notice Initialize the circle (called by factory after cloning)
    /// @param _circleId The unique ID for this circle
    /// @param _creator The address that created this circle
    /// @param config The circle configuration
    /// @param _factory The factory contract address
    function initialize(
        uint256 _circleId,
        address _creator,
        GyeLib.CircleConfig calldata config,
        address _factory
    ) external {
        require(!_initialized, "Already initialized");
        _initialized = true;
        _reentrancyStatus = NOT_ENTERED;

        circleId = _circleId;
        creator = _creator;
        factory = _factory;
        _config = config;
        _status = GyeLib.CircleStatus.FORMING;
    }

    // ============ Member Functions ============

    /// @inheritdoc IGyeCircle
    function join() external payable inStatus(GyeLib.CircleStatus.FORMING) nonReentrant {
        if (_isMember[msg.sender]) revert GyeLib.AlreadyMember();
        if (_memberAddresses.length >= _config.totalRounds) revert GyeLib.MaxMembersReached();

        if (msg.value < _config.stakeRequired) revert GyeLib.InsufficientStake();

        _isMember[msg.sender] = true;
        _memberAddresses.push(msg.sender);

        _members[msg.sender] = GyeLib.Member({
            addr: msg.sender,
            stakeDeposited: _config.stakeRequired,
            hasReceivedPayout: false,
            joinedAt: block.timestamp,
            payoutOrder: _memberAddresses.length - 1
        });

        IGyeFactory(factory).registerUserCircle(circleId, msg.sender);

        emit GyeLib.MemberJoined(circleId, msg.sender, _config.stakeRequired);

        if (msg.value > _config.stakeRequired) {
            (bool success,) = msg.sender.call{value: msg.value - _config.stakeRequired}("");
            if (!success) revert GyeLib.TransferFailed();
        }
    }

    /// @notice Join a member on their behalf (only callable by factory)
    function joinFor(address member) external payable onlyFactory inStatus(GyeLib.CircleStatus.FORMING) nonReentrant {
        if (_isMember[member]) revert GyeLib.AlreadyMember();
        if (_memberAddresses.length >= _config.totalRounds) revert GyeLib.MaxMembersReached();

        if (msg.value < _config.stakeRequired) revert GyeLib.InsufficientStake();

        _isMember[member] = true;
        _memberAddresses.push(member);

        _members[member] = GyeLib.Member({
            addr: member,
            stakeDeposited: _config.stakeRequired,
            hasReceivedPayout: false,
            joinedAt: block.timestamp,
            payoutOrder: _memberAddresses.length - 1
        });

        IGyeFactory(factory).registerUserCircle(circleId, member);

        emit GyeLib.MemberJoined(circleId, member, _config.stakeRequired);

        if (msg.value > _config.stakeRequired) {
            (bool success,) = member.call{value: msg.value - _config.stakeRequired}("");
            if (!success) revert GyeLib.TransferFailed();
        }
    }

    /// @inheritdoc IGyeCircle
    function contribute() external payable onlyMember inStatus(GyeLib.CircleStatus.ACTIVE) nonReentrant {
        if (_currentRound.distributed) revert GyeLib.RoundNotActive();
        if (block.timestamp > _currentRound.deadline) revert GyeLib.RoundDeadlinePassed();
        if (_roundContributions[_currentRound.roundNumber][msg.sender]) revert GyeLib.AlreadyContributed();
        if (msg.value < _config.contributionAmount) revert GyeLib.InsufficientContribution();

        _roundContributions[_currentRound.roundNumber][msg.sender] = true;
        _currentRound.totalContributed += _config.contributionAmount;

        emit GyeLib.ContributionMade(circleId, msg.sender, _currentRound.roundNumber, _config.contributionAmount);

        if (msg.value > _config.contributionAmount) {
            (bool success,) = msg.sender.call{value: msg.value - _config.contributionAmount}("");
            if (!success) revert GyeLib.TransferFailed();
        }
    }

    /// @inheritdoc IGyeCircle
    function claimPayout() external onlyMember inStatus(GyeLib.CircleStatus.ACTIVE) nonReentrant {
        if (_config.payoutMethod != GyeLib.PayoutMethod.FIXED_ORDER) revert GyeLib.NotEligibleForPayout();
        if (_members[msg.sender].hasReceivedPayout) revert GyeLib.AlreadyReceivedPayout();
        if (_members[msg.sender].payoutOrder != _nextPayoutIndex) revert GyeLib.NotEligibleForPayout();
        if (block.timestamp <= _currentRound.deadline) revert GyeLib.RoundNotEnded();
        if (_currentRound.distributed) revert GyeLib.PayoutAlreadyDistributed();

        _distributePayout(msg.sender);
    }

    /// @inheritdoc IGyeCircle
    function bid(uint256 amount) external onlyMember inStatus(GyeLib.CircleStatus.ACTIVE) {
        if (_config.payoutMethod != GyeLib.PayoutMethod.AUCTION) revert GyeLib.NotEligibleForPayout();
        if (_members[msg.sender].hasReceivedPayout) revert GyeLib.AlreadyReceivedPayout();
        if (block.timestamp > _currentRound.deadline) revert GyeLib.RoundDeadlinePassed();
        if (amount <= _highestBid) revert GyeLib.BidTooLow();

        _highestBidder = msg.sender;
        _highestBid = amount;
        _roundBids[_currentRound.roundNumber][msg.sender] = amount;

        emit GyeLib.BidPlaced(circleId, _currentRound.roundNumber, msg.sender, amount);
    }

    /// @inheritdoc IGyeCircle
    function withdrawStake() external onlyMember inStatus(GyeLib.CircleStatus.COMPLETED) nonReentrant {
        uint256 stake = _members[msg.sender].stakeDeposited;
        if (stake == 0) revert GyeLib.InsufficientStake();

        _members[msg.sender].stakeDeposited = 0;

        (bool success,) = msg.sender.call{value: stake}("");
        if (!success) revert GyeLib.TransferFailed();

        emit GyeLib.StakeWithdrawn(circleId, msg.sender, stake);
    }

    // ============ Admin Functions ============

    /// @inheritdoc IGyeCircle
    function startCircle() external onlyCreator inStatus(GyeLib.CircleStatus.FORMING) {
        if (_memberAddresses.length < 2) revert GyeLib.InvalidConfig();

        _status = GyeLib.CircleStatus.ACTIVE;
        emit GyeLib.CircleStatusChanged(circleId, _status);

        _startNewRound();
    }

    /// @inheritdoc IGyeCircle
    function startRound() external onlyCreator inStatus(GyeLib.CircleStatus.ACTIVE) {
        if (!_currentRound.distributed && _currentRound.roundNumber > 0) revert GyeLib.PayoutAlreadyDistributed();
        _startNewRound();
    }

    /// @inheritdoc IGyeCircle
    function distributeRound() external inStatus(GyeLib.CircleStatus.ACTIVE) nonReentrant {
        if (_currentRound.distributed) revert GyeLib.PayoutAlreadyDistributed();
        if (block.timestamp <= _currentRound.deadline) revert GyeLib.RoundNotEnded();

        address winner;
        if (_config.payoutMethod == GyeLib.PayoutMethod.AUCTION) {
            if (_highestBidder == address(0)) revert GyeLib.NoBidPlaced();
            winner = _highestBidder;
        } else if (_config.payoutMethod == GyeLib.PayoutMethod.RANDOM) {
            winner = _selectRandomWinner();
        } else {
            winner = _memberAddresses[_nextPayoutIndex];
        }

        _distributePayout(winner);
    }

    /// @inheritdoc IGyeCircle
    function slash(address member) external onlyCreator inStatus(GyeLib.CircleStatus.ACTIVE) nonReentrant {
        if (!_isMember[member]) revert GyeLib.NotMember();
        if (_roundContributions[_currentRound.roundNumber][member]) revert GyeLib.AlreadyContributed();
        if (block.timestamp <= _currentRound.deadline) revert GyeLib.RoundNotEnded();

        uint256 penalty = (_members[member].stakeDeposited * _config.penaltyRate) / 10000;
        _members[member].stakeDeposited -= penalty;

        emit GyeLib.MemberSlashed(circleId, member, penalty);
    }

    // ============ Internal Functions ============

    function _startNewRound() internal {
        _currentRound = GyeLib.Round({
            roundNumber: _currentRound.roundNumber + 1,
            startTime: block.timestamp,
            deadline: block.timestamp + _config.frequency,
            totalContributed: 0,
            winner: address(0),
            distributed: false
        });
        _highestBidder = address(0);
        _highestBid = 0;

        emit GyeLib.RoundStarted(circleId, _currentRound.roundNumber, _currentRound.deadline);
    }

    function _distributePayout(address winner) internal {
        uint256 payout = _currentRound.totalContributed;
        if (_config.payoutMethod == GyeLib.PayoutMethod.AUCTION && _highestBid > 0) {
            payout -= _highestBid;
        }

        _currentRound.winner = winner;
        _currentRound.distributed = true;
        _members[winner].hasReceivedPayout = true;
        _nextPayoutIndex++;

        (bool success,) = winner.call{value: payout}("");
        if (!success) revert GyeLib.TransferFailed();

        emit GyeLib.PayoutDistributed(circleId, _currentRound.roundNumber, winner, payout);

        if (_currentRound.roundNumber >= _config.totalRounds) {
            _status = GyeLib.CircleStatus.COMPLETED;
            emit GyeLib.CircleStatusChanged(circleId, _status);
        }
    }

    function _selectRandomWinner() internal view returns (address) {
        address[] memory eligible = new address[](_memberAddresses.length);
        uint256 count = 0;
        for (uint256 i = 0; i < _memberAddresses.length; i++) {
            if (!_members[_memberAddresses[i]].hasReceivedPayout) {
                eligible[count++] = _memberAddresses[i];
            }
        }
        require(count > 0, "No eligible winners");
        uint256 idx = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, count))) % count;
        return eligible[idx];
    }

    // ============ View Functions ============

    function getConfig() external view returns (GyeLib.CircleConfig memory) { return _config; }
    function getStatus() external view returns (GyeLib.CircleStatus) { return _status; }
    function getCurrentRound() external view returns (GyeLib.Round memory) { return _currentRound; }
    function getMember(address member) external view returns (GyeLib.Member memory) { return _members[member]; }
    function getMembers() external view returns (address[] memory) { return _memberAddresses; }
    function isMember(address addr) external view returns (bool) { return _isMember[addr]; }
    function getPoolBalance() external view returns (uint256) { return address(this).balance; }
    function hasContributed(address member) external view returns (bool) {
        return _roundContributions[_currentRound.roundNumber][member];
    }
    function getHighestBid() external view returns (address bidder, uint256 amount) {
        return (_highestBidder, _highestBid);
    }

    receive() external payable {}
}
