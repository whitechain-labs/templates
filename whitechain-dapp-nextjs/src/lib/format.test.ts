import { describe, expect, it } from 'vitest';

import { truncateAddress } from '@/lib/format';

describe('truncateAddress', () => {
  it('elides the middle of a full address', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678');
  });

  it('returns short strings unchanged', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234');
  });

  it('respects a custom visible count', () => {
    expect(truncateAddress('0xabcdef0123456789', 3)).toBe('0xabc…789');
  });
});
