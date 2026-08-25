# Whitechain wallet indexer

A wallet view for Whitechain Sepolia: balances, token holdings, and transaction
history for any address. It reads everything from the public
[Blockscout explorer](https://explorer.testnet.whitechain.io), so it needs no node,
no indexer, and no API key of your own.

The companion documentation page walks through every request with copy-paste
`curl` commands and live responses:
**[Wallet indexing example](https://docs.whitechain.io/build/block-explorer/indexer-wallet)**.

## Why two API surfaces

The point of the example is the comparison. Blockscout exposes both, and they
answer different questions:

- **REST API v2** (`/api/v2`) returns the _indexed_ view: pre-decoded objects with
  token metadata, method names, fees, and timestamps already resolved.
- **ETH JSON-RPC** (`/api/eth-rpc`) returns the _live node_ view: canonical,
  real-time chain state in raw hex.

The two balance cards show the same address from both. They agree once the indexer
catches up to the chain head. Every value in the UI is labelled with the request
that produced it, so you can trace a number on screen back to an endpoint.

## Run it

```bash
pnpm install
pnpm dev
```

Open the printed URL, paste any `0x…` address, or click **Try example** to load
the same address the docs page uses.

Requires Node 20.19 or later. To index a different Blockscout chain, copy
`.env.example` to `.env` and set `VITE_EXPLORER_BASE_URL`.

## Endpoint map

| UI element                            | Surface | Request                                              |
| ------------------------------------- | ------- | ---------------------------------------------------- |
| Balance (indexed), USD estimate, type | REST v2 | `GET /addresses/{hash}`                              |
| Token holdings                        | REST v2 | `GET /addresses/{hash}/token-balances`               |
| Transaction history                   | REST v2 | `GET /addresses/{hash}/transactions`                 |
| Inbound / outbound filter             | REST v2 | `GET /addresses/{hash}/transactions?filter=to\|from` |
| Balance (live)                        | ETH RPC | `eth_getBalance`                                     |
| Nonce                                 | ETH RPC | `eth_getTransactionCount`                            |
| Chain-head chip                       | ETH RPC | `eth_blockNumber`                                    |

The REST calls live in [`src/lib/blockscout.ts`](src/lib/blockscout.ts) and the
JSON-RPC calls in [`src/lib/ethRpc.ts`](src/lib/ethRpc.ts).

## What the code demonstrates

- **One parallel batch.** None of the five lookups depends on another, so
  `WalletPage` issues them together and fills the whole page at once. Only the
  chain head polls afterward, on its own one-second timer.
- **Per-token decimals.** `decimals` differs per token (6 for USDW, 18 for WBT),
  so every amount is formatted against its own token's value. Assuming 18 is the
  most common bug in this kind of view.
- **All three standards.** `token-balances` returns ERC-20, ERC-721, and ERC-1155
  entries in one flat array. `token_id` is set for the NFT standards.
- **Opaque cursors.** Pagination copies whatever keys the previous response put in
  `next_page_params` rather than hardcoding them, because they differ per endpoint.
  See `toQuery` in [`src/lib/blockscout.ts`](src/lib/blockscout.ts).
- **Both error shapes.** A malformed address returns HTTP 422 with an `errors`
  array; JSON-RPC returns HTTP 200 with an `error` object instead of `result`.
  Both are turned into one readable message.
- **Empty is not an error.** A well-formed address the indexer has never seen
  returns HTTP 200 with `null` fields. The UI says so rather than showing a blank
  page or an error.

## Project layout

```
src/
  assets/styles/globals.css   Tailwind entry and the Whitechain brand palette
  components/
    ui/                       Button, Card, Stat, Section, ApiBadge, …
    wallet/                   The four panels of the wallet view
    wallet-page.tsx           Page composition and data loading
  lib/
    blockscout.ts             REST v2 client, error parsing, pagination
    ethRpc.ts                 JSON-RPC client
    config.ts                 Base URL and explorer links
    format.ts                 Pure display helpers (unit-tested)
    use-chain-head.ts         eth_blockNumber polling hook
```

The UI kit, Tailwind setup, and tooling match the
[`whitechain-dapp-vite`](../whitechain-dapp-vite) and
[`whitechain-dapp-nextjs`](../whitechain-dapp-nextjs) starters, so the three read
as one family.

## Scripts

| Script                | Does                                |
| --------------------- | ----------------------------------- |
| `pnpm dev`            | Vite dev server                     |
| `pnpm build`          | Static production bundle in `dist/` |
| `pnpm preview`        | Serve the built bundle              |
| `pnpm typecheck`      | `tsc --noEmit`                      |
| `pnpm test`           | Vitest unit tests                   |
| `pnpm lint`           | ESLint                              |
| `pnpm prettier:check` | Prettier                            |

## Notes

- The explorer API is public, read-only, and needs no key. There are no secrets, so
  this is a pure client-side SPA and `pnpm build` output can be hosted anywhere
  static.
- The native coin is labelled **WBT**. Change the label in
  `src/components/wallet/address-summary.tsx` if you point the app at another chain.

## Related

- [Wallet indexing example](https://docs.whitechain.io/build/block-explorer/indexer-wallet) – this template, request by request
- [Token dashboard indexer](../whitechain-indexer-token-dashboard) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard)
- [Gas and network tracker](../whitechain-indexer-gas-tracker) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker)
- [Block explorer overview](https://docs.whitechain.io/build/block-explorer/overview)
- [Blockscout API reference](https://explorer.testnet.whitechain.io/api-docs)
