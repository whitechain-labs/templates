import { useEffect, useState } from 'react';

import { getBlockNumber } from './rpcApi';

/**
 * Poll the chain head for a live block-height reading. Whitechain Sepolia
 * produces about one block per second, so a one-second interval keeps it current.
 * Errors are swallowed on purpose: a missed tick should not replace the page with
 * an error, the next tick recovers.
 */
export function useChainHead(intervalMs = 1_000): number | null {
  const [head, setHead] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const tick = () =>
      getBlockNumber()
        .then((height) => {
          if (active) setHead(height);
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
