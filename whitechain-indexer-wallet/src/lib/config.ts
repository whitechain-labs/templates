// Resolves the explorer base URL and the two API surfaces this app reads.
// Override the base with VITE_EXPLORER_BASE_URL in a `.env` file.
const DEFAULT_BASE = 'https://explorer.testnet.whitechain.io';

const raw = import.meta.env.VITE_EXPLORER_BASE_URL?.trim();
export const EXPLORER_BASE_URL = (raw && raw.length > 0 ? raw : DEFAULT_BASE).replace(/\/+$/, '');

/** Blockscout REST API v2: the indexed view, pre-decoded and JSON-native. */
export const REST_V2 = `${EXPLORER_BASE_URL}/api/v2`;
/** Standard Ethereum JSON-RPC: the live node view (`eth_getBalance`, …). */
export const ETH_RPC = `${EXPLORER_BASE_URL}/api/eth-rpc`;

/**
 * The address used by the "Try example" button and by every request on the
 * matching docs page, so the two can be compared side by side.
 * https://docs.whitechain.io/build/block-explorer/indexer-wallet
 */
export const EXAMPLE_ADDRESS = '0xA439Ad519046CCd7056Ddf74fbaAc99d740Bdf09';

/** Link into the explorer UI for a given entity. */
export const explorerLink = {
  address: (hash: string) => `${EXPLORER_BASE_URL}/address/${hash}`,
  tx: (hash: string) => `${EXPLORER_BASE_URL}/tx/${hash}`,
  token: (hash: string) => `${EXPLORER_BASE_URL}/token/${hash}`,
};
