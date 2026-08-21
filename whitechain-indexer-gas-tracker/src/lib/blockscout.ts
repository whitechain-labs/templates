// REST API v2 network stats: the source for the slow/average/fast gas tiers and
// the aggregate chain counters.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker
import { REST_V2 } from './config';

/**
 * A gas tier is either a plain Gwei number or an object carrying a `price`,
 * depending on the Blockscout version behind the explorer. Normalize with
 * `gasTierValue` rather than reading the field directly.
 */
type GasTier = number | { price: number | null } | null;

export interface Stats {
  /** Chain totals, returned as strings. Parse before formatting. */
  total_blocks: string | null;
  total_transactions: string | null;
  total_addresses: string | null;
  transactions_today: string | null;
  gas_used_today: string | null;
  /** Mean block time in milliseconds. 1000 means one block per second. */
  average_block_time: number | null;
  /** Recent utilization, 0 to 1. Multiply by 100 for a percentage. */
  network_utilization_percentage: number | null;
  /** Suggested gas prices in Gwei. Tiers can be equal on a quiet chain. */
  gas_prices: { slow: GasTier; average: GasTier; fast: GasTier } | null;
  /** Milliseconds until the next tier refresh. Time your own polling to match. */
  gas_prices_update_in: number | null;
  coin_price: string | null;
}

/**
 * REST v2 answers a malformed request with HTTP 422 and an `errors` array, each
 * entry naming the bad field in `source.pointer`.
 */
interface RestErrorBody {
  errors?: { title?: string; detail?: string }[];
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${REST_V2}/stats`, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as RestErrorBody;
      detail =
        body.errors
          ?.map((e) => [e.title, e.detail].filter(Boolean).join(': '))
          .filter(Boolean)
          .join('; ') ?? '';
    } catch {
      // Not JSON – fall through to the status line.
    }
    throw new Error(
      detail
        ? `REST v2 /stats → ${res.status}: ${detail}`
        : `REST v2 /stats → ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as Stats;
}

/** Normalize a gas tier (number or `{ price }`) to a Gwei number, or null. */
export function gasTierValue(tier: GasTier): number | null {
  if (tier === null || tier === undefined) return null;
  return typeof tier === 'number' ? tier : tier.price;
}

/**
 * Total coin supply, in whole WBT.
 *
 * This lives on the rich-list endpoint rather than on `/stats`, because REST v2
 * has no dedicated supply endpoint. The response also carries 50 addresses,
 * which this call ignores; that is the cost of the only field that reports a
 * meaningful supply.
 *
 * Prefer this over the RPC `stats.coinsupply` action for anything user-facing.
 * That action sums every balance on the chain, and on Whitechain Sepolia the sum
 * is dominated by two genesis sentinel balances (`2^256 - 1` and `2^248 - 1`
 * wei), so it reports about 1.16e59 WBT. See `getCoinSupply` in rpcApi.ts.
 */
export async function getTotalSupply(): Promise<string | null> {
  const res = await fetch(`${REST_V2}/addresses`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`REST v2 /addresses \u2192 ${res.status} ${res.statusText}`);
  const body = (await res.json()) as { total_supply?: string | null };
  // Returned as a decimal string such as "293650828.0"; keep the whole part.
  return body.total_supply ? String(body.total_supply).split('.')[0] : null;
}
