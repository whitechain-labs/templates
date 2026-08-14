/** Shape of each `data/<SYMBOL>/data.json` source file. */
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  website?: string;
  twitter?: string;
  /** Address per network name (see src/chains.ts). */
  tokens: Record<string, { address: string }>;
}

/** A single entry in the generated Uniswap token list. */
export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

/** The generated `whitechain.tokenlist.json` (Uniswap Token List standard). */
export interface TokenList {
  name: string;
  logoURI?: string;
  keywords?: string[];
  timestamp: string;
  tokens: TokenInfo[];
  version: Version;
}
