import { useState } from 'react'
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api'
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js'
import * as RentProof from '../public/rentproof/index.js'
import { createMidnightProviders } from './midnightWallet'
import './App.css'

const CONTRACT_ADDRESS =
  '0e57e370728a820cd61596669a330c29ea8d646a2cdf15aaaf778798f752b22c'

const PRIVATE_STATE_ID = 'rentProofPrivateState'

function App() {
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState('')
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null)
  const [proving, setProving] = useState(false)

  const connect1AM = async () => {
    try {
      setStatus('Looking for 1AM wallet...')

      const wallets = Object.values(window.midnight ?? {}) as InitialAPI[]

      if (wallets.length === 0) {
        setStatus('1AM wallet not detected.')
        return
      }

      const compatibleWallets = wallets.filter((wallet) =>
        wallet.apiVersion.startsWith('1.')
      )

      if (compatibleWallets.length === 0) {
        setStatus('No compatible Midnight wallet found.')
        return
      }

      const oneAnWallet = compatibleWallets.find(
        (wallet) => wallet.name.toLowerCase() === '1am'
      )

      if (!oneAnWallet) {
        setStatus('1AM wallet not detected. Lace or another wallet will not be used.')
        return
      }

      setStatus(`Connecting to ${oneAnWallet.name}...`)

      const connectedWallet = await oneAnWallet.connect('preprod')
      const connectionStatus = await connectedWallet.getConnectionStatus()

      if (connectionStatus.status === 'connected') {
        setWalletApi(connectedWallet)
        setConnected(true)
        setStatus('1AM connected to Preprod')
      } else {
        setStatus('Wallet connection was not established.')
      }
    } catch (error) {
      console.error(error)
      setStatus(
        `Connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  const proveSolvency = async () => {
    if (!walletApi) {
      setStatus('Connect 1AM Wallet first.')
      return
    }

    try {
      setProving(true)
      setStatus('Preparing private solvency proof...')

      const providers = await createMidnightProviders(walletApi)

      const compiledContract = CompiledContract.make(
        'rentproof',
        RentProof.Contract,
      ).pipe(
        CompiledContract.withCompiledFileAssets('/rentproof'),
      )

      setStatus('Connecting to deployed RentProof contract...')

      const deployed = await findDeployedContract(providers as any, {
        contractAddress: CONTRACT_ADDRESS,
        compiledContract: compiledContract as any,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {
          balance: BigInt(1000),
        },
      })

      setStatus('Generating private solvency proof...')

      const tx = await deployed.callTx.proveSolvency()
      const txId = tx.public.txId

      setStatus(`ELIGIBLE ✓ Transaction: ${txId}`)
    } catch (error) {
      console.error(error)

      setStatus(
        `Proof failed: ${
          error instanceof Error
            ? `${error.message}\n${error.stack ?? ''}`
            : String(error)
        }`
      )
    } finally {
      setProving(false)
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

            <button
              onClick={proveSolvency}
              disabled={!walletApi || proving}
            >
              {proving ? 'Generating Proof...' : 'Prove Solvency'}
            </button>
          </>
        )}

        {status && (
          <div className="status">
            {status}
          </div>
        )}

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
