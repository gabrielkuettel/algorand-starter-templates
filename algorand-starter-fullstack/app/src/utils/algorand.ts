import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { encodeTransactionRaw, type TransactionSigner } from '@algorandfoundation/algokit-utils/transact'
import type { useWallet } from '@txnlab/use-wallet-react'

export function getAlgorandClient() {
  return AlgorandClient.fromConfig({
    algodConfig: {
      server: import.meta.env.VITE_ALGOD_SERVER,
      port: import.meta.env.VITE_ALGOD_PORT,
      token: import.meta.env.VITE_ALGOD_TOKEN,
    },
  })
}

export function getNetwork(): string {
  return import.meta.env.VITE_ALGOD_NETWORK ?? 'localnet'
}

export function getKmdConfigFromViteEnvironment() {
  if (!import.meta.env.VITE_KMD_SERVER) {
    throw new Error('Attempt to get default kmd configuration without specifying VITE_KMD_SERVER in the environment variables')
  }
  return {
    server: import.meta.env.VITE_KMD_SERVER as string,
    port: import.meta.env.VITE_KMD_PORT as string,
    token: import.meta.env.VITE_KMD_TOKEN as string,
    wallet: import.meta.env.VITE_KMD_WALLET as string,
    password: import.meta.env.VITE_KMD_PASSWORD as string,
  }
}

type SignTransactions = ReturnType<typeof useWallet>['signTransactions']

export function getWalletSigner(signTransactions: SignTransactions): TransactionSigner {
  return async (txnGroup, indexesToSign) => {
    const encoded = txnGroup.map((txn) => encodeTransactionRaw(txn))
    const signed = await signTransactions(encoded, indexesToSign)
    return signed.filter((s): s is Uint8Array => s !== null)
  }
}
