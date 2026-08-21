import { Stat } from '@/components/ui/stat';
import type { Stats } from '@/lib/blockscout';
import { compact, formatSeconds, groupDigits, percent } from '@/lib/format';

/**
 * The aggregate counters from REST v2 `/stats`. The totals arrive as strings
 * because they can outgrow a JavaScript number, so they are grouped on the
 * string rather than parsed.
 */
export function NetworkStats({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Total blocks"
        value={stats ? compact(stats.total_blocks) : null}
        hint={stats ? groupDigits(stats.total_blocks) : undefined}
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Total transactions"
        value={stats ? compact(stats.total_transactions) : null}
        hint={stats ? groupDigits(stats.total_transactions) : undefined}
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Total addresses"
        value={stats ? compact(stats.total_addresses) : null}
        hint={stats ? groupDigits(stats.total_addresses) : undefined}
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Avg block time"
        value={stats ? formatSeconds(stats.average_block_time) : null}
        hint="average_block_time is in milliseconds"
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Transactions today"
        value={stats ? groupDigits(stats.transactions_today) : null}
        hint="Resets at 00:00 UTC"
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Gas used today"
        value={stats ? compact(stats.gas_used_today) : null}
        hint={stats ? `${groupDigits(stats.gas_used_today)} gas` : undefined}
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Network utilization"
        value={stats ? percent(stats.network_utilization_percentage) : null}
        hint="Ratio from 0 to 1, multiplied by 100"
        surface="REST v2"
        call="GET /api/v2/stats"
      />
      <Stat
        label="Coin price"
        value={stats?.coin_price ? `$${stats.coin_price}` : null}
        hint="Also on /stats, alongside the tiers"
        surface="REST v2"
        call="GET /api/v2/stats"
      />
    </div>
  );
}
