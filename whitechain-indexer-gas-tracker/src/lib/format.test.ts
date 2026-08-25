import { describe, expect, it } from 'vitest';

import { compact, formatSeconds, formatUnits, groupDigits, grouped, percent } from '@/lib/format';
import { previousUtcDay } from '@/lib/rpcApi';

describe('formatUnits', () => {
  it('formats the documented daily fee total', () => {
    // stats.totalfees → 129648734562000000 wei is about 0.1296 WBT.
    expect(formatUnits('129648734562000000', 18, 4)).toBe('0.1296');
  });

  it('keeps full precision on a value far past the JS number range', () => {
    // A 60-digit input, which Number() would mangle. This exercises the string
    // arithmetic itself; for the coinsupply endpoint specifically, see the
    // "coinsupply units" block below, which does NOT divide by 10^18.
    const huge = '116244402085899461811944309200000000000000000000000000000000';
    expect(formatUnits(huge, 18, 0)).toBe(
      '116,244,402,085,899,461,811,944,309,200,000,000,000,000',
    );
  });
});

describe('total supply', () => {
  // GET /api/v2/addresses -> total_supply, a decimal string in whole WBT. It
  // matches CoinGecko's WBT total supply of 293.651M exactly, which is why the
  // supply card reads this rather than the RPC stats.coinsupply action.
  const TOTAL_SUPPLY = '293650828';

  it('renders as a compact figure', () => {
    expect(compact(TOTAL_SUPPLY)).toBe('293.65M');
  });

  it('renders the exact figure grouped', () => {
    expect(groupDigits(TOTAL_SUPPLY)).toBe('293,650,828');
  });

  it('stays under the real WBT max supply of 400 million', () => {
    expect(Number(TOTAL_SUPPLY)).toBeLessThan(400_000_000);
  });
});

describe('why stats.coinsupply is not displayed', () => {
  // Sentinel genesis balances dominate the chain, so the action reads ~1.16e59
  // WBT. Kept as a test so the reason survives in the suite: if anyone wires
  // this back into the UI, these numbers show what they would be showing.
  const COINSUPPLY = '116244402085899461811944309200000000000000000000000000000000';

  it('reads absurdly high, being a sum of all balances', () => {
    // Already in whole coins: not divided by 10^18 here, and it is still 1e59.
    expect(compact(COINSUPPLY)).toBe('1.16×10⁵⁹');
  });

  it('would be wrong by a further 10^18 if treated as wei', () => {
    expect(compact(formatUnits(COINSUPPLY, 18, 0).replace(/,/g, ''))).toBe('1.16×10⁴¹');
  });
});

describe('groupDigits', () => {
  it('groups an integer string too long for Number', () => {
    expect(groupDigits('3110938')).toBe('3,110,938');
    expect(groupDigits('116244402085899461811944309200')).toBe(
      '116,244,402,085,899,461,811,944,309,200',
    );
  });

  it('reports a missing value as an em dash', () => {
    expect(groupDigits(null)).toBe('—');
  });
});

describe('compact', () => {
  it('shortens the documented chain totals', () => {
    expect(compact('3110938')).toBe('3.11M');
    expect(compact('69677')).toBe('69.68K');
  });

  it('falls back to scientific notation past quadrillions', () => {
    // Intl compact notation stops at T, so a testnet supply needs its own form.
    expect(compact('1.16e+38')).toBe('1.16×10³⁸');
  });
});

describe('percent', () => {
  it('turns the documented utilization ratio into a percentage', () => {
    // network_utilization_percentage is 0 to 1, not 0 to 100.
    expect(percent(0.1178324)).toBe('11.78%');
  });

  it('reports a missing value as an em dash', () => {
    expect(percent(null)).toBe('—');
  });
});

describe('formatSeconds', () => {
  it('turns the documented block time into seconds', () => {
    expect(formatSeconds(1000)).toBe('1.0s');
  });
});

describe('grouped', () => {
  it('separates thousands', () => {
    expect(grouped(86581)).toBe('86,581');
  });
});

describe('previousUtcDay', () => {
  it('returns the most recent completed UTC day', () => {
    expect(previousUtcDay(new Date('2026-07-22T03:00:00Z'))).toBe('2026-07-21');
  });

  it('rolls back across a month boundary', () => {
    expect(previousUtcDay(new Date('2026-08-01T00:30:00Z'))).toBe('2026-07-31');
  });
});
