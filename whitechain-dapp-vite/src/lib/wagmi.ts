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

// This is a static SPA, so the Reown `projectId` is public by design. Get one at
// https://dashboard.reown.com. Everything in a `VITE_*` var ships to the browser:
// never put a secret here.
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID ?? '';

// A plain viem `Chain` doesn't carry Reown's CaipNetwork fields, so assert once
// here and reuse for both the adapter and the modal.
const networks = [whitechainTestnet] as unknown as [AppKitNetwork, ...AppKitNetwork[]];

// A client-only SPA: no server render, so ssr is false.
const adapter = new WagmiAdapter({ projectId, networks, ssr: false });

createAppKit({
  adapters: [adapter],
  projectId,
  networks,
  // Trim the bundle by dropping the Coinbase Wallet SDK. Injected wallets and
  // WalletConnect remain; set `true` to re-enable Coinbase.
  enableCoinbase: false,
  // Keep Reown usage analytics off (privacy).
  features: { analytics: false },
  metadata: {
    name: 'Whitechain dApp',
    description: 'Vite + Reown dApp starter for Whitechain.',
    url: 'https://example.com',
    icons: ['https://example.com/icon.png'],
  },
});

/** The wagmi config to hand to the providers. */
export const wagmiConfig = adapter.wagmiConfig;

/** Open/close the Reown AppKit connect modal. */
export { useAppKit } from '@reown/appkit/react';
