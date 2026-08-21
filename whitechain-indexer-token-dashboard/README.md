# Whitechain token dashboard indexer

A token analytics view for Whitechain Sepolia: supply, holders, counters, and a
paginated transfer feed for any ERC-20, ERC-721, or ERC-1155 contract. Everything
comes from the public [Blockscout explorer](https://explorer.testnet.whitechain.io),
so it needs no node, no indexer, and no API key of your own.

The companion documentation page walks through every request with copy-paste
`curl` commands and live responses:
**[Token dashboard indexing example](https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard)**.

## Why two API surfaces

The split is deliberate, and it is the lesson of the example. Blockscout's GraphQL
schema exposes `address`, `addresses`, `block`, `transaction`, and the
`tokenTransfers` connection – but no `token` query. So:

- **GraphQL** (`/api/v1/graphql`) serves the transfer feed. One request returns
  exactly the fields asked for, and the Relay connection gives cursor pagination
  for free. This is where GraphQL beats REST.
- **REST v2** (`/api/v2`) serves what the schema has no query for: token metadata,
  the aggregate counters, and the holders list.

Every value in the UI is labelled with the request that produced it, so you can
trace a number on screen back to an endpoint.

## Run it

```bash
pnpm install
pnpm dev
```

Open the printed URL and paste a token contract address, or click **Try example**
to load the same token the docs page uses. Find contracts on the explorer's
[tokens page](https://explorer.testnet.whitechain.io/tokens).

Requires Node 20.19 or later. Copy `.env.example` to `.env` to set
`VITE_DEFAULT_TOKEN` (a token to load on first paint) or `VITE_EXPLORER_BASE_URL`
(a different Blockscout chain).

## Endpoint map

| UI element                            | Surface | Request                                      |
| ------------------------------------- | ------- | -------------------------------------------- |
| Name, symbol, decimals, supply, price | REST v2 | `GET /tokens/{hash}`                         |
| Holder and transfer counts            | REST v2 | `GET /tokens/{hash}/counters`                |
| Top holders                           | REST v2 | `GET /tokens/{hash}/holders`                 |
| Transfer feed (paginated)             | GraphQL | `POST /api/v1/graphql` with `tokenTransfers` |
| Address lookup                        | GraphQL | `POST /api/v1/graphql` with `address`        |

The GraphQL queries and client live in [`src/lib/graphql.ts`](src/lib/graphql.ts);
the REST calls in [`src/lib/blockscout.ts`](src/lib/blockscout.ts).

## The transfers query

```graphql
query Transfers($token: AddressHash!, $first: Int!, $after: String) {
  tokenTransfers(tokenContractAddressHash: $token, first: $first, after: $after) {
    edges {
      node {
        amount
        fromAddressHash
        toAddressHash
        transactionHash
        tokenIds
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## What the code demonstrates

- **One parallel batch.** The three REST reads and the first GraphQL page are
  independent, so `TokenPage` issues them together. Further transfer pages are
  fetched on demand.
- **The complexity cap.** The GraphQL server caps operation complexity at 100 and
  `tokenTransfers` costs about 11 per item, so pages are 8 items
  (`TRANSFERS_PAGE_SIZE`). Raising it is the fastest way to turn a working feed
  into a complexity error.
- **Opaque cursors.** Pagination sends the previous response's `pageInfo.endCursor`
  straight back as `after` and stops when `hasNextPage` is false. The cursor is
  never built or parsed locally.
- **Per-token decimals.** `decimals` is read once from `/tokens/{hash}` and threaded
  through every amount, in both the feed and the holders list. Raw values from both
  APIs are in base units, and the divisor differs per token (6 for USDW).
- **Two error shapes.** GraphQL always returns HTTP 200 and signals failure with an
  `errors` array, so `res.ok` proves nothing – `gql()` checks `errors` first. REST
  v2 returns HTTP 422 with an `errors` array naming the bad field.
- **Real edge cases.** A `from` of the zero address is a mint, not a transfer, and
  is badged as one. `tokenIds` is `null` for ERC-20 and set for the NFT standards.
  `exchange_rate` is `null` for most testnet tokens, so no price is invented.
- **Graceful degradation.** A token the indexer has not counted yet still renders:
  the counters call is allowed to fail without blanking the dashboard.

## Project layout

```
src/
  assets/styles/globals.css   Tailwind entry and the Whitechain brand palette
  components/
    ui/                       Button, Card, Stat, Section, ApiBadge, …
    token/                    The five panels of the dashboard
    token-page.tsx            Page composition and data loading
  lib/
    graphql.ts                GraphQL client, queries, page size
    blockscout.ts             REST v2 client and error parsing
    config.ts                 Base URL and explorer links
    format.ts                 Pure display helpers (unit-tested)
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
- Explore the full GraphQL schema interactively at
  <https://explorer.testnet.whitechain.io/api-docs?tab=graphql_api>.

## Related

- [Token dashboard indexing example](https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard) – this template, request by request
- [Wallet indexer](../whitechain-indexer-wallet) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-wallet)
- [Gas and network tracker](../whitechain-indexer-gas-tracker) and its [docs page](https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker)
- [Block explorer overview](https://docs.whitechain.io/build/block-explorer/overview)
- [Blockscout API reference](https://explorer.testnet.whitechain.io/api-docs)
