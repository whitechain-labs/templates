// Thin typed client for the Blockscout REST API v2.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-wallet
import { REST_V2 } from './config';

/**
 * A malformed address or query parameter comes back as HTTP 422 with an
 * `errors` array, each entry naming the bad field in `source.pointer`. Parse it
 * so the UI can show "Invalid format…" instead of a bare status code.
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

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${REST_V2}${path}`);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(await readRestError(res, path));
  return (await res.json()) as T;
}

export interface AddressInfo {
  hash: string;
  /** Indexed native balance in wei. `null` for an address the indexer has never seen. */
  coin_balance: string | null;
  /** WBT price in USD at index time, or `null`. Multiply for a USD estimate. */
  exchange_rate: string | null;
  is_contract: boolean;
  is_verified: boolean | null;
  /** Primary name, or `null`. Show it in place of the raw hash when present. */
  ens_domain_name: string | null;
}

export interface TokenBalance {
  value: string;
  /** ERC-1155 balances carry the id of the token held. */
  token_id: string | null;
  token: {
    address_hash: string;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    /** `ERC-20`, `ERC-721`, or `ERC-1155`. */
    type: string;
    icon_url: string | null;
  };
}

export interface Transaction {
  hash: string;
  timestamp: string | null;
  /** `name` is present when the party is a known contract: show it, not the hash. */
  from: { hash: string; name?: string | null } | null;
  to: { hash: string; name?: string | null } | null;
  created_contract: { hash: string } | null;
  /** Native WBT moved, in wei. `0` for a pure contract call. */
  value: string;
  /** `type` is `actual` for a mined transaction or `maximum` while pending. */
  fee: { type: string | null; value: string | null } | null;
  /** Decoded function name, or `null` for a plain transfer or a creation. */
  method: string | null;
  /** `success`, or an error string. */
  result: string;
  block_number: number | null;
  confirmations: number | null;
}

/**
 * REST v2 pages with an opaque `next_page_params` object: send its keys back as
 * query parameters to get the following page. The keys differ per endpoint
 * (transactions page by `block_number` and `index`), so pass them through
 * rather than hardcoding them.
 */
export type PageParams = Record<string, string | number | null>;

export interface Paged<T> {
  items: T[];
  next_page_params: PageParams | null;
}

/** Turn a `next_page_params` object into query parameters for the next request. */
export function toQuery(params: PageParams | null | undefined): Record<string, string> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
}

/** Only inbound, only outbound, or both. Maps to the `filter` query parameter. */
export type Direction = 'all' | 'to' | 'from';

/** Core address record, including the indexed native coin balance (in wei). */
export const getAddress = (hash: string) => getJson<AddressInfo>(`/addresses/${hash}`);

/** Every ERC-20, ERC-721, and ERC-1155 balance held by the address (unpaged). */
export const getTokenBalances = (hash: string) =>
  getJson<TokenBalance[]>(`/addresses/${hash}/token-balances`);

/**
 * Transactions touching the address, newest first. `direction` keeps only
 * inbound (`to`) or only outbound (`from`); `page` continues a previous page.
 */
export const getTransactions = (hash: string, direction: Direction = 'all', page?: PageParams) =>
  getJson<Paged<Transaction>>(`/addresses/${hash}/transactions`, {
    ...(direction === 'all' ? {} : { filter: direction }),
    ...toQuery(page),
  });
