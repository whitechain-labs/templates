# Whitechain templates

Runnable starter projects for [Whitechain](https://whitechain.io), the
EVM-compatible OP Stack Layer 2. Every template targets **Whitechain Sepolia**,
chain ID **1874**, the current L2 testnet.

Documentation: https://docs.whitechain.io

## Get one folder, not the whole repository

Each template is self-contained, so pull only the one you want:

```shell
npx degit whitechain-labs/templates/<folder> <folder>
```

For example:

```shell
npx degit whitechain-labs/templates/Hardhat whitechain-hardhat
```

`degit` downloads a tarball and keeps no git history, so the result is a clean
starting point for your own repository.

If you would rather use git, a sparse checkout fetches the same one folder:

```shell
git clone --filter=blob:none --sparse https://github.com/whitechain-labs/templates
cd templates && git sparse-checkout set <folder>
```

## Templates

| Folder | What it is | Guide |
| --- | --- | --- |
| [`Hardhat/`](Hardhat) | Hardhat 3 project with a `Storage` contract, tests, and a deploy-and-verify flow | [Deploy with Hardhat](https://docs.whitechain.io/build/deploy/deploy-with-hardhat) |
| [`Foundry/`](Foundry) | The same contract and flow under Foundry, with `forge-std` vendored so it builds on a fresh clone | [Deploy with Foundry](https://docs.whitechain.io/build/deploy/deploy-with-foundry) |
| [`whitechain-dapp-nextjs/`](whitechain-dapp-nextjs) | Next.js dapp starter: wallet connect, balance, and contract read and write | [Build a dapp with Next.js](https://docs.whitechain.io/build/dapps/dapp-with-nextjs) |
| [`whitechain-dapp-vite/`](whitechain-dapp-vite) | The same dapp as a Vite single-page app | [Build a dapp with Vite](https://docs.whitechain.io/build/dapps/dapp-with-vite) |
| [`whitechain-token-lists/`](whitechain-token-lists) | Token list for Whitechain networks | |

The two contract templates ship the same `Storage` contract, so a contract you
deploy from either one works with both dapp starters.

## Network reference

| | Whitechain Sepolia |
| --- | --- |
| Chain ID | 1874 |
| RPC URL | https://rpc.testnet.whitechain.io |
| Explorer | https://explorer.testnet.whitechain.io |
| Faucet | https://faucet.testnet.whitechain.io |
| Native token | WBT |

Chain 2625 is the retired legacy L1 testnet and chain 1875 is L1 mainnet. No
template here targets either one.

Full network reference: https://docs.whitechain.io/learn/network/reference
