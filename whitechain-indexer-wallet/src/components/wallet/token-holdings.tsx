import { Section } from '@/components/ui/section';
import type { TokenBalance } from '@/lib/blockscout';
import { explorerLink } from '@/lib/config';
import { formatBalance, truncate } from '@/lib/format';

/** Standards the endpoint can return, in the order this table groups them. */
const STANDARDS = ['ERC-20', 'ERC-721', 'ERC-1155'] as const;

/**
 * `decimals` is only meaningful for fungible tokens; NFT entries return `null`,
 * and there the raw `value` is already a whole count of tokens held.
 */
const decimalsFor = (token: TokenBalance['token']) =>
  Number(token.decimals ?? (token.type === 'ERC-20' ? '18' : '0'));

const standardClasses: Record<string, string> = {
  'ERC-20': 'bg-brand-50 text-brand-700 ring-brand-200',
  'ERC-721': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'ERC-1155': 'bg-amber-50 text-amber-700 ring-amber-200',
};

/**
 * Every balance the address holds, fungible and non-fungible alike. The endpoint
 * returns one flat array, so the only work here is grouping by standard and
 * formatting each `value` against that token's own `decimals` – they differ per
 * token (6 for USDW, 18 for WBT), so 18 is never a safe assumption.
 */
export function TokenHoldings({ balances }: { balances: TokenBalance[] }) {
  const known = new Set<string>(STANDARDS);
  const order = [
    ...STANDARDS,
    ...new Set(balances.map((b) => b.token.type).filter((t) => !known.has(t))),
  ];
  const groups = order
    .map((type) => ({ type, items: balances.filter((b) => b.token.type === type) }))
    .filter((group) => group.items.length > 0);

  return (
    <Section
      title="Token holdings"
      description="Fungible and non-fungible balances, formatted against each token's own decimals."
      surface="REST v2"
      call="GET /addresses/{hash}/token-balances"
      aside={
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600 tabular-nums">
          {balances.length}
        </span>
      }
    >
      {balances.length === 0 ? (
        <p className="text-sm text-gray-500">
          This address holds no tokens. The endpoint returned an empty array.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.type} className="flex flex-col gap-2">
              <span
                className={`w-fit rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                  standardClasses[group.type] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
                }`}
              >
                {group.type}
              </span>
              <ul className="divide-y divide-gray-100">
                {group.items.map((balance) => (
                  <li
                    key={`${balance.token.address_hash}-${balance.token_id ?? 'fungible'}`}
                    className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  >
                    <span className="flex min-w-0 flex-col">
                      <a
                        className="font-medium text-brand-700 hover:underline"
                        href={explorerLink.token(balance.token.address_hash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {balance.token.symbol || truncate(balance.token.address_hash)}
                      </a>
                      <span className="truncate text-xs text-gray-500">
                        {balance.token.name && balance.token.name !== balance.token.symbol
                          ? balance.token.name
                          : truncate(balance.token.address_hash, 6)}
                        {balance.token_id !== null && ` · id ${balance.token_id}`}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {formatBalance(balance.value, decimalsFor(balance.token))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
