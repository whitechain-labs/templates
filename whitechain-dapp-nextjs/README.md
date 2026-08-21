# Whitechain Dapp Next

A dapp starter that runs on Next, React 19, and Tailwind v4. It connects wallets through
Reown AppKit (wagmi v3 and viem) and includes a demo that reads and writes the example `Storage`
contract on Whitechain Sepolia.

There are no workspace packages and no private dependencies. The web3 layer (wagmi and Reown
AppKit) lives under `src/lib`, and the UI is plain Tailwind with basic components you can restyle.
`pnpm install` pulls only public packages, so it needs no registry token.

---

## Network details

|          |                                        |
| -------- | -------------------------------------- |
| Network  | Whitechain Sepolia                     |
| Chain ID | 1874                                   |
| RPC URL  | https://rpc.testnet.whitechain.io      |
| Explorer | https://explorer.testnet.whitechain.io |
| Faucet   | https://faucet.testnet.whitechain.io   |

The chain and RPC are configured in [`src/lib/wagmi.ts`](src/lib/wagmi.ts). Change the URLs there to use your own node.

---

## Quickstart

Pull just this folder, without the rest of the templates repository:

```bash
npx degit whitechain-labs/templates/whitechain-dapp-nextjs whitechain-dapp-nextjs
cd whitechain-dapp-nextjs
```

The git-native equivalent, if you would rather not use `degit`:

```bash
git clone --filter=blob:none --sparse https://github.com/whitechain-labs/templates
cd templates && git sparse-checkout set whitechain-dapp-nextjs && cd whitechain-dapp-nextjs
```

> Requires Node 20.18+ and pnpm (via Corepack). No registry token needed.

1. Enable Corepack and install dependencies.

   ```bash
   corepack enable
   pnpm install
   ```

2. Copy `.env.example` to `.env`. You can leave it empty for now: nothing in it is
   required to start (see [Environment](#environment)).

   ```bash
   cp .env.example .env
   ```

3. Start the dev server (Turbopack, http://localhost:3000).

   ```bash
   pnpm dev
   ```

4. To run a production build and start the standalone server:

   ```bash
   pnpm build && pnpm start
   ```

5. To run all checks before committing:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   pnpm test:e2e   # run `pnpm test:e2e:install` once first
   ```

---

## Environment

Two public build-time values. Both use the `NEXT_PUBLIC_*` prefix, so they are sent to the browser and must never hold secrets.

| Variable                       | Description                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Optional. Reown/WalletConnect project ID. Only WalletConnect needs it; blank falls back to injected wallets. |
| `NEXT_PUBLIC_STORAGE_ADDRESS`  | Optional. Defaults to a public verified `Storage` contract; set this to use your own deployment.  |

`NEXT_PUBLIC_STORAGE_ADDRESS` defaults to a verified `Storage` contract on Whitechain Sepolia:
[`0xC880eF22c01184a3Db08F2c306684311C48cB495`](https://explorer.testnet.whitechain.io/address/0xC880eF22c01184a3Db08F2c306684311C48cB495).
Set it only when pointing at your own deployment. Copy `.env.example` to `.env` (git-ignored) and fill in the values.

### What needs a project id

`NEXT_PUBLIC_REOWN_PROJECT_ID` is the only thing WalletConnect needs, and WalletConnect is the
only thing that needs it. Leave it blank and the starter builds a wagmi config with an
injected-wallet connector instead, so `pnpm dev` renders immediately and MetaMask or any other
browser wallet connects. Contract reads and writes, balances, and network switching all work
unchanged. The console says so on startup.

What you give up while it is blank: WalletConnect itself, which means mobile wallets and QR
pairing, and the Reown AppKit modal. Create a free project id at
[dashboard.reown.com](https://dashboard.reown.com), put it in `.env`, and restart the dev
server to turn those on.

---

## Project layout

All source code lives under `src/`.

| Path                            | Contents                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `src/lib/wagmi.ts`              | Chain, RPC, and the Reown AppKit + wagmi config (`projectId`). |
| `src/lib/wallet.ts`             | The `useWallet` hook (account, network, disconnect, switch).   |
| `src/lib/cn.ts`                 | `cn` class-merge helper (clsx + tailwind-merge).               |
| `src/lib/storage.ts`            | The `Storage` ABI and address.                                 |
| `src/components/ui/`            | Basic UI on stock Tailwind: `Button`, `Card`, `Spinner`.       |
| `src/components/web3/`          | The wallet panel and Storage panel.                            |
| `src/assets/styles/globals.css` | Tailwind entry and base styles.                                |
| `src/app/`                      | Next App Router: layout, page, `/api/healthz`.                 |
| `src/proxy.ts`                  | Middleware: CSP and the baseline security headers.             |
| `src/empty-module.ts`           | Alias target for the Turbopack wallet-SDK shim.                |

The connect button opens Reown AppKit's modal through `useAppKit().open()`. Account and network
state come from `useWallet()` in [`src/lib/wallet.ts`](src/lib/wallet.ts). `wagmi.ts` disables the
Coinbase connector by default; injected wallets and WalletConnect remain enabled. Set
`enableCoinbase` to re-enable it.

[`src/proxy.ts`](src/proxy.ts) is Next 16 middleware that sets a deliberately tight
Content-Security-Policy plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
`Permissions-Policy` on every HTML response. When you add an integration (analytics, an external
image host, another API), widen only the matching CSP directive there.

---

## The Storage demo

The Storage panel ([`src/components/web3/storage-panel.tsx`](src/components/web3/storage-panel.tsx))
calls `retrieve()` and `store(uint256)` on the example `Storage` contract. The companion
Whitechain [Hardhat](../Hardhat) and [Foundry](../Foundry) templates deploy that same contract.
`retrieve()` is a public read and works without a wallet. `store()` requires a connected wallet on
Whitechain Sepolia.

To use your own contract:

1. Deploy it with the Hardhat template (`npm run deploy:testnet`) or with Foundry.
2. Set `NEXT_PUBLIC_STORAGE_ADDRESS` to the printed address.
3. Run `pnpm dev`.

---

## Testing

Vitest covers unit and component tests, both in `tests/` (the middleware and the healthz route) and
co-located next to the code they cover (`src/lib/format.test.ts`, `src/components/providers.test.tsx`).
Playwright covers end-to-end tests: `e2e/home.spec.ts` checks that the dapp scaffold renders. The
full connect flow requires a real wallet and project ID, so it is excluded from headless runs.

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before merging.

---

## Troubleshooting

| Symptom                                                             | Fix                                                                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| The wallet connects but the Storage panel stays disabled.           | Set `NEXT_PUBLIC_STORAGE_ADDRESS` and switch the wallet to Whitechain Sepolia (chain 1874).                                             |
| The web3 build fails, or a wallet SDK is not found under Turbopack. | Keep the `resolveAlias` shim in `next.config.mjs` (`src/empty-module.ts`) in sync with the wallet SDKs your connector set does not use. |
| `pnpm install` reports an engine error.                             | Use Node 20.18+.                                                                                                                        |
