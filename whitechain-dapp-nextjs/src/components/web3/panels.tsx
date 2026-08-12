'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only loaders for the web3 panels. Wallet state lives entirely in the
 * browser, so `ssr: false` keeps these out of server render and prerender – which
 * sidesteps "WagmiProvider not found" at build time and hydration mismatches.
 * `next/dynamic` with `ssr: false` is not allowed in a Server Component, so the
 * page imports the panels through this client module.
 */
export const WalletPanel = dynamic(() => import('./wallet-panel').then((mod) => mod.WalletPanel), {
  ssr: false,
});

export const StoragePanel = dynamic(
  () => import('./storage-panel').then((mod) => mod.StoragePanel),
  { ssr: false },
);
