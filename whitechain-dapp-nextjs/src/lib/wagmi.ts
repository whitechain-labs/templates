import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { type Chain, defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';

/**
 * Whitechain testnet (chain 1874). Whitechain is an OP-Stack L2, so this spreads
 * viem's `op-stack` `chainConfig` (formatters, serializers, L2 predeploys) and
 * layers WBT and the public RPC/explorer on top. Change the URLs to use your own node.
 */
export const whitechainTestnet: Chain = defineChain({
  ...chainConfig,
  id: 1874,
  name: 'Whitechain Sepolia',
  testnet: true,
  nativeCurrency: { decimals: 18, name: 'WhiteBIT Coin', symbol: 'WBT' },
  rpcUrls: { default: { http: ['https://rpc.testnet.whitechain.io'] } },
  blockExplorers: {
    default: { name: 'Whitechain Explorer', url: 'https://explorer.testnet.whitechain.io' },
  },
});

// The Reown `projectId` is PUBLIC – it identifies the app to WalletConnect relays –
// so `NEXT_PUBLIC_*` is the right channel. Get one at https://dashboard.reown.com.
// This module is bundled into the browser: never put a server secret here.
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '';

// A plain viem `Chain` doesn't carry Reown's CaipNetwork fields, so assert once
// here and reuse for both the adapter and the modal.
const networks = [whitechainTestnet] as unknown as [AppKitNetwork, ...AppKitNetwork[]];

const adapter = new WagmiAdapter({ projectId, networks, ssr: true });

createAppKit({
  adapters: [adapter],
  projectId,
  networks,
  // Trim the bundle and the CSP allow-list by dropping the Coinbase Wallet SDK.
  // Injected wallets and WalletConnect remain; set `true` to re-enable Coinbase.
  enableCoinbase: false,
  // Reown analytics off (privacy). WalletConnect telemetry may still probe its
  // endpoint; the CSP allow-list omits it, so that request fails by design.
  features: { analytics: false },
  metadata: {
    name: 'Whitechain dApp',
    description: 'Next + Reown dApp starter for Whitechain.',
    url: 'https://example.com',
    icons: ['https://example.com/icon.png'],
  },
});

/** The wagmi config to hand to the providers. */
export const wagmiConfig = adapter.wagmiConfig;

/** Open/close the Reown AppKit connect modal. */
export { useAppKit } from '@reown/appkit/react';
