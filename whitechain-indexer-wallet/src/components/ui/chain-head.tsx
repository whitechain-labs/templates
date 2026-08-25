import { ApiBadge } from './api-badge';
import { grouped } from '@/lib/format';

/** Live block-height chip for the page header. `null` while the first poll runs. */
export function ChainHead({ head }: { head: number | null }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm tabular-nums shadow-sm">
        <span
          className={
            head === null
              ? 'size-2 rounded-full bg-gray-300'
              : 'size-2 animate-pulse rounded-full bg-emerald-500'
          }
        />
        {head === null ? 'connecting…' : `#${grouped(head)}`}
      </span>
      <ApiBadge surface="ETH RPC" call="eth_blockNumber" />
    </div>
  );
}
