import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { HelloWorldFactory } from './artifacts/HelloWorldClient.js'

const algorand = AlgorandClient.fromConfig({
  algodConfig: {
    server: process.env.ALGOD_SERVER ?? 'http://localhost',
    port: process.env.ALGOD_PORT ?? '4001',
    token: process.env.ALGOD_TOKEN ?? '',
  },
})

// On localnet, use the default dispenser account.
// On testnet/mainnet, set DEPLOYER_MNEMONIC in your .env file.
const deployer = process.env.DEPLOYER_MNEMONIC
  ? algorand.account.fromMnemonic(process.env.DEPLOYER_MNEMONIC)
  : await algorand.account.localNetDispenser()

const factory = new HelloWorldFactory({
  defaultSender: deployer.addr,
  algorand,
})

const { appClient } = await factory.deploy({
  onUpdate: 'append',
  onSchemaBreak: 'append',
})

console.log(`Deployed HelloWorld: APP_ID=${appClient.appId}`)
