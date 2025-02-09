import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { BattleResult } from "../generated/Battle/Battle"

export function createBattleResultEvent(
  token1: BigInt,
  token2: BigInt,
  winner: BigInt,
  score1: i32,
  score2: i32
): BattleResult {
  let battleResultEvent = changetype<BattleResult>(newMockEvent())

  battleResultEvent.parameters = new Array()

  battleResultEvent.parameters.push(
    new ethereum.EventParam("token1", ethereum.Value.fromUnsignedBigInt(token1))
  )
  battleResultEvent.parameters.push(
    new ethereum.EventParam("token2", ethereum.Value.fromUnsignedBigInt(token2))
  )
  battleResultEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromUnsignedBigInt(winner))
  )
  battleResultEvent.parameters.push(
    new ethereum.EventParam(
      "score1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(score1))
    )
  )
  battleResultEvent.parameters.push(
    new ethereum.EventParam(
      "score2",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(score2))
    )
  )

  return battleResultEvent
}
