import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { CircleCreated } from "../generated/GyeFactory/GyeFactory";
import { GyeCircle as GyeCircleTemplate } from "../generated/templates";
import { Circle } from "../generated/schema";

export function handleCircleCreated(event: CircleCreated): void {
  let circleId = event.params.circleId.toString();
  let circle = new Circle(circleId);

  circle.address = event.params.circleAddress;
  circle.creator = event.params.creator;
  circle.name = event.params.name;

  // Config from event parameters
  circle.contributionAmount = event.params.contributionAmount;
  circle.frequency = event.params.frequency;
  circle.totalRounds = event.params.totalRounds.toI32();
  circle.stakeRequired = event.params.stakeRequired;
  circle.penaltyRate = event.params.penaltyRate.toI32();
  circle.payoutMethod = event.params.payoutMethod;

  // Initial values
  circle.currentRound = 0;
  circle.status = 0; // FORMING
  circle.memberCount = 0;
  circle.totalContributed = BigInt.zero();
  circle.createdAt = event.block.timestamp;
  circle.createdAtBlock = event.block.number;

  circle.save();

  log.info("Circle created: id={}, name={}, address={}, totalRounds={}", [
    circleId,
    event.params.name,
    event.params.circleAddress.toHexString(),
    event.params.totalRounds.toString()
  ]);

  // Spawn template to track circle events
  GyeCircleTemplate.create(Address.fromBytes(event.params.circleAddress));
}
