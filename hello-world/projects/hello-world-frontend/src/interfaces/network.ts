import { AlgoClientConfig } from '@algorandfoundation/algokit-utils/network-client'

export interface AlgoViteClientConfig extends AlgoClientConfig {
  /** Base URL of the server e.g. http://localhost, https://testnet-api.algonode.cloud/, etc. */
  server: string
  /** The port to use e.g. 4001, 443, etc. */
  port: string | number
  /** The token to use for API authentication (or undefined if none needed) */
  token: string
  /** String representing current Algorand Network type (testnet/mainnet and etc) */
  network: string
}

export interface AlgoViteKMDConfig extends AlgoClientConfig {
  /** Base URL of the server e.g. http://localhost, https://testnet-api.algonode.cloud/, etc. */
  server: string
  /** The port to use e.g. 4001, 443, etc. */
  port: string | number
  /** The token to use for API authentication (or undefined if none needed) */
  token: string
  /** KMD wallet name */
  wallet: string
  /** KMD wallet password */
  password: string
}
