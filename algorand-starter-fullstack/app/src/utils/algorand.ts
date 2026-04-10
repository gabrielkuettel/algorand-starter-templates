import { AlgorandClient } from '@algorandfoundation/algokit-utils'

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
