import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { explorerLink } from '@/lib/config';
import { isAddress } from '@/lib/format';

export interface TokenSearchProps {
  initialValue: string;
  exampleToken: string;
  loading: boolean;
  onSubmit: (token: string) => void;
  onInvalid: (message: string) => void;
}

/**
 * Token contract entry. Validation happens here so a malformed value never
 * reaches the API: REST v2 would answer it with HTTP 422, and a local check gives
 * the reader the same answer without a round trip.
 */
export function TokenSearch({
  initialValue,
  exampleToken,
  loading,
  onSubmit,
  onInvalid,
}: TokenSearchProps) {
  const [value, setValue] = useState(initialValue);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const token = value.trim();
    if (!isAddress(token)) {
      onInvalid('Enter a valid 0x… token contract address (40 hex characters).');
      return;
    }
    onSubmit(token);
  };

  return (
    <div className="flex flex-col gap-2">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x… token contract"
          aria-label="Token contract address"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading} className="shrink-0">
            Load token
          </Button>
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={() => {
              setValue(exampleToken);
              onSubmit(exampleToken);
            }}
          >
            Try example
          </Button>
        </div>
      </form>
      <p className="text-xs text-gray-500">
        Find a contract on the explorer&apos;s{' '}
        <a
          className="text-brand-700 hover:underline"
          href={explorerLink.tokens()}
          target="_blank"
          rel="noreferrer"
        >
          tokens page
        </a>
        , or set <code className="font-mono">VITE_DEFAULT_TOKEN</code> to load one on first paint.
      </p>
    </div>
  );
}
