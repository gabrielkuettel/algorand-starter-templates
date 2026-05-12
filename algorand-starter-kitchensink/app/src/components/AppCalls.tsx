import { useWallet } from '@txnlab/use-wallet-react'
import { useRef, useState } from 'react'
import { Address } from '@algorandfoundation/algokit-utils'
import { HelloWorldFactory, type HelloWorldClient } from '@repo/contracts'
import { getAlgorandClient, getWalletSigner } from '../utils/algorand'

export default function AppCalls() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signTransactions, activeAddress } = useWallet()
  const appClientRef = useRef<HelloWorldClient | null>(null)

  if (!activeAddress) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-slate-300">
          Connect your Algorand wallet to interact with the HelloWorld contract.
        </p>
      </div>
    )
  }

  const getAppClient = async () => {
    if (appClientRef.current) return appClientRef.current

    const algorand = getAlgorandClient()
    algorand.setDefaultSigner(getWalletSigner(signTransactions))

    const factory = algorand.client.getTypedAppFactory(HelloWorldFactory, {
      defaultSender: activeAddress,
    })

    // factory.deploy() is idempotent -- it checks if the app already exists
    // before creating a new one. It needs either an indexer client or an
    // existingDeployments cache to do this lookup. Since we don't have an
    // indexer configured, we pass an empty cache and store the resulting
    // appClient in a useRef so subsequent calls skip deploy() entirely.
    const { appClient } = await factory.deploy({
      onSchemaBreak: 'append',
      onUpdate: 'append',
      existingDeployments: {
        creator: Address.fromString(activeAddress),
        apps: {},
      },
    })

    appClientRef.current = appClient
    return appClient
  }

  const callContract = async () => {
    setLoading(true)
    setResult(null)

    try {
      const appClient = await getAppClient()
      const response = await appClient.send.hello({ args: { name: input } })
      setResult(response.return ?? 'No return value')
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Say Hello
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter a name"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={callContract}
          disabled={loading || !input}
        >
          {loading ? 'Calling...' : 'Send'}
        </button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Response</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white font-mono">
            {result}
          </p>
        </div>
      )}
    </div>
  )
}
