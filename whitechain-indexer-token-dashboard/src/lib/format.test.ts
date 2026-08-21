import { describe, expect, it } from 'vitest';

import {
  compact,
  formatBalance,
  formatPrice,
  formatUnits,
  isAddress,
  sharePercent,
  truncate,
} from '@/lib/format';

describe('formatUnits', () => {
  it('formats the documented transfer amount against the token decimals', () => {
    // 207128221 raw at 6 decimals is 207.128221 USDW.
    expect(formatUnits('207128221', 6, 6)).toBe('207.128221');
  });

  it('formats the documented total supply', () => {
    // /tokens/{hash} → total_supply for USDW, decimals 6.
    expect(formatUnits('10000000013605001000', 6, 2)).toBe('10,000,000,013,605');
  });

  it('never loses precision to floating point', () => {
    expect(formatUnits('1000000000000000001', 18, 18)).toBe('1.000000000000000001');
  });
});

describe('formatBalance', () => {
  it('keeps a dust holder visible', () => {
    expect(formatBalance('1', 18)).toBe('<0.000001');
  });

  it('formats the documented pool balance', () => {
    // A UniswapV3Pool holding 2792871783 raw USDW (6 decimals).
    expect(formatBalance('2792871783', 6)).toBe('2,792.871783');
  });
});

describe('sharePercent', () => {
  it('reports a holder share of the total supply', () => {
    expect(sharePercent('2500000', '10000000')).toBe('25.00%');
  });

  it('flags a share too small to round', () => {
    expect(sharePercent('1', '10000000000')).toBe('<0.01%');
  });

  it('returns null without a supply to divide by', () => {
    expect(sharePercent('100', null)).toBeNull();
  });
});

describe('formatPrice', () => {
  it('omits the price when exchange_rate is null', () => {
    // USDW returns exchange_rate: null on testnet.
    expect(formatPrice(null)).toBeNull();
  });

  it('formats a rate that is present', () => {
    expect(formatPrice('57.52')).toBe('$57.52');
  });
});

describe('compact', () => {
  it('shortens a large counter', () => {
    expect(compact('31')).toBe('31');
    expect(compact('12345')).toBe('12.3K');
  });
});

describe('truncate', () => {
  it('elides the middle of a hash', () => {
    expect(truncate('0x071c373d58A5290982a0E916D529a27849baE6e0')).toBe('0x071c…E6e0');
  });
});

describe('isAddress', () => {
  it('accepts the documented token contract', () => {
    expect(isAddress('0x071c373d58A5290982a0E916D529a27849baE6e0')).toBe(true);
  });

  it('rejects what REST v2 would answer with HTTP 422', () => {
    expect(isAddress('not-a-token')).toBe(false);
  });
});
