import { encodeTransactionRaw, type TransactionSigner } from '@algorandfoundation/algokit-utils/transact'
import type { useWallet } from '@txnlab/use-wallet-react'

type SignTransactions = ReturnType<typeof useWallet>['signTransactions']

export function getWalletSigner(signTransactions: SignTransactions): TransactionSigner {
  return async (txnGroup, indexesToSign) => {
    const encoded = txnGroup.map((txn) => encodeTransactionRaw(txn))
    const signed = await signTransactions(encoded, indexesToSign)
    return signed.filter((s): s is Uint8Array => s !== null)
  }
}
