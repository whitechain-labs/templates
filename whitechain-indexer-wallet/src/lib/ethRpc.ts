// Minimal Ethereum JSON-RPC client hitting Blockscout's eth-rpc endpoint.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-wallet
import { ETH_RPC } from './config';

let id = 0;

/**
 * JSON-RPC answers an invalid request with HTTP 200 and an `error` object
 * instead of `result`, so checking `res.ok` is not enough: check for `error`
 * before reading `result`.
 */
async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(ETH_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  if (!res.ok) throw new Error(`eth-rpc ${method} → ${res.status} ${res.statusText}`);
  const body = (await res.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(`eth-rpc ${method}: ${body.error.message}`);
  return body.result as T;
}

/** Latest block height, as a raw hex quantity. Poll this for a live head. */
export const ethBlockNumber = () => rpc<string>('eth_blockNumber');

/** Native balance in wei for `address` at the latest block (hex quantity). */
export const ethGetBalance = (address: string) =>
  rpc<string>('eth_getBalance', [address, 'latest']);

/** Outbound transaction count (nonce) for `address` (hex quantity). */
export const ethGetTransactionCount = (address: string) =>
  rpc<string>('eth_getTransactionCount', [address, 'latest']);
