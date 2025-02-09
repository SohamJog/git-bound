import { BattleResult as BattleResultEvent } from "../generated/Battle/Battle"
import { BattleResult } from "../generated/schema"

export function handleBattleResult(event: BattleResultEvent): void {
  let entity = new BattleResult(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token1 = event.params.token1
  entity.token2 = event.params.token2
  entity.winner = event.params.winner
  entity.score1 = event.params.score1
  entity.score2 = event.params.score2

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
