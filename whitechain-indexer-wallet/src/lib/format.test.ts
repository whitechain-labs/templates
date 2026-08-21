import { describe, expect, it } from 'vitest';

import {
  formatBalance,
  formatUnits,
  formatUsd,
  hexToDecimalString,
  isAddress,
  truncate,
} from '@/lib/format';

describe('truncate', () => {
  it('elides the middle of a full address', () => {
    expect(truncate('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678');
  });

  it('returns short strings unchanged', () => {
    expect(truncate('0x1234')).toBe('0x1234');
  });
});

describe('formatUnits', () => {
  it('formats the documented sample balance', () => {
    // /addresses/{hash} → coin_balance for the docs example address.
    expect(formatUnits('177504708847852442')).toBe('0.177504');
  });

  it('honours a token decimals value other than 18', () => {
    expect(formatUnits('10000000000000000000', 6, 4)).toBe('10,000,000,000,000');
  });

  it('groups the whole part and drops trailing zeros', () => {
    expect(formatUnits('1234000000000000000000')).toBe('1,234');
  });

  it('never loses precision to floating point', () => {
    expect(formatUnits('1000000000000000001')).toBe('1');
    expect(formatUnits('1000000000000000001', 18, 18)).toBe('1.000000000000000001');
  });
});

describe('formatBalance', () => {
  it('does not round a dust balance down to zero', () => {
    expect(formatBalance('1')).toBe('<0.000001');
  });

  it('reports an exactly zero balance as zero', () => {
    expect(formatBalance('0')).toBe('0');
  });
});

describe('hexToDecimalString', () => {
  it('converts the documented eth_getBalance result', () => {
    expect(hexToDecimalString('0x2769f979cd5db9a')).toBe('177504708847852442');
  });

  it('converts the documented nonce and chain head', () => {
    expect(hexToDecimalString('0x1e')).toBe('30');
    expect(hexToDecimalString('0x2f80e0')).toBe('3113184');
  });
});

describe('formatUsd', () => {
  it('multiplies the wei amount by the exchange rate', () => {
    // 0.177504… WBT at 57.52 USD ≈ 10.21 USD, per the docs field table.
    expect(formatUsd('177504708847852442', '57.52')).toBe('$10.21');
  });

  it('returns null when the indexer has no rate', () => {
    expect(formatUsd('177504708847852442', null)).toBeNull();
  });
});

describe('isAddress', () => {
  it('accepts a 40-character hex address', () => {
    expect(isAddress('0xA439Ad519046CCd7056Ddf74fbaAc99d740Bdf09')).toBe(true);
  });

  it('rejects anything the REST API would answer with HTTP 422', () => {
    expect(isAddress('0xnope')).toBe(false);
    expect(isAddress('')).toBe(false);
  });
});
