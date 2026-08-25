import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { createAppKit, useAppKit } from '@reown/appkit/react';
import { defineChain } from 'viem';
import { whitechainSepolia as whitechainSepoliaBase } from 'viem/chains';
import { chainConfig } from 'viem/op-stack';
import { type Config, createConfig, http, injected, useConnect } from 'wagmi';

/**
 * Whitechain Sepolia, chain 1874. viem ships this chain, so extend its entry
 * instead of restating the id, RPC, explorer and Multicall3 address.
 * Note: viem's `whitechainTestnet` is chain 2625, the retired legacy L1 testnet.
 */
export const whitechainSepolia = defineChain({
  ...whitechainSepoliaBase,
  // Named, not spread: `defineChain` gives every chain an own `formatters` set
  // to undefined, which would erase the op-stack ones.
  formatters: chainConfig.formatters,
  serializers: chainConfig.serializers,
  // 1s blocks here, against chainConfig's 2s OP Stack default.
  blockTime: 1_000,
  // Merged so the OP predeploys and multicall3 both survive.
  contracts: {
    ...chainConfig.contracts,
    ...whitechainSepoliaBase.contracts,
    // Genesis preinstall, so no block is too early. viem omits the field.
    multicall3: { ...whitechainSepoliaBase.contracts.multicall3, blockCreated: 0 },
  },
});

// Public by design: it identifies the app to WalletConnect relays. Everything in
// a `VITE_*` var ships to the browser, so never put a secret here.
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID ?? '';

/** WalletConnect needs a Reown project id. Nothing else in this app does. */
export const walletConnectEnabled = projectId !== '';

if (!walletConnectEnabled) {
  console.warn(
    [
      'No VITE_REOWN_PROJECT_ID set, so WalletConnect is disabled.',
      'MetaMask and other injected browser wallets still work, as does every',
      'contract read and write. To enable WalletConnect (mobile wallets, QR',
      'pairing), create a free project id at https://dashboard.reown.com and',
      'put it in .env as VITE_REOWN_PROJECT_ID, then restart the dev server.',
    ].join(' '),
  );
}

// One instance, shared by the config and the connect action.
const injectedConnector = injected();

let config: Config;

if (walletConnectEnabled) {
  // A viem `Chain` lacks Reown's CaipNetwork fields, so assert once here.
  const networks = [whitechainSepolia] as unknown as [AppKitNetwork, ...AppKitNetwork[]];

  // Client-only SPA, so no server render.
  const adapter = new WagmiAdapter({ projectId, networks, ssr: false });

  createAppKit({
    adapters: [adapter],
    projectId,
    networks,
    // Drops the Coinbase Wallet SDK from the bundle; set `true` to restore it.
    enableCoinbase: false,
    features: { analytics: false },
    metadata: {
      name: 'Whitechain dApp',
      description: 'Vite + Reown dApp starter for Whitechain.',
      url: 'https://example.com',
      icons: ['https://example.com/icon.png'],
    },
  });

  config = adapter.wagmiConfig;
} else {
  // No project id: same chain and transport, injected wallets only, no modal.
  config = createConfig({
    chains: [whitechainSepolia],
    connectors: [injectedConnector],
    transports: { [whitechainSepolia.id]: http() },
  });
}

/** The wagmi config to hand to the providers. */
export const wagmiConfig = config;

function useConnectViaAppKit(): () => void {
  const { open } = useAppKit();
  return () => {
    void open();
  };
}

function useConnectViaInjected(): () => void {
  const { mutate: connect } = useConnect();
  return () => {
    connect({ connector: injectedConnector });
  };
}

/** Opens the AppKit modal when a project id is set, connects injected when not. */
export const useConnectWallet = walletConnectEnabled
  ? useConnectViaAppKit
  : useConnectViaInjected;
