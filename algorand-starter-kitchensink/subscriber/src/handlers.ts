import { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber'

const ON_COMPLETE_NAMES: Record<number, string> = {
  0: 'NoOp (method call)',
  1: 'OptIn',
  2: 'CloseOut',
  3: 'ClearState',
  4: 'UpdateApplication',
  5: 'DeleteApplication',
}

const SECURITY_CRITICAL = new Set([4, 5])

export function handleLifecycleEvent(tx: SubscribedTransaction, appId: bigint) {
  const onComplete = tx['application-transaction']?.['on-completion'] ?? 0
  const label = ON_COMPLETE_NAMES[onComplete] ?? `Unknown(${onComplete})`
  const sender = tx.sender
  const round = tx['confirmed-round']

  const prefix = SECURITY_CRITICAL.has(onComplete) ? '[ALERT]' : '[INFO]'
  console.log(`${prefix} ${label} | app=${appId} sender=${sender} round=${round} txid=${tx.id}`)
}
