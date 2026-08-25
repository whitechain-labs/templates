import { Stat } from '@/components/ui/stat';
import { compact, formatUnits, groupDigits } from '@/lib/format';
import type { CoinPrice } from '@/lib/rpcApi';

export interface ChainMetricsProps {
  price: CoinPrice | null;
  /** Total supply in whole WBT, from REST v2. Already an integer string. */
  totalSupply: string | null;
  feesWei: string | null;
  feesDate: string;
  head: number | null;
}

/**
 * The four headline metrics from the Etherscan-compatible RPC API. This is the
 * surface a client written against Etherscan already speaks, which is why the
 * example reads them here rather than from REST v2.
 */
export function ChainMetrics({ price, totalSupply, feesWei, feesDate, head }: ChainMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="WBT price"
        value={price ? `$${price.coin_usd}` : null}
        hint={price ? `₿ ${price.coin_btc}` : undefined}
        surface="RPC"
        call="stats.coinprice"
      />
      <Stat
        label="Total supply"
        value={totalSupply ? compact(totalSupply) : null}
        unit="WBT"
        hint={totalSupply ? `${groupDigits(totalSupply)} WBT` : undefined}
        // Not stats.coinsupply: that action sums every balance on the chain and
        // reads about 1.16e59 WBT here, because two genesis addresses hold
        // sentinel balances. See getTotalSupply in lib/blockscout.ts.
        surface="REST v2"
        call="GET /api/v2/addresses"
      />
      <Stat
        label={`Fees on ${feesDate}`}
        value={feesWei ? formatUnits(feesWei, 18, 4) : null}
        unit="WBT"
        hint="Aggregated per completed day, so today always reads 0"
        surface="RPC"
        call="stats.totalfees"
      />
      <Stat
        label="Chain head"
        value={head !== null ? groupDigits(head) : null}
        hint="Polled once per second"
        surface="RPC"
        call="block.eth_block_number"
      />
    </div>
  );
}
