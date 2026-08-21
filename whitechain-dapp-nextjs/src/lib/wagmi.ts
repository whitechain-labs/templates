import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { createAppKit, useAppKit } from '@reown/appkit/react';
import { defineChain } from 'viem';
import { whitechainSepolia as whitechainSepoliaBase } from 'viem/chains';
import { chainConfig } from 'viem/op-stack';
import { type Config, createConfig, http, injected, useConnect } from 'wagmi';

/**
 * Whitechain Sepolia, chain 1874, the current L2 testnet. viem ships this chain,
 * so extend its entry instead of restating the id, RPC, explorer and Multicall3
 * address. (Chain 2625 is the retired legacy L1 testnet: do not use it.)
 *
 * Two things are layered on top, and nothing else:
 *
 * - viem's op-stack `chainConfig`, for the L2 block and receipt formatters, the
 *   deposit transaction serializer, and the L2 predeploy addresses. Whitechain
 *   is an OP Stack chain and viem's plain entry carries none of that.
 * - `blockCreated` for Multicall3. Whitechain Sepolia carries the OP Stack
 *   genesis preinstalls, so the aggregator exists from block 0. viem's entry
 *   has the address but no block; the upstream patch is in the pull request.
 *
 * `contracts` is merged field by field on purpose. Spreading the viem entry over
 * `chainConfig` would drop the OP predeploys and leave only multicall3.
 */
export const whitechainSepolia = defineChain({
  ...whitechainSepoliaBase,
  // Named field by field rather than spreading `chainConfig` last. viem's
  // `defineChain` gives every chain an own `formatters`/`serializers` property,
  // set to undefined when it has none, so spreading its entry over
  // `chainConfig` silently erases the OP Stack ones.
  formatters: chainConfig.formatters,
  serializers: chainConfig.serializers,
  // Whitechain Sepolia produces a block every second. `chainConfig` defaults to
  // the 2s OP Stack cadence, which would make wagmi poll at half the rate.
  blockTime: 1_000,
  contracts: {
    ...chainConfig.contracts,
    ...whitechainSepoliaBase.contracts,
    multicall3: {
      ...whitechainSepoliaBase.contracts.multicall3,
      blockCreated: 0,
    },
  },
});

// The Reown `projectId` is PUBLIC. It identifies the app to WalletConnect
// relays, so `NEXT_PUBLIC_*` is the right channel. This module is bundled into
// the browser: never put a server secret here.
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '';

/**
 * Whether WalletConnect is available. It needs a Reown project id; every other
 * feature of this starter does not, so an empty id degrades to injected wallets
 * rather than breaking the first render.
 */
export const walletConnectEnabled = projectId !== '';

if (!walletConnectEnabled) {
  console.warn(
    [
      'No NEXT_PUBLIC_REOWN_PROJECT_ID set, so WalletConnect is disabled.',
      'MetaMask and other injected browser wallets still work, as does every',
      'contract read and write. To enable WalletConnect (mobile wallets, QR',
      'pairing), create a free project id at https://dashboard.reown.com and',
      'put it in .env as NEXT_PUBLIC_REOWN_PROJECT_ID, then restart the dev server.',
    ].join(' '),
  );
}

// One connector instance, shared by the config and the connect action, so
// `connect()` targets the connector the config actually registered.
const injectedConnector = injected();

let config: Config;

if (walletConnectEnabled) {
  // A plain viem `Chain` doesn't carry Reown's CaipNetwork fields, so assert
  // once here and reuse for both the adapter and the modal.
  const networks = [whitechainSepolia] as unknown as [AppKitNetwork, ...AppKitNetwork[]];

  const adapter = new WagmiAdapter({ projectId, networks, ssr: true });

  createAppKit({
    adapters: [adapter],
    projectId,
    networks,
    // Trim the bundle and the CSP allow-list by dropping the Coinbase Wallet
    // SDK. Injected wallets and WalletConnect remain; set `true` to re-enable.
    enableCoinbase: false,
    // Reown analytics off (privacy). WalletConnect telemetry may still probe
    // its endpoint; the CSP allow-list omits it, so that request fails by design.
    features: { analytics: false },
    metadata: {
      name: 'Whitechain dApp',
      description: 'Next + Reown dApp starter for Whitechain.',
      url: 'https://example.com',
      icons: ['https://example.com/icon.png'],
    },
  });

  config = adapter.wagmiConfig;
} else {
  // No project id, so build the wagmi config directly. Same chain, same
  // transport, injected wallets only, and no Reown modal in the tree.
  config = createConfig({
    chains: [whitechainSepolia],
    connectors: [injectedConnector],
    transports: { [whitechainSepolia.id]: http() },
    ssr: true,
  });
}

/** The wagmi config to hand to the providers. */
export const wagmiConfig = config;

/** Opens the Reown AppKit modal. Used when a project id is configured. */
function useConnectViaAppKit(): () => void {
  const { open } = useAppKit();
  return () => {
    void open();
  };
}

/** Connects the injected browser wallet directly, with no modal. */
function useConnectViaInjected(): () => void {
  const { mutate: connect } = useConnect();
  return () => {
    connect({ connector: injectedConnector });
  };
}

/**
 * Returns the action that starts a wallet connection. Which path it takes is
 * fixed at build time by whether a project id is present, so panels call this
 * without caring which one is active.
 */
export const useConnectWallet = walletConnectEnabled
  ? useConnectViaAppKit
  : useConnectViaInjected;
