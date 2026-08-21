import { Section } from '@/components/ui/section';
import type { Holder, TokenInfo } from '@/lib/blockscout';
import { explorerLink } from '@/lib/config';
import { formatBalance, sharePercent, truncate } from '@/lib/format';

export interface TopHoldersProps {
  holders: Holder[];
  token: TokenInfo;
}

/**
 * Top holders by balance. Each item pairs an `address` with a raw `value`, so the
 * balance is formatted against the token's own decimals and kept at full
 * precision – rounding a small holder to zero would hide a real holder.
 */
export function TopHolders({ holders, token }: TopHoldersProps) {
  const decimals = Number(token.decimals ?? '0');

  return (
    <Section
      title="Top holders"
      description="First page of holders, largest balance first."
      surface="REST v2"
      call="GET /tokens/{hash}/holders"
      aside={
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600 tabular-nums">
          {holders.length}
        </span>
      }
    >
      {holders.length === 0 ? (
        <p className="text-sm text-gray-500">No holders indexed for this token.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {holders.map((holder, index) => {
            const share = sharePercent(holder.value, token.total_supply);
            return (
              <li
                key={holder.address.hash}
                className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
              >
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="w-5 shrink-0 text-xs text-gray-400 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <a
                      className="truncate font-mono text-brand-700 hover:underline"
                      href={explorerLink.address(holder.address.hash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {holder.address.name ?? truncate(holder.address.hash, 6)}
                    </a>
                    {holder.address.is_contract && (
                      <span className="text-xs text-gray-500">Contract</span>
                    )}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-mono tabular-nums">
                    {formatBalance(holder.value, decimals)}
                  </span>
                  {share && <span className="text-xs text-gray-500 tabular-nums">{share}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
