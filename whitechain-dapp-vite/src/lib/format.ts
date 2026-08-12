/**
 * Shorten a hex address for display: `0x1234…5678`. Keeps `visible` hex chars on
 * each side of the elision; returns the input unchanged if it's already short.
 */
export function truncateAddress(address: string, visible = 4): string {
  const prefixLength = 2 + visible; // "0x" + leading chars
  if (address.length <= prefixLength + visible) {
    return address;
  }
  return `${address.slice(0, prefixLength)}…${address.slice(-visible)}`;
}
