import { type ReactNode, useEffect, useState } from 'react';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import { storageAbi, storageAddress } from '@/lib/storage';
import { whitechainTestnet } from '@/lib/wagmi';
import { useWallet } from '@/lib/wallet';

const targetChainId = whitechainTestnet.id;

/**
 * Storage contract panel. `retrieve()` is a public read, so it runs over the RPC
 * as soon as an address is configured (no wallet needed); `store(uint256)` is a
 * write via wagmi's `useWriteContract` and is gated on a connected wallet on the
 * right network.
 */
export function StoragePanel() {
  const { isConnected, chainId } = useWallet();
  const [inputValue, setInputValue] = useState('');

  const {
    data: storedValue,
    refetch,
    error: readError,
  } = useReadContract({
    abi: storageAbi,
    address: storageAddress,
    functionName: 'retrieve',
    chainId: targetChainId,
    query: { enabled: Boolean(storageAddress) },
  });

  const {
    mutate: storeValue,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: targetChainId,
    query: { enabled: Boolean(txHash) },
  });

  // Refresh the stored value once a write is confirmed. The input is cleared at
  // submit time (in handleStore), so this effect only re-reads the contract.
  useEffect(() => {
    if (receipt.isSuccess) {
      void refetch();
    }
  }, [receipt.isSuccess, refetch]);

  if (!storageAddress) {
    return (
      <p className="text-sm text-gray-500">
        VITE_STORAGE_ADDRESS is not a valid contract address. Set it to a deployed Storage address
        (0x…) or leave it blank to use the default.
      </p>
    );
  }

  const isPendingTx = isWriting || receipt.isLoading;
  const isValidInput = /^\d+$/.test(inputValue);
  const canWrite = isConnected && chainId === targetChainId;

  function handleStore() {
    if (!storageAddress || !isValidInput) {
      return;
    }
    storeValue({
      abi: storageAbi,
      address: storageAddress,
      functionName: 'store',
      args: [BigInt(inputValue)],
      chainId: targetChainId,
    });
    setInputValue('');
  }

  let writeSection: ReactNode;
  if (!isConnected) {
    writeSection = (
      <p className="text-sm text-gray-500">Connect your wallet to read and write the contract.</p>
    );
  } else if (!canWrite) {
    writeSection = (
      <p className="text-sm text-gray-500">
        Switch to Whitechain Sepolia to read and write the contract.
      </p>
    );
  } else {
    writeSection = (
      <>
        <label className="flex flex-col gap-2">
          <span className="text-gray-500">New value</span>
          <input
            inputMode="numeric"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
            placeholder="Enter a number"
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-gray-900"
          />
        </label>

        <Button loading={isPendingTx} disabled={!isValidInput} onClick={handleStore}>
          {receipt.isLoading ? 'Waiting for confirmation…' : 'Store'}
        </Button>

        {receipt.isSuccess && <p className="text-sm text-green-600">Value stored on-chain.</p>}
        {writeError && (
          <p className="text-sm text-red-600">
            Transaction failed. Check your wallet and try again.
          </p>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-gray-500">Stored value</span>
          <span className="text-2xl font-semibold">
            {storedValue === undefined ? '–' : storedValue.toString()}
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            void refetch();
          }}
        >
          Refresh
        </Button>
      </div>

      {readError && <p className="text-sm text-red-600">Could not read the contract.</p>}

      {writeSection}
    </div>
  );
}
