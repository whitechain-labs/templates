import { useEffect, useState } from 'react';

import { ethBlockNumber } from './ethRpc';

/**
 * Poll `eth_blockNumber` for a live chain-head indicator. Whitechain Sepolia
 * produces about one block per second, so a one-second interval keeps the
 * reading current. Errors are swallowed on purpose: a missed tick should not
 * replace the page with an error, the next tick recovers.
 */
export function useChainHead(intervalMs = 1_000): number | null {
  const [head, setHead] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const tick = () =>
      ethBlockNumber()
        .then((hex) => {
          if (active) setHead(Number(BigInt(hex)));
        })
        .catch(() => undefined);

    void tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return head;
}
