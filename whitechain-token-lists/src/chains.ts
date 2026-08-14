/**
 * Map of network name -> chainId.
 *
 * Each `data/<SYMBOL>/data.json` keys its addresses by these network names,
 * so this is the single source of truth for which chains the list targets.
 *
 * Testnet only for now. When Whitechain mainnet ships, uncomment the
 * `whitechain` entry below (mainnet chainId to be filled in) — the build and
 * validation pipeline already handles multiple chains per token.
 */
export const CHAINS = {
  "whitechain-testnet": 1874,
  // "whitechain": <mainnet-chainId>,  // TODO: add when mainnet launches
} as const satisfies Record<string, number>;

export type NetworkName = keyof typeof CHAINS;

export function isNetworkName(name: string): name is NetworkName {
  return Object.prototype.hasOwnProperty.call(CHAINS, name);
}

export function chainIdFor(name: NetworkName): number {
  return CHAINS[name];
}
