/**
 * Map of network name -> chainId.
 *
 * Each `data/<SYMBOL>/data.json` keys its addresses by these network names,
 * so this is the single source of truth for which chains the list targets.
 *
 * `whitechain` is Whitechain Mainnet (L2, chain ID 1875). The build and
 * validation pipeline handles multiple chains per token.
 */
export const CHAINS = {
  "whitechain-testnet": 1874,
  "whitechain": 1875,
} as const satisfies Record<string, number>;

export type NetworkName = keyof typeof CHAINS;

export function isNetworkName(name: string): name is NetworkName {
  return Object.prototype.hasOwnProperty.call(CHAINS, name);
}

export function chainIdFor(name: NetworkName): number {
  return CHAINS[name];
}
