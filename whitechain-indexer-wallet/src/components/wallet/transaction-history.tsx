import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Spinner } from '@/components/ui/spinner';
import type { Direction, Transaction } from '@/lib/blockscout';
import { explorerLink } from '@/lib/config';
import { formatUnits, grouped, timeAgo, truncate } from '@/lib/format';

const FILTERS: { value: Direction; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'from', label: 'Outbound' },
  { value: 'to', label: 'Inbound' },
];

export interface TransactionHistoryProps {
  address: string;
  transactions: Transaction[];
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
  /** True while another page is being appended. */
  loadingMore: boolean;
  /** Set when the last response carried `next_page_params`. */
  onLoadMore: (() => void) | null;
}

/**
 * Activity list. Two documented capabilities of the endpoint drive the UI: the
 * `filter` query parameter narrows the list to inbound or outbound, and
 * `next_page_params` from the previous response fetches the following page.
 */
export function TransactionHistory({
  address,
  transactions,
  direction,
  onDirectionChange,
  loadingMore,
  onLoadMore,
}: TransactionHistoryProps) {
  const call =
    direction === 'all'
      ? 'GET /addresses/{hash}/transactions'
      : `GET /addresses/{hash}/transactions?filter=${direction}`;

  return (
    <Section
      title="Transaction history"
      description="Newest first. Each row is one pre-decoded transaction, so there is no ABI to supply and no receipt to fetch."
      surface="REST v2"
      call={call}
      aside={
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={direction === filter.value}
              onClick={() => onDirectionChange(filter.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                direction === filter.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      }
    >
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No transactions for this address with the current filter.
        </p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-2 pb-2 font-medium">Transaction</th>
                <th className="px-2 pb-2 font-medium">Action</th>
                <th className="px-2 pb-2 font-medium">Counterparty</th>
                <th className="px-2 pb-2 text-right font-medium">Value</th>
                <th className="px-2 pb-2 text-right font-medium">Fee</th>
                <th className="px-2 pb-2 text-right font-medium">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <Row key={tx.hash} tx={tx} address={address} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onLoadMore && (
        <div className="flex items-center gap-3 pt-4">
          <Button variant="secondary" loading={loadingMore} onClick={onLoadMore}>
            Load more
          </Button>
          <span className="text-xs text-gray-500">
            Continues from the <code className="font-mono">next_page_params</code> the last response
            returned.
          </span>
        </div>
      )}
      {!onLoadMore && transactions.length > 0 && (
        <p className="pt-4 text-xs text-gray-500">
          End of the history: the last response returned{' '}
          <code className="font-mono">next_page_params: null</code>.
        </p>
      )}
      {loadingMore && !onLoadMore && <Spinner size="sm" className="mt-4 text-gray-400" />}
    </Section>
  );
}

function Row({ tx, address }: { tx: Transaction; address: string }) {
  const outbound = tx.from?.hash?.toLowerCase() === address.toLowerCase();
  const counterparty = outbound ? tx.to : tx.from;
  const failed = tx.result !== 'success';

  return (
    <tr className={failed ? 'bg-red-50/40' : undefined}>
      <td className="px-2 py-2.5">
        <a
          className="font-mono text-brand-700 hover:underline"
          href={explorerLink.tx(tx.hash)}
          target="_blank"
          rel="noreferrer"
        >
          {truncate(tx.hash, 6)}
        </a>
        <div className="text-xs text-gray-500 tabular-nums">
          block {grouped(tx.block_number)}
          {tx.confirmations !== null && ` · ${grouped(tx.confirmations)} conf.`}
        </div>
      </td>
      <td className="px-2 py-2.5">
        <span className="flex flex-col">
          <span>{tx.method ?? (tx.created_contract ? 'Contract creation' : 'Transfer')}</span>
          {failed && <span className="text-xs font-medium text-red-600">{tx.result}</span>}
        </span>
      </td>
      <td className="px-2 py-2.5">
        <span className="flex items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
              outbound ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {outbound ? 'out' : 'in'}
          </span>
          <Counterparty
            hash={counterparty?.hash}
            name={counterparty?.name ?? null}
            createdContract={outbound ? tx.created_contract?.hash : undefined}
          />
        </span>
      </td>
      <td className="px-2 py-2.5 text-right font-mono tabular-nums">{formatUnits(tx.value)}</td>
      <td className="px-2 py-2.5 text-right font-mono text-gray-500 tabular-nums">
        {formatUnits(tx.fee?.value)}
      </td>
      <td className="px-2 py-2.5 text-right text-gray-500">{timeAgo(tx.timestamp)}</td>
    </tr>
  );
}

/**
 * A known contract carries a `name`; show it instead of the bare hash. A
 * transaction with no `to` is a contract creation, and the new address arrives
 * in `created_contract`.
 */
function Counterparty({
  hash,
  name,
  createdContract,
}: {
  hash: string | undefined;
  name: string | null;
  createdContract: string | undefined;
}) {
  const target = hash ?? createdContract;
  if (!target) return <span className="text-gray-400">contract creation</span>;

  return (
    <a
      className="font-mono text-gray-700 hover:underline"
      href={explorerLink.address(target)}
      target="_blank"
      rel="noreferrer"
    >
      {name ?? truncate(target)}
      {!hash && createdContract && <span className="text-gray-400"> (new)</span>}
    </a>
  );
}
