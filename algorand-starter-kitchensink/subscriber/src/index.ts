import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { handleLifecycleEvent } from './handlers.js'
import { getWatermark, setWatermark } from './watermark.js'

const appId = BigInt(process.env.APP_ID ?? '0')
if (appId === 0n) {
  console.error('APP_ID environment variable is required. Deploy your contract first: npm run deploy')
  process.exit(1)
}

const algorand = AlgorandClient.fromConfig({
  algodConfig: {
    server: process.env.ALGOD_SERVER ?? 'http://localhost',
    port: process.env.ALGOD_PORT ?? '4001',
    token: process.env.ALGOD_TOKEN ?? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
})

const subscriber = new AlgorandSubscriber(
  {
    filters: [
      {
        name: 'app-lifecycle',
        filter: {
          type: TransactionType.AppCall,
          appId: appId,
        },
      },
    ],
    waitForBlockWhenAtTip: true,
    syncBehaviour: 'skip-sync-newest',
    watermarkPersistence: {
      get: getWatermark,
      set: setWatermark,
    },
  },
  algorand.client.algod,
)

subscriber.on('app-lifecycle', (transaction) => {
  handleLifecycleEvent(transaction, appId)
})

subscriber.start()
console.log(`Monitoring application ${appId} for lifecycle events...`)
console.log('Watching for: NoOp, OptIn, CloseOut, ClearState, UpdateApplication, DeleteApplication')
