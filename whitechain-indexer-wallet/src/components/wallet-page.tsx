import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { ApiBadge } from '@/components/ui/api-badge';
import { ChainHead } from '@/components/ui/chain-head';
import { Spinner } from '@/components/ui/spinner';
import { AddressSearch } from '@/components/wallet/address-search';
import { AddressSummary } from '@/components/wallet/address-summary';
import { TokenHoldings } from '@/components/wallet/token-holdings';
import { TransactionHistory } from '@/components/wallet/transaction-history';
import {
  getAddress,
  getTokenBalances,
  getTransactions,
  type AddressInfo,
  type Direction,
  type PageParams,
  type TokenBalance,
  type Transaction,
} from '@/lib/blockscout';
import { EXAMPLE_ADDRESS, EXPLORER_BASE_URL, explorerLink } from '@/lib/config';
import { ethGetBalance, ethGetTransactionCount } from '@/lib/ethRpc';
import { hexToDecimalString, truncate } from '@/lib/format';
import { useChainHead } from '@/lib/use-chain-head';

interface WalletData {
  info: AddressInfo;
  liveBalanceWei: string;
  nonce: string;
  tokens: TokenBalance[];
  transactions: Transaction[];
  nextPage: PageParams | null;
}

/**
 * A wallet view assembled entirely from the public explorer: REST v2 for the
 * indexed record and ETH JSON-RPC for live node state. No node, no indexer, and
 * no API key of your own.
 *
 * See https://docs.whitechain.io/build/block-explorer/indexer-wallet
 */
export function WalletPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>('all');
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const head = useChainHead();
  // Ignore responses from a lookup the reader has already replaced.
  const requestId = useRef(0);

  const load = useCallback(async (target: string, filter: Direction) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      // None of the six requests depends on another, so one batch fills the
      // whole page at once.
      const [info, tokens, page, balanceHex, nonceHex] = await Promise.all([
        getAddress(target),
        getTokenBalances(target),
        getTransactions(target, filter),
        ethGetBalance(target),
        ethGetTransactionCount(target),
      ]);
      if (id !== requestId.current) return;
      setData({
        info,
        tokens,
        transactions: page.items,
        nextPage: page.next_page_params,
        liveBalanceWei: hexToDecimalString(balanceHex),
        nonce: hexToDecimalString(nonceHex),
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
    if (address) void load(address, direction);
  }, [address, direction, load]);

  const loadMore = useCallback(async () => {
    if (!address || !data?.nextPage) return;
    setLoadingMore(true);
    try {
      const page = await getTransactions(address, direction, data.nextPage);
      setData((current) =>
        current
          ? {
              ...current,
              transactions: [...current.transactions, ...page.items],
              nextPage: page.next_page_params,
            }
          : current,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }, [address, data?.nextPage, direction]);

  // A well-formed address the indexer has never seen is not an error: the
  // endpoints answer HTTP 200 with null fields and empty collections.
  const unseen =
    data !== null &&
    data.info.coin_balance === null &&
    data.tokens.length === 0 &&
    data.transactions.length === 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Wallet indexer</h1>
            <p className="max-w-2xl text-gray-500">
              Balances, token holdings, and transaction history for any address on Whitechain
              Sepolia, read from the public Blockscout explorer. Every value on this page is
              labelled with the request that produced it.
            </p>
          </div>
          <ChainHead head={head} />
        </div>

        <AddressSearch
          initialValue={EXAMPLE_ADDRESS}
          exampleAddress={EXAMPLE_ADDRESS}
          loading={loading}
          onSubmit={(value) => {
            setError(null);
            setAddress(value);
          }}
          onInvalid={(message) => {
            setAddress(null);
            setData(null);
            setError(message);
          }}
        />

        {address && (
          <p className="text-sm text-gray-500">
            Reading{' '}
            <a
              className="font-mono text-brand-700 hover:underline"
              href={explorerLink.address(address)}
              target="_blank"
              rel="noreferrer"
            >
              {data?.info.ens_domain_name ?? truncate(address, 6)}
            </a>{' '}
            on {new URL(EXPLORER_BASE_URL).host}
          </p>
        )}
      </header>

      {error && <Alert>{error}</Alert>}

      {loading && !data && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Spinner size="sm" /> Sending five requests in parallel…
        </div>
      )}

      {unseen && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          The explorer has no record of this address yet. That is a valid HTTP 200 response with
          empty fields, not an error – the address simply has no activity on this chain.
        </Alert>
      )}

      {data && !unseen && (
        <>
          <AddressSummary
            info={data.info}
            liveBalanceWei={data.liveBalanceWei}
            nonce={data.nonce}
          />
          <TokenHoldings balances={data.tokens} />
          <TransactionHistory
            address={data.info.hash}
            transactions={data.transactions}
            direction={direction}
            onDirectionChange={setDirection}
            loadingMore={loadingMore}
            onLoadMore={data.nextPage ? () => void loadMore() : null}
          />
        </>
      )}

      {!address && !error && (
        <p className="text-sm text-gray-500">
          Enter an address above, or load the example, to send the first batch of requests.
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
          <ApiBadge surface="REST v2" call="/api/v2" />
          <ApiBadge surface="ETH RPC" call="/api/eth-rpc" />
        </div>
      </footer>
    </main>
  );
}
