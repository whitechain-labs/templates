# Whitechain Dapp Vite

A Whitechain dapp starter as a client-only Vite SPA on React 19, TanStack Router, and Tailwind v4.
It wires wallet connect through Reown AppKit (wagmi v3 and viem) and ships a demo that reads and
writes the example Storage contract on Whitechain Sepolia.

There are no workspace packages and no private dependencies. The web3 layer (wagmi and Reown
AppKit) lives under `src/lib`, and the UI is plain Tailwind with basic components you can restyle.
Every dependency is a public npm package.

> This is a static SPA with no server, so it cannot hold secrets. Everything in the bundle ships
> to the browser. A Reown `projectId` is public by design, which is fine; never put a privileged
> key in a `VITE_*` variable.

---

## Network details

|          |                                        |
| -------- | -------------------------------------- |
| Network  | Whitechain Sepolia (testnet)           |
| Chain ID | 1874                                   |
| RPC URL  | https://rpc.testnet.whitechain.io      |
| Explorer | https://explorer.testnet.whitechain.io |
| Faucet   | https://faucet.testnet.whitechain.io   |

The chain and RPC are configured in [`src/lib/wagmi.ts`](src/lib/wagmi.ts). Change the URLs there to use your own node.

---

## Quickstart

Pull just this folder, without the rest of the templates repository:

```bash
npx degit whitechain-labs/templates/whitechain-dapp-vite whitechain-dapp-vite
cd whitechain-dapp-vite
```

> Requires Node 20.19+ and pnpm (via Corepack).

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

3. Start the dev server (http://localhost:5173).

   ```bash
   pnpm dev
   ```

4. To build and preview the static production bundle:

   ```bash
   pnpm build && pnpm preview
   ```

5. To run all checks before committing:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   pnpm test:e2e   # run `pnpm test:e2e:install` once first
   ```

---

## Environment

Two public build-time values. Vite exposes `VITE_*` variables to the browser bundle, so they must never hold secrets.

| Variable                | Description                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `VITE_REOWN_PROJECT_ID` | Optional. Reown/WalletConnect project ID. Only WalletConnect needs it; blank falls back to injected wallets. |
| `VITE_STORAGE_ADDRESS`  | Optional. Defaults to a public verified `Storage` contract; set this to use your own deployment.  |

`VITE_STORAGE_ADDRESS` defaults to a verified `Storage` contract on Whitechain Sepolia:
[`0xC880eF22c01184a3Db08F2c306684311C48cB495`](https://explorer.testnet.whitechain.io/address/0xC880eF22c01184a3Db08F2c306684311C48cB495).
Set it only when pointing at your own deployment. Copy `.env.example` to `.env` (git-ignored) and fill in the values.

### What needs a project id

`VITE_REOWN_PROJECT_ID` is the only thing WalletConnect needs, and WalletConnect is the
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

| Path                            | Contents                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                  | App entry: wagmi + TanStack Query providers and the router.                                             |
| `src/routes/`                   | File-based routes (`__root.tsx`, `index.tsx`); the route tree is generated into `src/routeTree.gen.ts`. |
| `src/lib/wagmi.ts`              | Chain, RPC, and the Reown AppKit + wagmi config (`projectId`).                                          |
| `src/lib/wallet.ts`             | The `useWallet` hook (account, network, disconnect, switch).                                            |
| `src/lib/cn.ts`                 | `cn` class-merge helper (clsx + tailwind-merge).                                                        |
| `src/lib/storage.ts`            | The `Storage` ABI and address.                                                                          |
| `src/components/ui/`            | Basic UI on stock Tailwind: `Button`, `Card`, `Spinner`.                                                |
| `src/components/web3/`          | The wallet and Storage panels.                                                                          |
| `src/components/home-page.tsx`  | The page that composes the panels.                                                                      |
| `src/assets/styles/globals.css` | Tailwind entry and base styles.                                                                         |

The connect button opens Reown AppKit's modal through `useAppKit().open()`. Account and network
state come from `useWallet()` in [`src/lib/wallet.ts`](src/lib/wallet.ts). `wagmi.ts` disables the
Coinbase connector by default; injected wallets and WalletConnect remain enabled. Set `enableCoinbase` to re-enable it.

---

## The Storage demo

The Storage panel ([`src/components/web3/storage-panel.tsx`](src/components/web3/storage-panel.tsx))
calls `retrieve()` and `store(uint256)` on the example `Storage` contract. The companion
Whitechain [Hardhat](../Hardhat) and [Foundry](../Foundry) templates deploy that same contract.
`retrieve()` is a public read and works without a wallet. `store()` requires a connected wallet on
Whitechain Sepolia.

To use your own contract:

1. Deploy it with the Hardhat template (`npm run deploy:testnet`) or with Foundry.
2. Set `VITE_STORAGE_ADDRESS` to the printed address.
3. Run `pnpm dev`.

---

## Testing

Vitest covers unit and component tests, co-located next to the code they cover (`src/lib/format.test.ts`);
`tests/setup.ts` holds the shared jsdom setup. Playwright covers end-to-end tests: `e2e/home.spec.ts`
checks that the dapp scaffold renders. The full connect flow requires a real wallet and project ID,
so it is excluded from headless runs.

Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before merging.

---

## Troubleshooting

| Symptom                                                     | Fix                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `typecheck` reports `Cannot find module './routeTree.gen'`. | Run `pnpm dev` or `pnpm build` once. The TanStack Router plugin generates `src/routeTree.gen.ts`. |
| The wallet connects but the Storage panel stays disabled.   | Set `VITE_STORAGE_ADDRESS` and switch the wallet to Whitechain Sepolia (chain 1874).              |
| `pnpm install` reports an engine error.                     | Use Node 20.19+.                                                                                  |
