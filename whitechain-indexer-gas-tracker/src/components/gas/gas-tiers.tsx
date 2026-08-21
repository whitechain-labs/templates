import { ApiBadge } from '@/components/ui/api-badge';
import { Card } from '@/components/ui/card';
import { gasTierValue, type Stats } from '@/lib/blockscout';
import { cn } from '@/lib/cn';

const TIERS = [
  { key: 'slow', label: 'Slow', accent: 'text-gray-700' },
  { key: 'average', label: 'Average', accent: 'text-brand-700' },
  { key: 'fast', label: 'Fast', accent: 'text-emerald-700' },
] as const;

/**
 * The three suggested gas prices. Blockscout's Etherscan-compatible RPC has no
 * gas-oracle action, so the tiers come from REST v2 `/stats` – the canonical
 * source for them. On a quiet chain all three read the same, which is correct,
 * not a bug.
 */
export function GasTiers({ stats }: { stats: Stats | null }) {
  return (
    <Card className="flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Gas price</h2>
        <ApiBadge surface="REST v2" call="GET /api/v2/stats · gas_prices" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const value = stats?.gas_prices ? gasTierValue(stats.gas_prices[tier.key]) : null;
          return (
            <div
              key={tier.key}
              className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <span className="text-sm text-gray-500">{tier.label}</span>
              <span className={cn('text-3xl font-semibold tabular-nums', tier.accent)}>
                {value ?? <span className="text-gray-300">–</span>}
              </span>
              <span className="text-xs text-gray-500">Gwei</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        {stats?.gas_prices_update_in
          ? `The explorer refreshes these tiers every ${Math.round(stats.gas_prices_update_in / 1000)}s (gas_prices_update_in), which is what this page's slow timer is matched to.`
          : 'Tiers are equal when the chain is quiet – there is no congestion to price.'}
      </p>
    </Card>
  );
}
