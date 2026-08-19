// Pure display helpers. No dependencies, so they are easy to reason about and
// shared in the same shape across the Whitechain indexing examples.

/** Shorten a hex hash for display: `0x1234…5678`. */
export function truncate(hash: string, visible = 4): string {
  if (!hash) return '';
  const head = 2 + visible;
  return hash.length <= head + visible ? hash : `${hash.slice(0, head)}…${hash.slice(-visible)}`;
}

/**
 * Format a base-unit integer string (wei-like) into a human decimal string,
 * without floating-point rounding error. `maxFractionDigits` trims trailing
 * precision for display only.
 */
export function formatUnits(
  value: string | number | null | undefined,
  decimals = 18,
  maxFractionDigits = 6,
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
 * Format a token balance without ever rounding a non-zero holding down to "0".
 * Token `decimals` differ per token (6 for USDW, 18 for WBT), so callers must
 * pass the token's own value rather than assuming 18.
 */
export function formatBalance(value: string | number | null | undefined, decimals = 18): string {
  if (value === null || value === undefined || value === '' || value === '0') return '0';
  const shown = formatUnits(value, decimals, 6);
  return shown === '0' ? '<0.000001' : shown;
}

/** Hex quantity (`0x…`) → decimal string. JSON-RPC returns hex, not numbers. */
export function hexToDecimalString(hex: string): string {
  if (!hex) return '0';
  return BigInt(hex).toString(10);
}

/**
 * USD estimate for a wei amount at an `exchange_rate` (USD per whole coin, as
 * returned by `/addresses/{hash}`). Returns `null` when there is no rate, so
 * the caller can omit the line rather than print a misleading `$0`.
 */
export function formatUsd(
  wei: string | null | undefined,
  exchangeRate: string | null | undefined,
): string | null {
  if (!wei || !exchangeRate) return null;
  const rate = Number(exchangeRate);
  if (!Number.isFinite(rate) || rate === 0) return null;
  const coins = Number(wei) / 1e18;
  if (!Number.isFinite(coins)) return null;
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(coins * rate);
}

/** Thousands-separated integer, or an em dash when the value is missing. */
export function grouped(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toLocaleString('en');
}

/** ISO timestamp or epoch seconds → compact "5m ago". */
export function timeAgo(input: string | number | null | undefined): string {
  if (!input) return '';
  const then = typeof input === 'number' ? input * 1000 : Date.parse(input);
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** `0x…` with 40 hex characters – the format REST v2 validates against. */
export const isAddress = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value.trim());
