import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { ApiBadge } from '@/components/ui/api-badge';
import { Spinner } from '@/components/ui/spinner';
import { AddressLookup } from '@/components/token/address-lookup';
import { TokenSearch } from '@/components/token/token-search';
import { TokenSummary } from '@/components/token/token-summary';
import { TopHolders } from '@/components/token/top-holders';
import { TransferFeed } from '@/components/token/transfer-feed';
import {
  getCounters,
  getHolders,
  getToken,
  type Holder,
  type TokenCounters,
  type TokenInfo,
} from '@/lib/blockscout';
import { DEFAULT_TOKEN, EXAMPLE_TOKEN, EXPLORER_BASE_URL, explorerLink } from '@/lib/config';
import { truncate } from '@/lib/format';
import { getTokenTransfers, type PageInfo, type TokenTransferNode } from '@/lib/graphql';

interface TokenData {
  token: TokenInfo;
  counters: TokenCounters | null;
  holders: Holder[];
  transfers: TokenTransferNode[];
  pageInfo: PageInfo | null;
}

/**
 * A token dashboard split across two API surfaces on purpose. GraphQL serves the
 * transfer feed – one request, exactly the fields asked for, cursor pagination
 * built in. REST v2 serves what the GraphQL schema has no query for: token
 * metadata, the aggregate counters, and the holders list.
 *
 * See https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard
 */
export function TokenPage() {
  const [token, setToken] = useState<string | null>(DEFAULT_TOKEN || null);
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ignore responses from a token the reader has already replaced.
  const requestId = useRef(0);

  const load = useCallback(async (target: string) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      // The three REST reads and the first GraphQL page are independent, so one
      // batch fills the whole dashboard. Counters are optional: a token the
      // indexer has not counted yet should not blank the page.
      const [info, counters, holders, firstPage] = await Promise.all([
        getToken(target),
        getCounters(target).catch(() => null),
        getHolders(target),
        getTokenTransfers(target),
      ]);
      if (id !== requestId.current) return;
      setData({
        token: info,
        counters,
        holders,
        transfers: firstPage.transfers,
        pageInfo: firstPage.pageInfo,
      });
    } catch (e) {
      if (id !== requestId.current) return;
      setData(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  const loadMore = useCallback(async () => {
    if (!token || !data?.pageInfo?.hasNextPage) return;
    setLoadingMore(true);
    try {
      const next = await getTokenTransfers(token, data.pageInfo.endCursor);
      setData((current) =>
        current
          ? {
              ...current,
              transfers: [...current.transfers, ...next.transfers],
              pageInfo: next.pageInfo,
            }
          : current,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }, [token, data?.pageInfo]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Token dashboard</h1>
          <p className="max-w-2xl text-gray-500">
            Supply, holders, and a live transfer feed for any token on Whitechain Sepolia. The feed
            comes from the explorer&apos;s GraphQL API; metadata, counters, and holders come from
            REST v2. Every value is labelled with the request that produced it.
          </p>
        </div>

        <TokenSearch
          initialValue={DEFAULT_TOKEN || EXAMPLE_TOKEN}
          exampleToken={EXAMPLE_TOKEN}
          loading={loading}
          onSubmit={(value) => {
            setError(null);
            setToken(value);
          }}
          onInvalid={(message) => {
            setToken(null);
            setData(null);
            setError(message);
          }}
        />

        {data && (
          <p className="text-sm text-gray-500">
            Reading{' '}
            <a
              className="font-medium text-brand-700 hover:underline"
              href={explorerLink.token(data.token.address_hash)}
              target="_blank"
              rel="noreferrer"
            >
              {data.token.name ?? truncate(data.token.address_hash, 6)}
              {data.token.symbol &&
                data.token.symbol !== data.token.name &&
                ` (${data.token.symbol})`}
            </a>{' '}
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{data.token.type}</span> on{' '}
            {new URL(EXPLORER_BASE_URL).host}
          </p>
        )}
      </header>

      {error && <Alert>{error}</Alert>}

      {loading && !data && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Spinner size="sm" /> Sending three REST reads and the first GraphQL page in parallel…
        </div>
      )}

      {data && (
        <>
          <TokenSummary token={data.token} counters={data.counters} />
          <TransferFeed
            transfers={data.transfers}
            token={data.token}
            pageInfo={data.pageInfo}
            loadingMore={loadingMore}
            onLoadMore={() => void loadMore()}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <TopHolders holders={data.holders} token={data.token} />
            <AddressLookup initialValue={data.holders[0]?.address.hash ?? ''} />
          </div>
        </>
      )}

      {!token && !error && (
        <p className="text-sm text-gray-500">
          Enter a token contract above, or load the example, to send the first batch of requests.
        </p>
      )}

      <footer className="mt-auto flex flex-col gap-2 border-t border-gray-200 pt-6 text-sm text-gray-500">
        <p>
          Data from the public{' '}
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
          <ApiBadge surface="GraphQL" call="/api/v1/graphql" />
          <ApiBadge surface="REST v2" call="/api/v2" />
        </div>
      </footer>
    </main>
  );
}
