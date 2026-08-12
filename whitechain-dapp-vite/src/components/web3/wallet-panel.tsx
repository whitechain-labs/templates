import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';

import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/format';
import { useAppKit, whitechainTestnet } from '@/lib/wagmi';
import { useWallet } from '@/lib/wallet';

const targetChainId = whitechainTestnet.id;

/**
 * Wallet connection panel. Connection is opened through Reown AppKit's modal
 * (`useAppKit().open`); account/network state and the disconnect/switch actions
 * come from `useWallet()`. Balance is a plain wagmi read, formatted with viem.
 */
export function WalletPanel() {
  const { open } = useAppKit();
  const { address, chainId, isConnected, isConnecting, disconnect, switchChain } = useWallet();
  const { data: balance } = useBalance({
    address,
    chainId: targetChainId,
    query: { enabled: Boolean(address) },
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          loading={isConnecting}
          onClick={() => {
            void open();
          }}
        >
          Connect wallet
        </Button>
        <p className="text-sm text-gray-500">No wallet connected yet.</p>
      </div>
    );
  }

  const onWrongNetwork = chainId !== targetChainId;

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Address</dt>
          <dd className="font-mono">{address ? truncateAddress(address) : '–'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Balance</dt>
          <dd>
            {balance ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}` : '–'}
          </dd>
        </div>
      </dl>

      {onWrongNetwork && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600">
            You&apos;re on the wrong network. Switch to Whitechain Sepolia to interact with the
            contract.
          </p>
          <Button
            onClick={() => {
              switchChain(targetChainId);
            }}
          >
            Switch to Whitechain Sepolia
          </Button>
        </div>
      )}

      <Button variant="secondary" onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  );
}
