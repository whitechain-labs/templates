import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAddress } from "@ethersproject/address";
import { CHAINS, isNetworkName } from "./chains.js";
import type { TokenData, TokenInfo, TokenList, Version } from "./types.js";

export const DATA_DIR = "data";
export const OUTPUT_FILE = "whitechain.tokenlist.json";
export const BASE_URL = "https://whitechain.io/tokens";

const LIST_META = {
  name: "Whitechain",
  logoURI: `${BASE_URL}/whitechain_logo.svg`,
  keywords: ["scaling", "layer2", "infrastructure", "whitechain"],
};

/** Read and parse a single `data/<SYMBOL>/data.json`. */
function readTokenData(symbolDir: string): TokenData {
  const file = join(DATA_DIR, symbolDir, "data.json");
  const raw = readFileSync(file, "utf8");
  const data = JSON.parse(raw) as TokenData;
  if (!data.tokens || Object.keys(data.tokens).length === 0) {
    throw new Error(`${file}: "tokens" map is empty`);
  }
  return data;
}

/** Read every `data/<SYMBOL>/` folder and flatten into token-list entries. */
export function buildTokens(): TokenInfo[] {
  const symbolDirs = readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const tokens: TokenInfo[] = [];

  for (const symbolDir of symbolDirs) {
    const data = readTokenData(symbolDir);

    for (const [network, { address }] of Object.entries(data.tokens)) {
      if (!isNetworkName(network)) {
        throw new Error(
          `data/${symbolDir}/data.json: unknown network "${network}". ` +
            `Add it to src/chains.ts. Known networks: ${Object.keys(CHAINS).join(", ")}`,
        );
      }
      // getAddress normalizes to an EIP-55 checksummed address and throws on
      // an invalid hex string, wrong length, or a bad mixed-case checksum.
      const checksummed = getAddress(address);

      tokens.push({
        chainId: CHAINS[network],
        address: checksummed,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        logoURI: `${BASE_URL}/${DATA_DIR}/${symbolDir}/logo.svg`,
      });
    }
  }

  // Deterministic ordering: by symbol, then chainId.
  tokens.sort(
    (a, b) => a.symbol.localeCompare(b.symbol) || a.chainId - b.chainId,
  );

  return tokens;
}

/** Read the existing generated list, if any. */
export function readExistingList(): TokenList | null {
  if (!existsSync(OUTPUT_FILE)) return null;
  return JSON.parse(readFileSync(OUTPUT_FILE, "utf8")) as TokenList;
}

const tokenKey = (t: TokenInfo) => `${t.chainId}:${t.address.toLowerCase()}`;

/**
 * Bump the version per the token-lists semver rules:
 *   - tokens removed   -> major
 *   - tokens added     -> minor
 *   - token details changed only -> patch
 *   - no change        -> unchanged
 */
export function bumpVersion(prev: TokenList | null, next: TokenInfo[]): Version {
  if (!prev) return { major: 1, minor: 0, patch: 0 };

  const prevByKey = new Map(prev.tokens.map((t) => [tokenKey(t), t]));
  const nextByKey = new Map(next.map((t) => [tokenKey(t), t]));

  const removed = [...prevByKey.keys()].some((k) => !nextByKey.has(k));
  const added = [...nextByKey.keys()].some((k) => !prevByKey.has(k));

  let changed = false;
  for (const [key, nextToken] of nextByKey) {
    const prevToken = prevByKey.get(key);
    if (prevToken && JSON.stringify(prevToken) !== JSON.stringify(nextToken)) {
      changed = true;
      break;
    }
  }

  const { major, minor, patch } = prev.version;
  if (removed) return { major: major + 1, minor: 0, patch: 0 };
  if (added) return { major, minor: minor + 1, patch: 0 };
  if (changed) return { major, minor, patch: patch + 1 };
  return { major, minor, patch };
}

/** Assemble the full token list with a fresh timestamp and bumped version. */
export function buildList(timestamp: string): TokenList {
  const tokens = buildTokens();
  const version = bumpVersion(readExistingList(), tokens);
  return { ...LIST_META, timestamp, tokens, version };
}
