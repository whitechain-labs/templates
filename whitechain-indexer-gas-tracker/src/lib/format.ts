// Pure display helpers, shared shape across the Whitechain indexing examples.

/** Base-unit integer string → human decimal string, no float rounding. */
export function formatUnits(
  value: string | number | null | undefined,
  decimals = 18,
  maxFractionDigits = 4,
): string {
  if (value === null || value === undefined || value === '') return '0';
  let s = String(value).trim();
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  // Some endpoints return a decimal point (e.g. "1206.87"); keep the integer part.
  if (s.includes('.')) s = s.split('.')[0];
  if (!/^\d+$/.test(s)) return '0';
  s = s.padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals) || '0';
  let fraction = decimals > 0 ? s.slice(s.length - decimals) : '';
  fraction = fraction.slice(0, maxFractionDigits).replace(/0+$/, '');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = fraction ? `${groupedWhole}.${fraction}` : groupedWhole;
  return negative ? `-${body}` : body;
}

/** Thousands-separated integer (safe for JS-number-range values). */
export function grouped(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toLocaleString('en');
}

/** Thousands-separate an arbitrarily large integer STRING without losing
 *  precision (Number can't represent >~15 digits, so we group on the string). */
export function groupDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  let s = String(value).trim();
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  s = s.replace(/^0+(?=\d)/, ''); // strip leading zeros, keep a lone 0
  if (!/^\d+$/.test(s)) return String(value);
  const g = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `-${g}` : g;
}

/** Compact large numbers: 1234567 → 1.2M. Handles comma-formatted input and
 *  falls back to scientific notation past quadrillions (Intl compact stops at T),
 *  so astronomically large testnet supplies never overflow the card. */
export function compact(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1e15) {
    // e.g. 1.16e+38 → "1.16×10³⁸"
    const [mantissa, exp] = n.toExponential(2).split('e');
    return `${mantissa}×10${toSuperscript(exp)}`;
  }
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  '+': '',
};
function toSuperscript(exp: string): string {
  return exp
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');
}

/** A 0-to-1 ratio → a percentage string. `network_utilization_percentage` is a
 *  ratio, not a percentage, so it has to be multiplied before display. */
export function percent(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

/** Milliseconds → "2.1s". */
export function formatSeconds(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}
