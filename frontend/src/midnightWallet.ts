import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'
import { dappConnectorProvingProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider'
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'

export async function createMidnightProviders(api: ConnectedAPI) {
  const zkConfigProvider = new FetchZkConfigProvider('/rentproof')

  const provingProvider = await dappConnectorProvingProvider(
    api,
    zkConfigProvider,
  )

  return {
    zkConfigProvider,
    provingProvider,
  }
}
