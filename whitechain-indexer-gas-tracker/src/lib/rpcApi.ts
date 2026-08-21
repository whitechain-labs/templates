// Etherscan-compatible RPC client: `/api?module=…&action=…`.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker
//
// A client written against the Etherscan API works here unchanged. The module set
// Blockscout implements is account, block, contract, logs, stats, token, and
// transaction. There is no gas-oracle action, so the gas *tiers* come from REST v2
// `/stats` instead – see blockscout.ts.
import { RPC_API } from './config';

/**
 * Most actions answer with `{ status, message, result }`, where `status` is "1"
 * for success and "0" for a failure or an empty result. `block.eth_block_number`
 * answers with a JSON-RPC envelope instead. `call()` normalizes both down to
 * `result`.
 */
interface RpcEnvelope<T> {
  status?: string;
  message?: string;
  result?: T;
  error?: { message: string };
}

/** `status: "0"` with one of these messages means "nothing found", not a failure. */
const EMPTY_RESULT_MESSAGES = ['No transactions found', 'No data found'];

async function call<T>(
  module: string,
  action: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(RPC_API);
  url.searchParams.set('module', module);
  url.searchParams.set('action', action);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`RPC ${module}.${action} → ${res.status} ${res.statusText}`);
  const body = (await res.json()) as RpcEnvelope<T>;
  if (body.error) throw new Error(`RPC ${module}.${action}: ${body.error.message}`);
  if (body.status === '0' && body.message && !EMPTY_RESULT_MESSAGES.includes(body.message)) {
    throw new Error(`RPC ${module}.${action}: ${body.message}`);
  }
  return body.result as T;
}

export interface CoinPrice {
  coin_usd: string;
  coin_btc: string;
  /** Unix seconds marking when each price was set. */
  coin_usd_timestamp: string;
  coin_btc_timestamp: string;
}

/** Native-coin price in USD and BTC – `?module=stats&action=coinprice`. */
export const getCoinPrice = () => call<CoinPrice>('stats', 'coinprice');

/**
 * Coin supply as a string – `?module=stats&action=coinsupply`.
 *
 * Kept for completeness, because it is one of the documented `stats` actions,
 * but deliberately NOT shown in the UI. Read `getTotalSupply` in blockscout.ts
 * instead for anything user-facing.
 *
 * Two things to know if you do use it:
 *
 * 1. The value is in WHOLE COINS, not wei. It is the sum of every address
 *    balance already divided by 10^18, so dividing again under-reports by a
 *    factor of 10^18. Verified against this explorer's own rich list
 *    (`GET /api/v2/addresses`), whose balances sum to the same 27 leading
 *    digits. It overflows a JavaScript number, so keep it a string.
 *
 * 2. On Whitechain Sepolia it is not a meaningful supply anyway. Two addresses
 *    hold sentinel balances set at genesis, `2^256 - 1` and `2^248 - 1` wei,
 *    and they dominate the sum, which is why it reads about 1.16e59 WBT
 *    against a real WBT max supply of 400 million.
 */
export const getCoinSupply = () => call<string>('stats', 'coinsupply');

/**
 * Total fees paid on `date` (YYYY-MM-DD), in wei – `?module=stats&action=totalfees`.
 * Aggregated per completed day, so the current day reads 0 until it closes.
 */
export const getTotalFees = (date: string) => call<string>('stats', 'totalfees', { date });

/** Latest block height – `?module=block&action=eth_block_number` (hex quantity). */
export async function getBlockNumber(): Promise<number> {
  const hex = await call<string>('block', 'eth_block_number');
  return Number(BigInt(hex));
}

/** The most recent completed UTC day, which is the one `totalfees` has data for. */
export function previousUtcDay(now = new Date()): string {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
