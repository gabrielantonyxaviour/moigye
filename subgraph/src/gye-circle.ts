import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  MemberJoined,
  ContributionMade,
  RoundStarted,
  PayoutDistributed,
  MemberSlashed,
  BidPlaced,
  CircleStatusChanged,
  StakeWithdrawn,
} from "../generated/templates/GyeCircle/GyeCircle";
import { Circle, Member, Round, Contribution, Bid } from "../generated/schema";

export function handleMemberJoined(event: MemberJoined): void {
  let circleId = event.params.circleId.toString();
  let circle = Circle.load(circleId);
  if (!circle) return;

  // Create member entity
  let memberId = event.address.toHexString() + "-" + event.params.member.toHexString();
  let member = new Member(memberId);

  member.circle = circleId;
  member.address = event.params.member;
  member.stakeDeposited = event.params.stake;
  member.hasReceivedPayout = false;
  member.contributionCount = 0;
  member.totalContributed = BigInt.zero();
  member.joinedAt = event.block.timestamp;

  member.save();

  // Update circle member count
  circle.memberCount = circle.memberCount + 1;
  circle.save();
}

export function handleContributionMade(event: ContributionMade): void {
  let circleId = event.params.circleId.toString();
  let circle = Circle.load(circleId);
  if (!circle) return;

  let roundId = event.address.toHexString() + "-" + event.params.round.toString();
  let round = Round.load(roundId);
  if (!round) return;

  let memberId = event.address.toHexString() + "-" + event.params.member.toHexString();
  let member = Member.load(memberId);
  if (!member) return;

  // Create contribution entity
  let contributionId =
    event.address.toHexString() +
    "-" +
    event.params.round.toString() +
    "-" +
    event.params.member.toHexString();
  let contribution = new Contribution(contributionId);

  contribution.circle = circleId;
  contribution.round = roundId;
  contribution.member = memberId;
  contribution.amount = event.params.amount;
  contribution.timestamp = event.block.timestamp;
  contribution.txHash = event.transaction.hash;

  contribution.save();

  // Update round totals
  round.totalContributed = round.totalContributed.plus(event.params.amount);
  round.contributionCount = round.contributionCount + 1;
  round.save();

  // Update member totals
  member.contributionCount = member.contributionCount + 1;
  member.totalContributed = member.totalContributed.plus(event.params.amount);
  member.save();

  // Update circle total
  circle.totalContributed = circle.totalContributed.plus(event.params.amount);
  circle.save();
}

export function handleRoundStarted(event: RoundStarted): void {
  let circleId = event.params.circleId.toString();
  let circle = Circle.load(circleId);
  if (!circle) return;

  // Create round entity
  let roundId = event.address.toHexString() + "-" + event.params.round.toString();
  let round = new Round(roundId);

  round.circle = circleId;
  round.roundNumber = event.params.round.toI32();
  round.startTime = event.block.timestamp;
  round.deadline = event.params.deadline;
  round.totalContributed = BigInt.zero();
  round.contributionCount = 0;
  round.status = 1; // ACTIVE

  round.save();

  // Update circle current round
  circle.currentRound = event.params.round.toI32();
  circle.save();
}

export function handlePayoutDistributed(event: PayoutDistributed): void {
  let circleId = event.params.circleId.toString();
  let circle = Circle.load(circleId);
  if (!circle) return;

  let roundId = event.address.toHexString() + "-" + event.params.round.toString();
  let round = Round.load(roundId);
  if (!round) return;

  // Update round with winner info
  round.winner = event.params.winner;
  round.winnerAmount = event.params.amount;
  round.status = 2; // COMPLETED
  round.save();

  // Update member payout status
  let memberId = event.address.toHexString() + "-" + event.params.winner.toHexString();
  let member = Member.load(memberId);
  if (member) {
    member.hasReceivedPayout = true;
    member.save();
  }
}

export function handleMemberSlashed(event: MemberSlashed): void {
  let memberId = event.address.toHexString() + "-" + event.params.member.toHexString();
  let member = Member.load(memberId);
  if (!member) return;

  // Reduce stake by penalty amount
  member.stakeDeposited = member.stakeDeposited.minus(event.params.penalty);
  member.save();
}

export function handleBidPlaced(event: BidPlaced): void {
  let circleId = event.params.circleId.toString();

  let roundId = event.address.toHexString() + "-" + event.params.round.toString();

  // Create bid entity with unique ID including timestamp
  let bidId =
    event.address.toHexString() +
    "-" +
    event.params.round.toString() +
    "-" +
    event.params.bidder.toHexString() +
    "-" +
    event.block.timestamp.toString();
  let bid = new Bid(bidId);

  bid.circle = circleId;
  bid.round = roundId;
  bid.bidder = event.params.bidder;
  bid.amount = event.params.amount;
  bid.timestamp = event.block.timestamp;

  bid.save();
}

export function handleCircleStatusChanged(event: CircleStatusChanged): void {
  let circleId = event.params.circleId.toString();
  let circle = Circle.load(circleId);
  if (!circle) return;

  circle.status = event.params.newStatus;
  circle.save();
}

export function handleStakeWithdrawn(event: StakeWithdrawn): void {
  let memberId = event.address.toHexString() + "-" + event.params.member.toHexString();
  let member = Member.load(memberId);
  if (!member) return;

  // Reduce stake by withdrawn amount
  member.stakeDeposited = member.stakeDeposited.minus(event.params.amount);
  member.save();
}
