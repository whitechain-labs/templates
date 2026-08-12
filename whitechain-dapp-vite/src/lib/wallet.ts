import type { Address } from 'viem';
import { useConnection, useDisconnect, useSwitchChain } from 'wagmi';

export interface WalletState {
  address?: Address | undefined;
  chainId?: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  /** Disconnect the active connector. */
  disconnect: () => void;
  /** Switch the active wallet to a chain id. */
  switchChain: (chainId: number) => void;
}

/**
 * The active wallet's connection state plus the disconnect/switch actions,
 * behind a small hook so panels read one shape. Connection itself is opened via
 * the Reown AppKit modal (`useAppKit`), not here.
 */
export function useWallet(): WalletState {
  const { address, chainId, isConnected, isConnecting } = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const { mutate: switchChain } = useSwitchChain();
  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    disconnect,
    switchChain: (targetChainId: number) => {
      switchChain({ chainId: targetChainId });
    },
  };
}
