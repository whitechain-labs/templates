/**
 * ABI of the example `Storage` contract, the same `store(uint256)` /
 * `retrieve() -> uint256` contract shipped by the companion Whitechain Hardhat
 * and Foundry templates. Declared `as const` so wagmi can fully type
 * `functionName`, `args` and return values at the call sites.
 */
export const storageAbi = [
  {
    inputs: [],
    name: 'retrieve',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'num', type: 'uint256' }],
    name: 'store',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Deployed Storage address. Defaults to a public, verified Storage contract on
 * Whitechain Sepolia (chain 1874) so the panel works out of the box; set
 * `VITE_STORAGE_ADDRESS` to point at your own deployment.
 * Explorer: https://explorer.testnet.whitechain.io/address/0xC880eF22c01184a3Db08F2c306684311C48cB495
 */
const DEFAULT_STORAGE_ADDRESS = '0xC880eF22c01184a3Db08F2c306684311C48cB495';
const rawAddress = import.meta.env.VITE_STORAGE_ADDRESS?.trim() || DEFAULT_STORAGE_ADDRESS;

export const storageAddress = rawAddress.startsWith('0x')
  ? (rawAddress as `0x${string}`)
  : undefined;
