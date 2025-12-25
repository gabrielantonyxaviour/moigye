// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {GyeFactory} from "../../src/GyeFactory.sol";
import {GyeCircle} from "../../src/GyeCircle.sol";
import {GyeLib} from "../../src/libraries/GyeLib.sol";

contract GyeCircleTest is BaseTest {
    GyeFactory public factory;
    GyeCircle public circle;
    uint256 public circleId;

    uint256 constant CONTRIBUTION = 1 ether;
    uint256 constant STAKE = 0.5 ether;
    uint256 constant FREQUENCY = 1 days;
    uint256 constant TOTAL_ROUNDS = 3;
    uint256 constant PENALTY_RATE = 1000; // 10%

    function setUp() public override {
        super.setUp();
        factory = new GyeFactory();

        // Create circle as Alice with FIXED_ORDER payout using createAndJoinCircle
        GyeLib.CircleConfig memory config = GyeLib.CircleConfig({
            name: "Test Circle",
            contributionAmount: CONTRIBUTION,
            frequency: FREQUENCY,
            totalRounds: TOTAL_ROUNDS,
            stakeRequired: STAKE,
            penaltyRate: PENALTY_RATE,
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });

        vm.prank(ALICE);
        (circleId,) = factory.createAndJoinCircle{value: STAKE}(config);
        circle = GyeCircle(payable(factory.getCircle(circleId)));
    }

    // ============ Clone/Implementation Tests ============

    function test_implementationExists() public view {
        assertNotEq(factory.implementation(), address(0));
    }

    function test_circleIsClone() public view {
        // Circle should be initialized
        assertEq(circle.circleId(), circleId);
        assertEq(circle.creator(), ALICE);
        assertEq(circle.factory(), address(factory));
    }

    // ============ Join Tests ============

    function test_join() public {
        vm.prank(BOB);
        circle.join{value: STAKE}();

        assertTrue(circle.isMember(BOB));
        assertEq(circle.getMembers().length, 2); // Alice + Bob
    }

    function test_join_emitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit GyeLib.MemberJoined(circleId, BOB, STAKE);

        vm.prank(BOB);
        circle.join{value: STAKE}();
    }

    function test_join_refundsExcess() public {
        uint256 excess = 0.5 ether;
        uint256 bobBalanceBefore = BOB.balance;

        vm.prank(BOB);
        circle.join{value: STAKE + excess}();

        assertEq(BOB.balance, bobBalanceBefore - STAKE);
    }

    function test_join_revertAlreadyMember() public {
        vm.expectRevert(GyeLib.AlreadyMember.selector);
        vm.prank(ALICE);
        circle.join{value: STAKE}();
    }

    function test_join_revertInsufficientStake() public {
        vm.expectRevert(GyeLib.InsufficientStake.selector);
        vm.prank(BOB);
        circle.join{value: STAKE - 0.1 ether}(); // Insufficient stake
    }

    function test_join_revertMaxMembers() public {
        // Alice already joined, add 2 more to fill (3 total = TOTAL_ROUNDS)
        vm.prank(BOB);
        circle.join{value: STAKE}();
        vm.prank(CHARLIE);
        circle.join{value: STAKE}();

        address extra = createUser("Extra");
        vm.prank(extra);
        vm.expectRevert(GyeLib.MaxMembersReached.selector);
        circle.join{value: STAKE}();
    }

    // ============ Start Circle Tests ============

    function test_startCircle() public {
        vm.prank(BOB);
        circle.join{value: STAKE}();

        vm.prank(ALICE);
        circle.startCircle();

        assertEq(uint256(circle.getStatus()), uint256(GyeLib.CircleStatus.ACTIVE));
        assertEq(circle.getCurrentRound().roundNumber, 1);
    }

    function test_startCircle_emitsEvents() public {
        vm.prank(BOB);
        circle.join{value: STAKE}();

        vm.expectEmit(true, false, false, true);
        emit GyeLib.CircleStatusChanged(circleId, GyeLib.CircleStatus.ACTIVE);

        vm.prank(ALICE);
        circle.startCircle();
    }

    function test_startCircle_revertNotCreator() public {
        vm.prank(BOB);
        circle.join{value: STAKE}();

        vm.expectRevert("Only creator");
        vm.prank(BOB);
        circle.startCircle();
    }

    function test_startCircle_revertNotEnoughMembers() public {
        // Only Alice is member
        vm.expectRevert(GyeLib.InvalidConfig.selector);
        vm.prank(ALICE);
        circle.startCircle();
    }

    // ============ Contribute Tests ============

    function test_contribute() public {
        _startCircleWithMembers();

        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();

        assertTrue(circle.hasContributed(ALICE));
        assertEq(circle.getCurrentRound().totalContributed, CONTRIBUTION);
    }

    function test_contribute_emitsEvent() public {
        _startCircleWithMembers();

        vm.expectEmit(true, true, true, true);
        emit GyeLib.ContributionMade(circleId, ALICE, 1, CONTRIBUTION);

        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();
    }

    function test_contribute_revertNotMember() public {
        _startCircleWithMembers();

        vm.expectRevert(GyeLib.NotMember.selector);
        vm.prank(CHARLIE);
        circle.contribute{value: CONTRIBUTION}();
    }

    function test_contribute_revertAlreadyContributed() public {
        _startCircleWithMembers();

        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();

        vm.expectRevert(GyeLib.AlreadyContributed.selector);
        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();
    }

    function test_contribute_revertDeadlinePassed() public {
        _startCircleWithMembers();

        skip(FREQUENCY + 1);

        vm.expectRevert(GyeLib.RoundDeadlinePassed.selector);
        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();
    }

    // ============ Distribute Round Tests (Fixed Order) ============

    function test_distributeRound_fixedOrder() public {
        _startCircleWithMembers();

        // Both members contribute
        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();
        vm.prank(BOB);
        circle.contribute{value: CONTRIBUTION}();

        skip(FREQUENCY + 1);

        uint256 aliceBalanceBefore = ALICE.balance;

        // Distribute - Alice should win (first in order)
        circle.distributeRound();

        // Alice should receive 2 contributions
        assertEq(ALICE.balance, aliceBalanceBefore + (2 * CONTRIBUTION));
        assertTrue(circle.getMember(ALICE).hasReceivedPayout);
        assertTrue(circle.getCurrentRound().distributed);
        assertEq(circle.getCurrentRound().winner, ALICE);
    }

    function test_distributeRound_revertBeforeDeadline() public {
        _startCircleWithMembers();

        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();

        vm.expectRevert(GyeLib.RoundNotEnded.selector);
        circle.distributeRound();
    }

    function test_distributeRound_revertAlreadyDistributed() public {
        _startCircleWithMembers();
        _allContribute();
        skip(FREQUENCY + 1);
        circle.distributeRound();

        vm.expectRevert(GyeLib.PayoutAlreadyDistributed.selector);
        circle.distributeRound();
    }

    // ============ Slash Tests ============

    function test_slash() public {
        _startCircleWithMembers();

        // Only Alice contributes
        vm.prank(ALICE);
        circle.contribute{value: CONTRIBUTION}();

        skip(FREQUENCY + 1);

        uint256 bobStakeBefore = circle.getMember(BOB).stakeDeposited;

        vm.prank(ALICE);
        circle.slash(BOB);

        uint256 expectedPenalty = (bobStakeBefore * PENALTY_RATE) / 10000;
        assertEq(circle.getMember(BOB).stakeDeposited, bobStakeBefore - expectedPenalty);
    }

    function test_slash_emitsEvent() public {
        _startCircleWithMembers();
        skip(FREQUENCY + 1);

        uint256 bobStake = circle.getMember(BOB).stakeDeposited;
        uint256 expectedPenalty = (bobStake * PENALTY_RATE) / 10000;

        vm.expectEmit(true, true, false, true);
        emit GyeLib.MemberSlashed(circleId, BOB, expectedPenalty);

        vm.prank(ALICE);
        circle.slash(BOB);
    }

    function test_slash_revertNotCreator() public {
        _startCircleWithMembers();
        skip(FREQUENCY + 1);

        vm.expectRevert("Only creator");
        vm.prank(BOB);
        circle.slash(ALICE);
    }

    function test_slash_revertAlreadyContributed() public {
        _startCircleWithMembers();

        vm.prank(BOB);
        circle.contribute{value: CONTRIBUTION}();

        skip(FREQUENCY + 1);

        vm.expectRevert(GyeLib.AlreadyContributed.selector);
        vm.prank(ALICE);
        circle.slash(BOB);
    }

    // ============ Withdraw Stake Tests ============

    function test_withdrawStake() public {
        _completeAllRounds();

        uint256 aliceBalanceBefore = ALICE.balance;
        uint256 stake = circle.getMember(ALICE).stakeDeposited;

        vm.prank(ALICE);
        circle.withdrawStake();

        assertEq(ALICE.balance, aliceBalanceBefore + stake);
        assertEq(circle.getMember(ALICE).stakeDeposited, 0);
    }

    function test_withdrawStake_emitsEvent() public {
        _completeAllRounds();

        uint256 stake = circle.getMember(ALICE).stakeDeposited;

        vm.expectEmit(true, true, false, true);
        emit GyeLib.StakeWithdrawn(circleId, ALICE, stake);

        vm.prank(ALICE);
        circle.withdrawStake();
    }

    function test_withdrawStake_revertNotCompleted() public {
        _startCircleWithMembers();

        vm.expectRevert(GyeLib.CircleNotCompleted.selector);
        vm.prank(ALICE);
        circle.withdrawStake();
    }

    function test_withdrawStake_revertNoStake() public {
        _completeAllRounds();

        vm.prank(ALICE);
        circle.withdrawStake();

        vm.expectRevert(GyeLib.InsufficientStake.selector);
        vm.prank(ALICE);
        circle.withdrawStake();
    }

    // ============ Full Lifecycle Test ============

    function test_fullLifecycle() public {
        // Start with Alice already joined via createAndJoinCircle
        assertEq(circle.getMembers().length, 1);
        assertTrue(circle.isMember(ALICE));

        // Bob joins
        vm.prank(BOB);
        circle.join{value: STAKE}();

        // Charlie joins
        vm.prank(CHARLIE);
        circle.join{value: STAKE}();

        assertEq(circle.getMembers().length, 3);

        // Alice starts circle
        vm.prank(ALICE);
        circle.startCircle();
        assertEq(uint256(circle.getStatus()), uint256(GyeLib.CircleStatus.ACTIVE));

        // Round 1: All contribute, Alice gets payout
        _allContribute();
        skip(FREQUENCY + 1);
        circle.distributeRound();
        assertTrue(circle.getMember(ALICE).hasReceivedPayout);

        // Round 2: Start new round, Bob gets payout
        vm.prank(ALICE);
        circle.startRound();
        _allContribute();
        skip(FREQUENCY + 1);
        circle.distributeRound();
        assertTrue(circle.getMember(BOB).hasReceivedPayout);

        // Round 3: Final round, Charlie gets payout
        vm.prank(ALICE);
        circle.startRound();
        _allContribute();
        skip(FREQUENCY + 1);
        circle.distributeRound();
        assertTrue(circle.getMember(CHARLIE).hasReceivedPayout);

        // Circle should be completed
        assertEq(uint256(circle.getStatus()), uint256(GyeLib.CircleStatus.COMPLETED));

        // All can withdraw stakes
        vm.prank(ALICE);
        circle.withdrawStake();
        vm.prank(BOB);
        circle.withdrawStake();
        vm.prank(CHARLIE);
        circle.withdrawStake();

        // Pool should be empty
        assertEq(circle.getPoolBalance(), 0);
    }

    // ============ View Function Tests ============

    function test_getConfig() public view {
        GyeLib.CircleConfig memory config = circle.getConfig();
        assertEq(config.name, "Test Circle");
        assertEq(config.contributionAmount, CONTRIBUTION);
        assertEq(config.frequency, FREQUENCY);
        assertEq(config.totalRounds, TOTAL_ROUNDS);
        assertEq(config.stakeRequired, STAKE);
        assertEq(config.penaltyRate, PENALTY_RATE);
    }

    function test_getMember() public view {
        GyeLib.Member memory member = circle.getMember(ALICE);
        assertEq(member.addr, ALICE);
        assertEq(member.stakeDeposited, STAKE);
        assertFalse(member.hasReceivedPayout);
        assertEq(member.payoutOrder, 0);
    }

    // ============ Helpers ============

    function _startCircleWithMembers() internal {
        vm.prank(BOB);
        circle.join{value: STAKE}();
        vm.prank(ALICE);
        circle.startCircle();
    }

    function _allContribute() internal {
        address[] memory members = circle.getMembers();
        for (uint256 i = 0; i < members.length; i++) {
            if (!circle.hasContributed(members[i])) {
                vm.prank(members[i]);
                circle.contribute{value: CONTRIBUTION}();
            }
        }
    }

    function _completeAllRounds() internal {
        // Add members
        vm.prank(BOB);
        circle.join{value: STAKE}();
        vm.prank(CHARLIE);
        circle.join{value: STAKE}();

        // Start
        vm.prank(ALICE);
        circle.startCircle();

        // Complete all rounds
        for (uint256 round = 0; round < TOTAL_ROUNDS; round++) {
            if (round > 0) {
                vm.prank(ALICE);
                circle.startRound();
            }
            _allContribute();
            skip(FREQUENCY + 1);
            circle.distributeRound();
        }
    }
}
