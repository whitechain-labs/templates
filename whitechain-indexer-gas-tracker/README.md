# Whitechain gas and network tracker

A self-refreshing network dashboard for Whitechain Sepolia: gas price tiers, coin
price, circulating supply, daily fees, and the chain counters. Everything comes
from the public [Blockscout explorer](https://explorer.testnet.whitechain.io), so it
needs no node, no indexer, and no API key of your own.

The companion documentation page walks through every request with copy-paste
`curl` commands and live responses:
**[Gas and network tracker example](https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker)**.

## Why two API surfaces

- **RPC API** (`/api?module=…&action=…`) is Blockscout's Etherscan-compatible
  surface. A client written against the Etherscan API works here unchanged, which
  is why the headline metrics are read through it. The module set is `account`,
  `block`, `contract`, `logs`, `stats`, `token`, and `transaction`.
- **REST v2** (`/api/v2/stats`) supplies the gas tiers and the aggregate counters.
  It has to: the Etherscan-compatible module set has no gas-oracle action, so
  `/stats` (`gas_prices`) is the canonical source for slow, average, and fast.

Every value in the UI is labelled with the request that produced it, so you can
trace a number on screen back to an endpoint.

## Run it

```bash
pnpm install
pnpm dev
```

The dashboard loads immediately and keeps itself current. Requires Node 20.19 or
later. To index a different Blockscout chain, copy `.env.example` to `.env` and set
`VITE_EXPLORER_BASE_URL`.

## Endpoint map

| UI element                                                               | Surface | Request                                          |
| ------------------------------------------------------------------------ | ------- | ------------------------------------------------ |
| Slow / average / fast tiers                                              | REST v2 | `GET /api/v2/stats` → `gas_prices`               |
| Blocks, transactions, addresses, block time, utilization, gas used today | REST v2 | `GET /api/v2/stats`                              |
| WBT price (USD, BTC)                                                     | RPC     | `?module=stats&action=coinprice`                 |
| Circulating supply                                                       | RPC     | `?module=stats&action=coinsupply`                |
| Daily transaction fees                                                   | RPC     | `?module=stats&action=totalfees&date=YYYY-MM-DD` |
| Chain head                                                               | RPC     | `?module=block&action=eth_block_number`          |

The RPC calls live in [`src/lib/rpcApi.ts`](src/lib/rpcApi.ts); the REST stats in
[`src/lib/blockscout.ts`](src/lib/blockscout.ts).

## What the code demonstrates

- **Two refresh timers, matched to the data.** The chain head ticks once per
  second, because the chain produces about one block per second. Everything else
  refetches every 15 seconds, which is roughly what `/stats` reports in
  `gas_prices_update_in`. Polling every endpoint at head speed would be wasteful
  and would not make any number fresher.
- **Two envelope shapes, one client.** Most RPC actions answer with
  `{ status, message, result }`, but `block.eth_block_number` answers with a
  JSON-RPC envelope. `call()` in `rpcApi.ts` normalizes both down to `result`.
- **`status: "0"` is not always an error.** An empty result set is reported the
  same way as a failure, so the client distinguishes the two by message rather
  than treating every `"0"` as fatal.
- **The supply figure comes from REST v2, not the RPC API.** The Etherscan-style
  `stats.coinsupply` action sums every balance on the chain, and on Whitechain
  Sepolia two genesis addresses hold sentinel balances of `2^256 - 1` and
  `2^248 - 1` wei. They dominate the sum, so the action reads about 1.16e59 WBT
  against a real WBT max supply of 400 million. The card therefore reads
  `total_supply` from `GET /api/v2/addresses`, which reports 293.65M and matches
  the published WBT total supply. `getCoinSupply` stays in
  [`src/lib/rpcApi.ts`](src/lib/rpcApi.ts) with the full explanation, including
  the fact that its value is in whole coins and must not be divided by 10^18.
- **Utilization is a ratio.** `network_utilization_percentage` is 0 to 1 despite
  the name, so it is multiplied by 100 before display.
- **`totalfees` closes daily.** It is aggregated per completed day, so the current
  day reads `0` until it closes. The app queries the previous completed UTC day
  (`previousUtcDay`) and labels the card with the date it actually asked for.
- **Independent failures.** Each metric is fetched with its own error handling, so
  one endpoint having a bad minute does not blank the dashboard.
- **Equal tiers are correct.** On a quiet chain slow, average, and fast all read
  the same. There is no congestion to price, and the UI says so rather than
  looking broken.

## Project layout

```
src/
  assets/styles/globals.css   Tailwind entry and the Whitechain brand palette
  components/
    ui/                       Card, Stat, ApiBadge, Alert, …
    gas/                      Gas tiers, chain metrics, network counters
    gas-page.tsx              Page composition and the two refresh timers
  lib/
    rpcApi.ts                 Etherscan-style RPC client
    blockscout.ts             REST v2 /stats client
    config.ts                 Base URL and explorer links
    format.ts                 Pure display helpers (unit-tested)
    use-chain-head.ts         Chain-head polling hook
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
- Reference: <https://explorer.testnet.whitechain.io/api-docs?tab=rpc_api> and
  `?tab=rest_api`.

## Related

- [Gas and network tracker example](https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker) – this template, request by request
- [Wallet indexer](../whitechain-indexer-wallet) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-wallet)
- [Token dashboard indexer](../whitechain-indexer-token-dashboard) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard)
- [Network fees](https://docs.whitechain.io/learn/network/network-fees)
- [Blockscout API reference](https://explorer.testnet.whitechain.io/api-docs)
