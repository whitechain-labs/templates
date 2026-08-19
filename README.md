# Whitechain templates

Starter templates for building on [Whitechain](https://whitechain.io). Every
template is self-contained, installs from public npm, and carries its own setup
instructions in its `README.md`. All of them target Whitechain Sepolia (testnet,
chain id 1874).

Each template has a companion page in the
[Whitechain documentation](https://docs.whitechain.io) that walks through the same
material request by request.

## Dapps

Wallet-connected frontends that read and write the example `Storage` contract.

| Template | What it is | Docs |
| --- | --- | --- |
| [`whitechain-dapp-nextjs/`](whitechain-dapp-nextjs) | Next + [Reown AppKit](https://reown.com/) starter. Use it when you need SSR or a server side to hide secrets. | [Build a dapp with Next.js](https://docs.whitechain.io/build/dapps/dapp-with-nextjs) |
| [`whitechain-dapp-vite/`](whitechain-dapp-vite) | The same dapp as a client-only Vite SPA with TanStack Router. Use it for a static app with no server secrets. | [Build a dapp with Vite](https://docs.whitechain.io/build/dapps/dapp-with-vite) |

## Indexing examples

Read-only views built entirely on the public
[Blockscout explorer](https://explorer.testnet.whitechain.io). No node, no indexer,
and no API key of your own. Each one leads with a different API surface, so between
them they cover all four the explorer exposes.

| Template | Leads with | Docs |
| --- | --- | --- |
| [`whitechain-indexer-wallet/`](whitechain-indexer-wallet) | REST v2 and ETH JSON-RPC: balances, token holdings, and transaction history for any address | [Wallet indexing example](https://docs.whitechain.io/build/block-explorer/indexer-wallet) |
| [`whitechain-indexer-token-dashboard/`](whitechain-indexer-token-dashboard) | GraphQL for a paginated transfer feed, REST v2 for metadata, counters, and holders | [Token dashboard indexing example](https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard) |
| [`whitechain-indexer-gas-tracker/`](whitechain-indexer-gas-tracker) | The Etherscan-compatible RPC API, with REST v2 `/stats` for the gas tiers | [Gas and network tracker example](https://docs.whitechain.io/build/block-explorer/indexer-gas-tracker) |

All three share one UI kit, Tailwind setup, and tooling with the dapp starters, and
every value they render is labelled with the request that produced it.

## Token list

- [`whitechain-token-lists/`](whitechain-token-lists) — a
  [Uniswap-standard](https://github.com/Uniswap/token-lists) token list for
  Whitechain (testnet only for now), served at `tokens.whitechain.io`. Generated
  from per-token source files under `data/` and validated in CI.

## Getting started

```bash
git clone https://github.com/whitechain-labs/templates.git
cd templates/<template-folder>
pnpm install
pnpm dev
```

You will need Node 20.19 or later. The dapp templates additionally need a wallet
with Whitechain Sepolia added and some test WBT for gas — see
[Connect to Whitechain Sepolia](https://docs.whitechain.io/learn/get-started/connect-wallet)
and the [faucet](https://docs.whitechain.io/learn/get-started/get-testnet-wbt).
The indexing examples need neither: they are read-only and connect no wallet.

## Related

- [Whitechain documentation](https://docs.whitechain.io)
- [Introduction to Whitechain](https://docs.whitechain.io/learn/introduction)
- [Block explorer overview](https://docs.whitechain.io/build/block-explorer/overview)
- [Whitechain Sepolia explorer](https://explorer.testnet.whitechain.io)
