import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAddress } from '@/lib/format';

export interface AddressSearchProps {
  initialValue: string;
  exampleAddress: string;
  loading: boolean;
  onSubmit: (address: string) => void;
  onInvalid: (message: string) => void;
}

/**
 * Address entry. Validation happens here so a malformed value never reaches the
 * API: REST v2 would answer it with HTTP 422, and a local check gives the reader
 * the same information without a round trip.
 */
export function AddressSearch({
  initialValue,
  exampleAddress,
  loading,
  onSubmit,
  onInvalid,
}: AddressSearchProps) {
  const [value, setValue] = useState(initialValue);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const address = value.trim();
    if (!isAddress(address)) {
      onInvalid('Enter a valid 0x… address (40 hex characters).');
      return;
    }
    onSubmit(address);
  };

  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="0x… address"
        aria-label="Address"
      />
      <div className="flex gap-2">
        <Button type="submit" loading={loading} className="shrink-0">
          Look up
        </Button>
        <Button
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            setValue(exampleAddress);
            onSubmit(exampleAddress);
          }}
        >
          Try example
        </Button>
      </div>
    </form>
  );
}
