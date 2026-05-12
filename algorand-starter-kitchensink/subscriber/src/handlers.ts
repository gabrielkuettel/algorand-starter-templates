import type { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/indexer'

const ON_COMPLETE_LABELS: Record<ApplicationOnComplete, string> = {
  [ApplicationOnComplete.noop]: 'NoOp (method call)',
  [ApplicationOnComplete.optin]: 'OptIn',
  [ApplicationOnComplete.closeout]: 'CloseOut',
  [ApplicationOnComplete.clear]: 'ClearState',
  [ApplicationOnComplete.update]: 'UpdateApplication',
  [ApplicationOnComplete.delete]: 'DeleteApplication',
}

const SECURITY_CRITICAL = new Set<ApplicationOnComplete>([ApplicationOnComplete.update, ApplicationOnComplete.delete])

export function handleLifecycleEvent(tx: SubscribedTransaction, appId: bigint) {
  const onComplete = (tx.applicationTransaction?.onCompletion ?? ApplicationOnComplete.noop) as ApplicationOnComplete
  const label = ON_COMPLETE_LABELS[onComplete] ?? `Unknown(${onComplete})`
  const sender = tx.sender
  const round = tx.confirmedRound

  const prefix = SECURITY_CRITICAL.has(onComplete) ? '[ALERT]' : '[INFO]'
  console.log(`${prefix} ${label} | app=${appId} sender=${sender} round=${round} txid=${tx.id}`)
}
