// Resolves the explorer base URL and the two API surfaces this app reads.
// Override the base with VITE_EXPLORER_BASE_URL in a `.env` file.
const DEFAULT_BASE = 'https://explorer.testnet.whitechain.io';

const raw = import.meta.env.VITE_EXPLORER_BASE_URL?.trim();
export const EXPLORER_BASE_URL = (raw && raw.length > 0 ? raw : DEFAULT_BASE).replace(/\/+$/, '');

/** Etherscan-style RPC API: `/api?module=…&action=…`. */
export const RPC_API = `${EXPLORER_BASE_URL}/api`;
/** Blockscout REST API v2: the gas-price tiers and the aggregate counters. */
export const REST_V2 = `${EXPLORER_BASE_URL}/api/v2`;

export const explorerLink = {
  block: (height: number) => `${EXPLORER_BASE_URL}/block/${height}`,
};
