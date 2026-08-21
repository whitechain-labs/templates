import { Stat } from '@/components/ui/stat';
import type { TokenCounters, TokenInfo } from '@/lib/blockscout';
import { compact, formatPrice, formatUnits, grouped } from '@/lib/format';

export interface TokenSummaryProps {
  token: TokenInfo;
  counters: TokenCounters | null;
}

/**
 * The headline numbers, all from REST v2. `decimals` is read once here and then
 * threaded through every amount in the app, because raw values from both APIs
 * are in base units and the divisor differs per token.
 */
export function TokenSummary({ token, counters }: TokenSummaryProps) {
  const decimals = Number(token.decimals ?? '0');
  const price = formatPrice(token.exchange_rate);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Total supply"
        // A testnet supply can run to 15 digits, so the headline is compact and
        // the exact figure sits underneath it.
        value={compact(formatUnits(token.total_supply, decimals, 0).replace(/,/g, ''))}
        unit={token.symbol ?? undefined}
        hint={`${formatUnits(token.total_supply, decimals, 2)} · raw value divided by 10^${decimals}`}
        surface="REST v2"
        call="GET /tokens/{hash}"
      />
      <Stat
        label="Holders"
        value={counters ? compact(counters.token_holders_count) : null}
        hint={counters ? `${grouped(counters.token_holders_count)} addresses` : undefined}
        surface="REST v2"
        call="GET /tokens/{hash}/counters"
      />
      <Stat
        label="Transfers"
        value={counters ? compact(counters.transfers_count) : null}
        hint={counters ? `${grouped(counters.transfers_count)} lifetime events` : undefined}
        surface="REST v2"
        call="GET /tokens/{hash}/counters"
      />
      <Stat
        label="Price"
        value={price ?? 'Not indexed'}
        hint={price ? 'From exchange_rate' : 'exchange_rate is null for this token'}
        surface="REST v2"
        call="GET /tokens/{hash}"
      />
    </div>
  );
}
