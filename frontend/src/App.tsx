import { useState } from 'react'
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState('')
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null)

  const connect1AM = async () => {
    try {
      setStatus('Looking for 1AM wallet...')

      const wallets = Object.values(window.midnight ?? {}) as InitialAPI[]

      if (wallets.length === 0) {
        setStatus('1AM wallet not detected.')
        return
      }

      const compatibleWallets = wallets.filter((wallet) =>
        wallet.apiVersion.startsWith('4.')
      )

      if (compatibleWallets.length === 0) {
        setStatus('No compatible Midnight wallet found.')
        return
      }

      const oneAmWallet = compatibleWallets.find(
  (wallet) => wallet.name.toLowerCase() === "1am"
)

if (!oneAmWallet) {
  setStatus("1AM wallet not detected. Lace or another wallet will not be used.")
  return
}

setStatus(`Connecting to ${oneAmWallet.name}...`)

      const connectedWallet = await oneAmWallet.connect('preprod')

      const connectionStatus = await connectedWallet.getConnectionStatus()

      if (connectionStatus.status === 'connected') {
        setWalletApi(connectedWallet)
        setConnected(true)
        setStatus(`${oneAmWallet.name} connected to Preprod`)
      } else {
        setStatus('Wallet connection was not established.')
      }
    } catch (error) {
      console.error(error)
      setStatus('Connection cancelled or failed.')
    }
  }

  return (
    <main className="app">
      <div className="card">
        <div className="badge">MIDNIGHT PREPROD</div>

        <h1>RentProof</h1>

        <p className="tagline">
          Prove you can afford the rent without revealing your bank balance.
        </p>

        {!connected ? (
          <button onClick={connect1AM}>
            Connect 1AM Wallet
          </button>
        ) : (
          <>
            <div className="connected">
              ✓ 1AM Wallet Connected
            </div>

            <button disabled={!walletApi}>
              Prove Solvency
            </button>
          </>
        )}

        {status && <div className="status">{status}</div>}

        <div className="privacy">
          🔒 Your financial balance remains private.
          <br />
          Only your eligibility is revealed.
        </div>
      </div>
    </main>
  )
}

export default App
