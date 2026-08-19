import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import type { TokenInfo } from '@/lib/blockscout';
import { ZERO_ADDRESS, explorerLink } from '@/lib/config';
import { formatBalance, truncate } from '@/lib/format';
import { TRANSFERS_PAGE_SIZE, type PageInfo, type TokenTransferNode } from '@/lib/graphql';

export interface TransferFeedProps {
  transfers: TokenTransferNode[];
  token: TokenInfo;
  pageInfo: PageInfo | null;
  loadingMore: boolean;
  onLoadMore: () => void;
}

/**
 * The GraphQL half of the dashboard. One request returns exactly six fields per
 * transfer and an opaque cursor, which is where GraphQL earns its place here: no
 * over-fetching, and cursor pagination is built into the connection.
 */
export function TransferFeed({
  transfers,
  token,
  pageInfo,
  loadingMore,
  onLoadMore,
}: TransferFeedProps) {
  const decimals = Number(token.decimals ?? '0');

  return (
    <Section
      title="Transfer feed"
      description={`One request per page of ${TRANSFERS_PAGE_SIZE}, newest first. The page size keeps the operation under the server's complexity cap of 100.`}
      surface="GraphQL"
      call="POST /api/v1/graphql · tokenTransfers"
      aside={
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600 tabular-nums">
          {transfers.length}
        </span>
      }
    >
      {transfers.length === 0 ? (
        <p className="text-sm text-gray-500">No transfers indexed for this token.</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-2xl border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-2 pb-2 font-medium">Transaction</th>
                <th className="px-2 pb-2 font-medium">From</th>
                <th className="px-2 pb-2 font-medium">To</th>
                <th className="px-2 pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((transfer, index) => {
                const isMint = transfer.fromAddressHash.toLowerCase() === ZERO_ADDRESS;
                return (
                  <tr key={`${transfer.transactionHash}-${index}`}>
                    <td className="px-2 py-2.5">
                      <a
                        className="font-mono text-brand-700 hover:underline"
                        href={explorerLink.tx(transfer.transactionHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {truncate(transfer.transactionHash, 6)}
                      </a>
                    </td>
                    <td className="px-2 py-2.5">
                      {isMint ? (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                          mint
                        </span>
                      ) : (
                        <AddressCell hash={transfer.fromAddressHash} />
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <AddressCell hash={transfer.toAddressHash} />
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                      {transfer.tokenIds?.length ? (
                        <span className="text-gray-700">id {transfer.tokenIds.join(', ')}</span>
                      ) : (
                        formatBalance(transfer.amount, decimals)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageInfo?.hasNextPage ? (
        <div className="flex items-center gap-3 pt-4">
          <Button variant="secondary" loading={loadingMore} onClick={onLoadMore}>
            Load more
          </Button>
          <span className="truncate text-xs text-gray-500">
            Sends <code className="font-mono">after: {shortenCursor(pageInfo.endCursor)}</code>, the
            opaque cursor the last page returned.
          </span>
        </div>
      ) : (
        transfers.length > 0 && (
          <p className="pt-4 text-xs text-gray-500">
            End of the feed: <code className="font-mono">hasNextPage</code> is false.
          </p>
        )
      )}
    </Section>
  );
}

/** Cursors are opaque base64, not hashes: show a recognisable head, not a middle. */
function shortenCursor(cursor: string | null): string {
  if (!cursor) return 'null';
  return cursor.length <= 14 ? cursor : `${cursor.slice(0, 12)}…`;
}

function AddressCell({ hash }: { hash: string }) {
  return (
    <a
      className="font-mono text-gray-700 hover:underline"
      href={explorerLink.address(hash)}
      target="_blank"
      rel="noreferrer"
    >
      {truncate(hash)}
    </a>
  );
}
