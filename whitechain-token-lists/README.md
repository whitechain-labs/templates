# Whitechain Token List

A [Uniswap-standard](https://github.com/Uniswap/token-lists) token list for Whitechain, served at **https://tokens.whitechain.io/whitechain.tokenlist.json**.

The list is generated from per-token source files under [`data/`](./data) and validated against the official `@uniswap/token-lists` JSON schema. The structure mirrors [`mantlenetworkio/mantle-token-lists`](https://github.com/mantlenetworkio/mantle-token-lists).

> All token data is **testnet-only** for now (Whitechain Sepolia, chainId `1874`). The pipeline is chain-agnostic and extends cleanly to mainnet – see [Adding a network](#adding-a-network).

## Repository layout

```
.
├── data/
│   ├── WWBT/
│   │   ├── data.json
│   │   └── logo.svg
│   └── USDT.e/
│       ├── data.json
│       └── logo.svg
├── src/                      # chain config, types, build + validation logic
├── scripts/                  # generate + validate CLIs
├── .github/workflows/        # validate on PR; generate + publish on merge to main
├── whitechain.tokenlist.json # generated output – do NOT hand-edit
├── CNAME                      # tokens.whitechain.io
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm (the package manager used by this repo)

```bash
npm install
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run generate` | Reads every `data/<SYMBOL>/data.json`, resolves each network address to its chainId, and (re)writes `whitechain.tokenlist.json`. Sorts tokens by symbol then chainId, bumps `version` per the token-lists semver rules, and sets a fresh `timestamp`. |
| `npm run validate` | Validates `whitechain.tokenlist.json` against the official `@uniswap/token-lists` schema, and asserts every address is a checksummed 40-hex EVM address and every `chainId` exists in the chain config. Exits non-zero on any error. |

`generate` also validates in-memory before writing, so it never emits an invalid list.

## Adding a token

1. Create a folder `data/<SYMBOL>/` (use the token symbol, e.g. `data/WWBT/`).
2. Add `data.json`:

   ```json
   {
     "name": "Wrapped WhiteBIT Coin",
     "symbol": "WWBT",
     "decimals": 18,
     "description": "Short human-readable description.",
     "website": "https://example.com",
     "twitter": "@handle",
     "tokens": {
       "whitechain-testnet": {
         "address": "0x4200000000000000000000000000000000000006"
       }
     }
   }
   ```

   - Address keys under `tokens` are **network names**, not chainIds (see [`src/chains.ts`](./src/chains.ts)). The build resolves them to chainIds.
   - The `address` must be a checksummed (EIP-55) EVM address.
3. Add `logo.svg` (256×256) in the same folder.
4. Run `npm run generate` and commit both your `data/` changes and the regenerated `whitechain.tokenlist.json`.
5. Open a PR. CI runs `npm run validate` and checks that the committed list matches its sources.

The same folder can list one token across several networks by adding more keys under `tokens` – each becomes a separate entry in the list.

## Adding a network

Networks live in [`src/chains.ts`](./src/chains.ts) as a `name -> chainId` map:

```ts
export const CHAINS = {
  "whitechain-testnet": 1874,
  // "whitechain": <mainnet-chainId>,  // TODO: add when mainnet launches
} as const satisfies Record<string, number>;
```

When Whitechain mainnet ships, add its entry here, then reference the network name in the relevant `data/<SYMBOL>/data.json` files.

## Hosting

The list is published via GitHub Pages with the `CNAME` set to `tokens.whitechain.io`. On merge to `main` the [`Publish`](./.github/workflows/publish.yml) workflow regenerates and validates the list, commits it back if it changed, and deploys the repository root to Pages. The repo root is served verbatim, so:

- List: `https://tokens.whitechain.io/whitechain.tokenlist.json`
- Logos: `https://tokens.whitechain.io/data/<SYMBOL>/logo.svg`

Setup checklist for the domain (one-time):

- Enable GitHub Pages for the repo with source **GitHub Actions**.
- Point the `tokens.whitechain.io` DNS record at GitHub Pages.
- Replace the placeholder `whitechain_logo.svg` and per-token `logo.svg` files with final artwork.

## CI

- [`validate.yml`](./.github/workflows/validate.yml) – runs on every PR: `npm ci`, checks the committed list is up to date with `data/`, then `npm run validate`.
- [`publish.yml`](./.github/workflows/publish.yml) – runs on merge to `main`: generate + validate, commit the refreshed list, and deploy to Pages.

Workflow permissions are least-privilege: read-only by default, with `contents: write` scoped to the commit step and `pages: write` / `id-token: write` scoped to the deploy job.
