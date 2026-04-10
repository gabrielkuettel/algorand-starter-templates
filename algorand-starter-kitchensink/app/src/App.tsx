import { useEffect, useState } from 'react'
import {
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import {
  WalletUIProvider,
  WalletButton,
  type Theme,
} from '@txnlab/use-wallet-ui-react'
import { getNetwork } from './utils/algorand'
import AppCalls from './components/AppCalls'

const network = getNetwork()
const algodConfig = {
  server: import.meta.env.VITE_ALGOD_SERVER,
  port: import.meta.env.VITE_ALGOD_PORT,
  token: import.meta.env.VITE_ALGOD_TOKEN,
}
const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.LUTE],
  defaultNetwork: network,
  networks: {
    [network]: {
      algod: {
        baseServer: algodConfig.server,
        port: algodConfig.port,
        token: String(algodConfig.token),
      },
    },
  },
  options: {
    resetNetwork: true,
  },
})

export default function App() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches)
      }
      root.classList.toggle('dark', mediaQuery.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider theme={theme}>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <header className="w-full bg-white dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  Algorand Starter
                </span>
                <div className="flex items-center gap-4">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <WalletButton />
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                HelloWorld Contract
              </h1>
              <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                Connect your wallet and call the HelloWorld smart contract
                deployed on LocalNet.
              </p>
            </div>

            <AppCalls />
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  )
}
