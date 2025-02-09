import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { BattleResult } from "../generated/schema"
import { BattleResult as BattleResultEvent } from "../generated/Battle/Battle"
import { handleBattleResult } from "../src/battle"
import { createBattleResultEvent } from "./battle-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let token1 = BigInt.fromI32(234)
    let token2 = BigInt.fromI32(234)
    let winner = BigInt.fromI32(234)
    let score1 = 123
    let score2 = 123
    let newBattleResultEvent = createBattleResultEvent(
      token1,
      token2,
      winner,
      score1,
      score2
    )
    handleBattleResult(newBattleResultEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BattleResult created and stored", () => {
    assert.entityCount("BattleResult", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BattleResult",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token1",
      "234"
    )
    assert.fieldEquals(
      "BattleResult",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token2",
      "234"
    )
    assert.fieldEquals(
      "BattleResult",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winner",
      "234"
    )
    assert.fieldEquals(
      "BattleResult",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "score1",
      "123"
    )
    assert.fieldEquals(
      "BattleResult",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "score2",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
