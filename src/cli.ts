/**
 * CLI for interacting with rentproof-app contract
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time so the CLI reconnects to
// the same private state. The rentproof contract has no witnesses (empty state).
const PRIVATE_STATE_ID = 'rentProofPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;
{
  const notice = formatWalletBackupNotice(WALLET, network);
  if (notice) console.log(notice);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'rentproof');

// Load compiled contract
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

// Check if contract is compiled
if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const RentProof = await import(pathToFileURL(contractPath).href);

const compiledContract = CompiledContract.make('rentproof', RentProof.Contract).pipe(
    // @ts-expect-error - SDK generic typing rejects witness object shape at compile time; the runtime shape matches the generated contract's Witnesses type
    CompiledContract.withWitnesses({
      getBalance: (context: any) => {
        return [context.privateState, context.privateState.balance];
      },
    }),
    CompiledContract.withCompiledFileAssets(zkConfigPath),
);
// ─── Providers ─────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  // The SDK requires the private-state password to be at least 16 characters.
  // The default below is a placeholder for local devnet only — set a strong
  // password via PRIVATE_STATE_PASSWORD when you move to a non-local target.
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    // In Midnight.js 4.1.x the WalletProvider interface returns the key objects
    // (CoinPublicKey / EncPublicKey) directly — no longer hex strings.
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      // balanceUnboundTransaction -> finalizeRecipe is the complete balancing
      // path in wallet-sdk 1.x; the earlier explicit signRecipe step is gone.
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'rentproof-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── Main CLI ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   rentproof-app CLI                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  // Check for deployment
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state — sync will resume from saved point.`);
    }

    console.log('  Syncing with network...');
    console.log('  ℹ  This may take several minutes depending on network size.');
    console.log('     RPC disconnection messages during sync are normal and can be safely ignored.\n');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    // Persist sync state so the next run doesn't have to redo this work.
    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    // Surface a faucet hint when a public-network wallet has 0 tNIGHT.
    // Reads (option 2) work without funds, but writes (option 1) need DUST
    // generated from registered NIGHT — without this hint the next failure
    // mode is a confusing "Insufficient Funds" deep inside the tx builder.
    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    // Setup providers and connect to contract
    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress: deployment.address,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: { balance: BigInt(process.env.RENT_BALANCE || '1000') },
});

    console.log('  ✅ Connected!\n');

    // Interactive RentProof CLI
  let running = true;

  while (running) {
    console.log('—— RentProof Menu ————————————————————————————————');
    console.log('  1. Set rental threshold');
    console.log('  2. Prove solvency');
    console.log('  3. Read current proof status');
    console.log('  4. Check wallet balance');
    console.log('  5. Exit\n');

    const choice = await rl.question('  Your choice: ');

    switch (choice.trim()) {
      case '1': {
        const thresholdInput = await rl.question(
          '  Enter required rental threshold: ',
        );

        try {
          const threshold = BigInt(thresholdInput.trim());

          if (threshold < 0n) {
            throw new Error('Threshold cannot be negative.');
          }

          console.log(
            '\n  ⏳ Setting rental threshold (this may take 30-60 seconds)...',
          );

          const tx = await deployed.callTx.setThreshold(threshold);

          console.log(`\n  ✅ Rental threshold set to: ${threshold}`);
          console.log(`     Transaction ID: ${tx.public.txId}`);
          console.log(`     Block height: ${tx.public.blockHeight}\n`);
        } catch (error) {
          console.error(
            '\n  ❌ Failed:',
            error instanceof Error ? error.message : error,
          );

          if (error instanceof Error && error.stack) {
            console.error('\nFULL STACK TRACE:\n' + error.stack);
          }
        }

        break;
      }

      case '2': {
        console.log(
          '\n  ⏳ Generating zero-knowledge solvency proof...',
        );

        try {
          const tx = await deployed.callTx.proveSolvency();

          const contractState =
            await providers.publicDataProvider.queryContractState(
              deployment.address,
            );

          if (!contractState) {
            throw new Error(
              'Transaction succeeded, but the contract state could not be queried.',
            );
          }

          const ledgerState = RentProof.ledger(contractState.data);

          console.log(
            `\n  ✅ Solvency proof submitted successfully.`,
          );
          console.log(
            `     Status: ${ledgerState.verified ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`,
          );
          console.log(`     Required threshold: ${ledgerState.threshold}`);
          console.log(`     Transaction ID: ${tx.public.txId}`);
          console.log('\n  🔐 Your financial balance was not revealed.\n');
        } catch (error) {
          console.error(
            '\n  ❌ Proof failed:',
            error instanceof Error ? error.message : error,
          );

          if (error instanceof Error && error.stack) {
            console.error('\nFULL STACK TRACE:\n' + error.stack);
          }
        }

        break;
      }

      case '3': {
        console.log('\n  Reading RentProof contract state...');

        try {
          const contractState =
            await providers.publicDataProvider.queryContractState(
              deployment.address,
            );

          if (!contractState) {
            console.log('\n  ⚠️ Contract state is not available.\n');
            break;
          }

          const ledgerState = RentProof.ledger(contractState.data);

          console.log(`\n  Required threshold: ${ledgerState.threshold}`);
          console.log(
            `  Solvency status: ${
              ledgerState.verified ? 'ELIGIBLE' : 'NOT ELIGIBLE'
            }\n`,
          );
        } catch (error) {
          console.error(
            '\n  ❌ Failed:',
            error instanceof Error ? error.message : error,
          );

          if (error instanceof Error && error.stack) {
            console.error('\nFULL STACK TRACE:\n' + error.stack);
          }
        }

        break;
      }

      case '4': {
        console.log('\n  Checking wallet balance...');

        try {
          const currentState =
            await walletCtx.wallet.waitForSyncedState();

          const currentBalance =
            currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;

          const dustBalance =
            currentState.dust.balance(new Date());

          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
        } catch (error) {
          console.error(
            '\n  ❌ Failed:',
            error instanceof Error ? error.message : error,
          );

          if (error instanceof Error && error.stack) {
            console.error('\nFULL STACK TRACE:\n' + error.stack);
          }
        }

        break;
      }

      case '5':
        running = false;
        console.log('\n  👋 Goodbye!\n');
        break;

      default:
        console.log('\n  ❌ Invalid choice. Please enter 1-5.\n');
    }

    if (running) {
      await persistWalletState(network, walletCtx);
    }
  }

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
} catch (error) {
  console.error(
    '\n❌ Error:',
    error instanceof Error ? error.message : error,
  );
} finally {
  rl.close();
}
}

main().catch(console.error);
