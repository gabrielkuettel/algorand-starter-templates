import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import type { ReadableAddress } from '@algorandfoundation/algokit-utils/common'
import { beforeEach, describe, expect, test } from 'vitest'
import { HelloWorldFactory } from '../artifacts/HelloWorldClient'

describe('HelloWorld contract (e2e)', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.newScope)

  const deploy = async (account: ReadableAddress) => {
    const factory = localnet.algorand.client.getTypedAppFactory(HelloWorldFactory, {
      defaultSender: account,
    })
    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })
    return { client: appClient }
  }

  test('says hello', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)
    const result = await client.send.hello({ args: { name: 'World' } })
    expect(result.return).toBe('Hello, World')
  })

  test('simulates hello with correct budget', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)
    const result = await client
      .newGroup()
      .hello({ args: { name: 'World' } })
      .hello({ args: { name: 'Jane' } })
      .simulate()

    expect(result.returns[0]).toBe('Hello, World')
    expect(result.returns[1]).toBe('Hello, Jane')
    expect(result.simulateResponse.txnGroups[0].appBudgetConsumed).toBeLessThan(100)
  })
})
