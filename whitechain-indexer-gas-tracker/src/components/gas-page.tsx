import { useCallback, useEffect, useState } from 'react';

import { ChainMetrics } from '@/components/gas/chain-metrics';
import { GasTiers } from '@/components/gas/gas-tiers';
import { NetworkStats } from '@/components/gas/network-stats';
import { Alert } from '@/components/ui/alert';
import { ApiBadge } from '@/components/ui/api-badge';
import { getStats, getTotalSupply, type Stats } from '@/lib/blockscout';
import { EXPLORER_BASE_URL } from '@/lib/config';
import { getCoinPrice, getTotalFees, previousUtcDay, type CoinPrice } from '@/lib/rpcApi';
import { useChainHead } from '@/lib/use-chain-head';

/**
 * Metrics change at different rates, so they are refreshed on two timers. The
 * chain head ticks once per second; everything else refetches every 15 seconds,
 * which is also roughly what `gas_prices_update_in` reports.
 */
const HEAD_MS = 1_000;
const SLOW_MS = 15_000;

interface Snapshot {
  price: CoinPrice | null;
  /** Total supply in whole WBT, from REST v2 rather than stats.coinsupply. */
  totalSupply: string | null;
  feesWei: string | null;
  feesDate: string;
  stats: Stats | null;
}

/**
 * A network dashboard built on the two Blockscout surfaces that carry chain-wide
 * metrics: the Etherscan-compatible RPC API for price, supply, fees, and the
 * head, and REST v2 `/stats` for the gas tiers and the aggregate counters.
 *
 * See https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker
 */
export function GasPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const head = useChainHead(HEAD_MS);

  const refresh = useCallback(async () => {
    const feesDate = previousUtcDay();
    // Every metric is independent, so they load in one batch. Each is allowed to
    // fail on its own: one missing number should not blank the whole dashboard.
    const [price, totalSupply, feesWei, stats] = await Promise.all([
      getCoinPrice().catch(() => null),
      getTotalSupply().catch(() => null),
      getTotalFees(feesDate).catch(() => null),
      getStats().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      }),
    ]);
    if (stats) setError(null);
    setSnapshot({ price, totalSupply, feesWei, feesDate, stats });
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), SLOW_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Gas and network tracker</h1>
        <p className="max-w-2xl text-gray-500">
          Live gas prices and network metrics for Whitechain Sepolia. Headline figures come from the
          explorer&apos;s Etherscan-compatible RPC API; the gas tiers and chain counters come from
          REST v2. Every value is labelled with the request that produced it.
        </p>
      </header>

      {error && <Alert>{error}</Alert>}

      <GasTiers stats={snapshot?.stats ?? null} />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Chain metrics</h2>
          <ApiBadge surface="RPC" call="GET /api?module=…&action=…" />
        </div>
        <ChainMetrics
          price={snapshot?.price ?? null}
          totalSupply={snapshot?.totalSupply ?? null}
          feesWei={snapshot?.feesWei ?? null}
          feesDate={snapshot?.feesDate ?? previousUtcDay()}
          head={head}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Network counters</h2>
          <ApiBadge surface="REST v2" call="GET /api/v2/stats" />
        </div>
        <NetworkStats stats={snapshot?.stats ?? null} />
      </section>

      <footer className="mt-auto flex flex-col gap-2 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <p>
          Chain head every {HEAD_MS / 1000}s, everything else every {SLOW_MS / 1000}s. Data from the
          public{' '}
          <a
            className="text-brand-700 hover:underline"
            href={EXPLORER_BASE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Whitechain Sepolia explorer
          </a>
          . Read-only, no API key, no wallet connection. The native coin is WBT.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <ApiBadge surface="RPC" call="/api" />
          <ApiBadge surface="REST v2" call="/api/v2" />
        </div>
      </footer>
    </main>
  );
}
