// REST API v2 helpers for what GraphQL does not expose: token metadata, the
// aggregate counters, and the holders list.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard
import { REST_V2 } from './config';

/**
 * REST v2 answers a malformed token address or parameter with HTTP 422 and an
 * `errors` array, each entry naming the bad field in `source.pointer`. Parse it
 * so the UI can show the reason instead of a bare status code.
 */
interface RestErrorBody {
  errors?: { title?: string; detail?: string; source?: { pointer?: string } }[];
}

export async function readRestError(res: Response, path: string): Promise<string> {
  let body: RestErrorBody | null = null;
  try {
    body = (await res.json()) as RestErrorBody;
  } catch {
    // Not JSON – fall through to the status line.
  }
  const detail = body?.errors
    ?.map((e) => [e.title, e.detail].filter(Boolean).join(': '))
    .filter(Boolean)
    .join('; ');
  return detail
    ? `REST v2 ${path} → ${res.status}: ${detail}`
    : `REST v2 ${path} → ${res.status} ${res.statusText}`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${REST_V2}${path}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(await readRestError(res, path));
  return (await res.json()) as T;
}

export interface TokenInfo {
  address_hash: string;
  name: string | null;
  symbol: string | null;
  /** Fractional digits. Divide every raw amount in the app by 10^decimals. */
  decimals: string | null;
  /** `ERC-20`, `ERC-721`, or `ERC-1155`. */
  type: string;
  /** Raw total supply, in base units. */
  total_supply: string | null;
  /** USD price, or `null`. Show a price only when it is not `null`. */
  exchange_rate: string | null;
}

/** Both counters come back as strings; parse before formatting. */
export interface TokenCounters {
  token_holders_count: string;
  transfers_count: string;
}

export interface Holder {
  /** `name` is set for known contracts, e.g. `UniswapV3Pool`. */
  address: { hash: string; name?: string | null; is_contract: boolean };
  value: string;
}

interface Paged<T> {
  items: T[];
  next_page_params: Record<string, unknown> | null;
}

/** Name, symbol, decimals, supply, and price. */
export const getToken = (hash: string) => getJson<TokenInfo>(`/tokens/${hash}`);

/** Current holder count and lifetime transfer count. */
export const getCounters = (hash: string) => getJson<TokenCounters>(`/tokens/${hash}/counters`);

/** Top holders by balance (first page). */
export const getHolders = (hash: string) =>
  getJson<Paged<Holder>>(`/tokens/${hash}/holders`).then((page) => page.items);
