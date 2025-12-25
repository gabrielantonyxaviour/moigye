// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {GyeFactory} from "../../src/GyeFactory.sol";
import {GyeCircle} from "../../src/GyeCircle.sol";
import {GyeLib} from "../../src/libraries/GyeLib.sol";

contract GyeFactoryTest is BaseTest {
    GyeFactory public factory;

    uint256 constant CONTRIBUTION = 1 ether;
    uint256 constant STAKE = 0.5 ether;

    function setUp() public override {
        super.setUp();
        factory = new GyeFactory();
    }

    function _createDefaultConfig() internal pure returns (GyeLib.CircleConfig memory) {
        return GyeLib.CircleConfig({
            name: "Test Circle",
            contributionAmount: CONTRIBUTION,
            frequency: 30 days,
            totalRounds: 5,
            stakeRequired: STAKE,
            penaltyRate: 1000, // 10%
            payoutMethod: GyeLib.PayoutMethod.FIXED_ORDER
        });
    }

    // ============ Implementation Tests ============

    function test_implementationDeployed() public view {
        assertNotEq(factory.implementation(), address(0));
    }

    function test_implementationIsGyeCircle() public view {
        // Verify implementation has code
        assertTrue(factory.implementation().code.length > 0);
    }

    // ============ Create Circle Tests ============

    function test_createCircle() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        (uint256 circleId, address circleAddr) = factory.createCircle(config);

        assertEq(circleId, 0);
        assertNotEq(circleAddr, address(0));
        assertEq(factory.getCircle(0), circleAddr);
        assertEq(factory.getCircleCount(), 1);
    }

    function test_createCircle_isClone() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        (, address circleAddr) = factory.createCircle(config);

        // Clone should have minimal code (just proxy bytecode)
        // Implementation should have more code
        assertTrue(circleAddr.code.length < factory.implementation().code.length);
    }

    function test_createCircle_emitsEvent() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.expectEmit(true, true, false, false);
        emit GyeLib.CircleCreated(
            0,
            ALICE,
            "",
            address(0),
            0,
            0,
            0,
            0,
            0,
            GyeLib.PayoutMethod.AUCTION
        );

        factory.createCircle(config);
    }

    function test_createCircle_registersUserCircle() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        factory.createCircle(config);

        uint256[] memory userCircles = factory.getUserCircles(ALICE);
        assertEq(userCircles.length, 1);
        assertEq(userCircles[0], 0);
    }

    function test_createCircle_initializesCircle() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        (uint256 circleId, address circleAddr) = factory.createCircle(config);

        GyeCircle circle = GyeCircle(payable(circleAddr));
        assertEq(circle.circleId(), circleId);
        assertEq(circle.creator(), ALICE);
        assertEq(circle.factory(), address(factory));
        assertEq(uint256(circle.getStatus()), uint256(GyeLib.CircleStatus.FORMING));
    }

    function test_createCircle_multipleCircles() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.prank(ALICE);
        (uint256 id1,) = factory.createCircle(config);

        vm.prank(BOB);
        (uint256 id2,) = factory.createCircle(config);

        assertEq(id1, 0);
        assertEq(id2, 1);
        assertEq(factory.getCircleCount(), 2);
    }

    // ============ Create And Join Circle Tests ============

    function test_createAndJoinCircle() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.prank(ALICE);
        (uint256 circleId, address circleAddr) = factory.createAndJoinCircle{value: STAKE}(config);

        GyeCircle circle = GyeCircle(payable(circleAddr));

        assertEq(circleId, 0);
        assertTrue(circle.isMember(ALICE));
        assertEq(circle.getMembers().length, 1);
    }

    function test_createAndJoinCircle_refundsExcess() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        uint256 excess = 1 ether;
        uint256 aliceBalanceBefore = ALICE.balance;

        vm.prank(ALICE);
        factory.createAndJoinCircle{value: STAKE + excess}(config);

        assertEq(ALICE.balance, aliceBalanceBefore - STAKE);
    }

    function test_createAndJoinCircle_revertInsufficientValue() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.prank(ALICE);
        vm.expectRevert(GyeLib.InsufficientStake.selector);
        factory.createAndJoinCircle{value: STAKE - 0.1 ether}(config); // Insufficient stake
    }

    function test_createAndJoinCircle_registersUserCircle() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.prank(ALICE);
        factory.createAndJoinCircle{value: STAKE}(config);

        uint256[] memory userCircles = factory.getUserCircles(ALICE);
        assertEq(userCircles.length, 1);
    }

    // ============ Validation Tests ============

    function test_createCircle_revertInvalidName() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        config.name = "";

        vm.expectRevert(GyeLib.InvalidConfig.selector);
        factory.createCircle(config);
    }

    function test_createCircle_revertInvalidContribution() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        config.contributionAmount = 0;

        vm.expectRevert(GyeLib.InvalidConfig.selector);
        factory.createCircle(config);
    }

    function test_createCircle_revertInvalidFrequency() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        config.frequency = 0;

        vm.expectRevert(GyeLib.InvalidConfig.selector);
        factory.createCircle(config);
    }

    function test_createCircle_revertInvalidTotalRounds() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        config.totalRounds = 0;

        vm.expectRevert(GyeLib.InvalidConfig.selector);
        factory.createCircle(config);
    }

    function test_createCircle_revertInvalidPenaltyRate() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        config.penaltyRate = 10001; // > 100%

        vm.expectRevert(GyeLib.InvalidConfig.selector);
        factory.createCircle(config);
    }

    // ============ View Function Tests ============

    function test_getCircle_revertNotFound() public {
        vm.expectRevert(GyeLib.CircleNotFound.selector);
        factory.getCircle(999);
    }

    function test_getUserCircles_empty() public view {
        uint256[] memory circles = factory.getUserCircles(ALICE);
        assertEq(circles.length, 0);
    }

    function test_getCircleCount_initial() public view {
        assertEq(factory.getCircleCount(), 0);
    }

    // ============ Register User Circle Tests ============

    function test_registerUserCircle_onlyCircle() public asUser(ALICE) {
        GyeLib.CircleConfig memory config = _createDefaultConfig();
        factory.createCircle(config);

        // Try to call from non-circle address
        vm.expectRevert(GyeLib.CircleNotFound.selector);
        factory.registerUserCircle(0, BOB);
    }

    function test_registerUserCircle_worksFromCircle() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        vm.prank(ALICE);
        (, address circleAddr) = factory.createCircle(config);

        // Bob joins the circle
        vm.prank(BOB);
        GyeCircle(payable(circleAddr)).join{value: STAKE}();

        // Bob should be registered
        uint256[] memory bobCircles = factory.getUserCircles(BOB);
        assertEq(bobCircles.length, 1);
        assertEq(bobCircles[0], 0);
    }

    // ============ Gas Comparison Test ============

    function test_gasEfficiency() public {
        GyeLib.CircleConfig memory config = _createDefaultConfig();

        // Measure gas for clone creation
        uint256 gasBefore = gasleft();
        vm.prank(ALICE);
        factory.createCircle(config);
        uint256 gasUsed = gasBefore - gasleft();

        // Clone creation should be under 500k gas (vs 2.5M+ for full deployment)
        assertLt(gasUsed, 500_000, "Clone creation should be gas efficient");
    }
}
