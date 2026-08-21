import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Section } from '@/components/ui/section';
import { explorerLink } from '@/lib/config';
import { formatUnits, isAddress, truncate } from '@/lib/format';
import { getAddress, type AddressNode } from '@/lib/graphql';

type Result =
  { kind: 'found'; node: AddressNode } | { kind: 'missing' } | { kind: 'error'; message: string };

/**
 * The second GraphQL query. Use it to annotate a holder row: it answers, in one
 * round trip, what an address's native balance is and whether it holds contract
 * code (`contractCode: null` means a wallet, not a contract).
 */
export function AddressLookup({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const hash = value.trim();
    if (!isAddress(hash)) {
      setResult({ kind: 'error', message: 'Enter a valid 0x… address (40 hex characters).' });
      return;
    }
    setLoading(true);
    try {
      const node = await getAddress(hash);
      setResult(node ? { kind: 'found', node } : { kind: 'missing' });
    } catch (e) {
      setResult({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Address lookup"
      description="Native balance and contract check for a single address, in one GraphQL round trip."
      surface="GraphQL"
      call="POST /api/v1/graphql · address"
    >
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x… address"
          aria-label="Address to look up"
        />
        <Button type="submit" loading={loading} className="shrink-0">
          Look up
        </Button>
      </form>

      {result?.kind === 'error' && <p className="pt-3 text-sm text-red-700">{result.message}</p>}

      {result?.kind === 'missing' && (
        <p className="pt-3 text-sm text-gray-500">
          The query returned <code className="font-mono">address: null</code> – the explorer has no
          record of this address.
        </p>
      )}

      {result?.kind === 'found' && (
        <dl className="flex flex-col gap-2 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Address</dt>
            <dd>
              <a
                className="font-mono text-brand-700 hover:underline"
                href={explorerLink.address(result.node.hash)}
                target="_blank"
                rel="noreferrer"
              >
                {truncate(result.node.hash, 6)}
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Native balance</dt>
            <dd className="font-mono tabular-nums">
              {formatUnits(result.node.fetchedCoinBalance, 18, 6)} WBT
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Type</dt>
            <dd>{result.node.contractCode === null ? 'Wallet' : 'Contract'}</dd>
          </div>
        </dl>
      )}
    </Section>
  );
}
