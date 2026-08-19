// Resolves the explorer base URL and the two API surfaces this app reads.
// Override the base with VITE_EXPLORER_BASE_URL in a `.env` file.
const DEFAULT_BASE = 'https://explorer.testnet.whitechain.io';

const raw = import.meta.env.VITE_EXPLORER_BASE_URL?.trim();
export const EXPLORER_BASE_URL = (raw && raw.length > 0 ? raw : DEFAULT_BASE).replace(/\/+$/, '');

/** Blockscout GraphQL endpoint: one POST returns exactly the fields you ask for. */
export const GRAPHQL = `${EXPLORER_BASE_URL}/api/v1/graphql`;
/** Blockscout REST API v2: token metadata, counters, and the holders list. */
export const REST_V2 = `${EXPLORER_BASE_URL}/api/v2`;

/**
 * The token used by the "Try example" button and by every request on the
 * matching docs page, so the two can be compared side by side.
 * https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard
 */
export const EXAMPLE_TOKEN = '0x071c373d58A5290982a0E916D529a27849baE6e0';

/** Optional token to load on first paint. Blank means "wait for input". */
export const DEFAULT_TOKEN = import.meta.env.VITE_DEFAULT_TOKEN?.trim() ?? '';

/** A `from` of the zero address means the transfer is a mint. */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const explorerLink = {
  address: (hash: string) => `${EXPLORER_BASE_URL}/address/${hash}`,
  tx: (hash: string) => `${EXPLORER_BASE_URL}/tx/${hash}`,
  token: (hash: string) => `${EXPLORER_BASE_URL}/token/${hash}`,
  tokens: () => `${EXPLORER_BASE_URL}/tokens`,
};
