// Pure display helpers, shared in the same shape across the Whitechain
// indexing examples.

/** Shorten a hex hash for display: `0x1234…5678`. */
export function truncate(hash: string, visible = 4): string {
  if (!hash) return '';
  const head = 2 + visible;
  return hash.length <= head + visible ? hash : `${hash.slice(0, head)}…${hash.slice(-visible)}`;
}

/**
 * Base-unit integer string → human decimal string, with no floating-point
 * rounding error. Amounts in this app are always formatted against the token's
 * own `decimals` from `/tokens/{hash}`, never against a hardcoded 18.
 */
export function formatUnits(
  value: string | number | null | undefined,
  decimals = 18,
  maxFractionDigits = 4,
): string {
  if (value === null || value === undefined || value === '') return '0';
  let s = String(value).trim();
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  if (!/^\d+$/.test(s)) return '0';
  s = s.padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals) || '0';
  let fraction = decimals > 0 ? s.slice(s.length - decimals) : '';
  fraction = fraction.slice(0, maxFractionDigits).replace(/0+$/, '');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = fraction ? `${groupedWhole}.${fraction}` : groupedWhole;
  return negative ? `-${body}` : body;
}

/**
 * Format a balance without ever rounding a non-zero holding down to "0", so a
 * dust holder still reads as a holder.
 */
export function formatBalance(value: string | number | null | undefined, decimals = 18): string {
  if (value === null || value === undefined || value === '' || value === '0') return '0';
  const shown = formatUnits(value, decimals, 6);
  return shown === '0' ? '<0.000001' : shown;
}

/** Compact large integers: 12345 → 12.3K. Good for holder and transfer counts. */
export function compact(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** Thousands-separated integer, or an em dash when the value is missing. */
export function grouped(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toLocaleString('en');
}

/**
 * USD price from `exchange_rate` (USD per whole token). Returns `null` when the
 * indexer has no rate, so the caller can omit the card rather than print `$0`.
 */
export function formatPrice(exchangeRate: string | null | undefined): string | null {
  if (!exchangeRate) return null;
  const rate = Number(exchangeRate);
  if (!Number.isFinite(rate)) return null;
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 6,
  }).format(rate);
}

/** Share of a total supply, as a percentage string. */
export function sharePercent(
  value: string | null | undefined,
  totalSupply: string | null | undefined,
): string | null {
  if (!value || !totalSupply) return null;
  const total = Number(totalSupply);
  const part = Number(value);
  if (!Number.isFinite(total) || !Number.isFinite(part) || total === 0) return null;
  const pct = (part / total) * 100;
  if (pct > 0 && pct < 0.01) return '<0.01%';
  return `${pct.toFixed(2)}%`;
}

/** `0x…` with 40 hex characters – the format REST v2 validates against. */
export const isAddress = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value.trim());
