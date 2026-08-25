# Whitechain Foundry Template

A [Foundry](https://book.getfoundry.sh/) project, pre-configured to deploy and
verify contracts on **Whitechain Sepolia**. Clone it, add a funded key, deploy.
`forge-std` is vendored into `lib/`, so `forge build` works on a fresh clone with
no `forge install` step and no submodule to initialize.

## Network details

| | |
| --- | --- |
| Network | Whitechain Sepolia (current L2 testnet) |
| Chain ID | 1874 |
| RPC URL | https://rpc.testnet.whitechain.io |
| Explorer | https://explorer.testnet.whitechain.io |
| Faucet | https://faucet.testnet.whitechain.io |

Chain 1874 is the network this template targets. Chain 2625 is the retired legacy
L1 testnet, and chain 1875 is L1 mainnet. Neither is used here.

Guide: https://docs.whitechain.io/build/deploy/deploy-with-foundry

## Prerequisites

- **Foundry.** Install with `curl -L https://foundry.paradigm.xyz | bash`, then
  run `foundryup`. Check with `forge --version`.
- A Unix shell. macOS and Linux work directly; on Windows, run Foundry in WSL.
- A throwaway private key, funded with test WBT from the
  [faucet](https://faucet.testnet.whitechain.io). Never reuse a mainnet key.

## 1. Get the template

This pulls the `Foundry` folder alone, without the rest of the templates
repository:

```shell
npx degit whitechain-labs/templates/Foundry whitechain-foundry
cd whitechain-foundry
```

## 2. Configure the environment

```shell
cp .env.example .env
```

Open `.env` and set one variable:

| Variable | Fill in | Required for |
| --- | --- | --- |
| `PRIVATE_KEY` | Your throwaway deployer key, 32 bytes hex, with the `0x` prefix | Deploy and verify |
| `WHITECHAIN_SEPOLIA_RPC_URL` | Already set to the public endpoint. Change it only to use your own node | The `whitechain_sepolia` alias |

`.env` is git-ignored. Never commit it. `forge` reads `.env` from the project root
by itself, which is how the `whitechain_sepolia` alias in
[`foundry.toml`](foundry.toml) resolves. Load it into your shell as well, so
`$PRIVATE_KEY` expands on the command line:

```shell
source .env
```

## 3. Build and test

These work before you fill anything in, so you can confirm the toolchain first:

```shell
forge build
forge test
```

Expected output:

```
Compiling 23 files with Solc 0.8.28
Compiler run successful!

Ran 3 tests for test/Storage.t.sol:StorageTest
[PASS] testFuzz_StoreAndRetrieve(uint256) (runs: 256)
[PASS] test_StartsAtZero()
[PASS] test_StoreAndRetrieve()
Suite result: ok. 3 passed; 0 failed; 0 skipped
```

## 4. Deploy

```shell
forge script script/DeployStorage.s.sol:DeployStorage \
  --rpc-url whitechain_sepolia \
  --private-key $PRIVATE_KEY \
  --broadcast
```

`--broadcast` is what sends the transaction. Without it `forge` runs a simulation
and deploys nothing.

Expected output ends with a `Contract Address:` line. That address, and the
transaction receipt, are also written to
`broadcast/DeployStorage.s.sol/1874/run-latest.json`, which is git-ignored.

View the deployment at
`https://explorer.testnet.whitechain.io/address/<contract_address>`.

## 5. Verify

```shell
forge verify-contract <contract_address> src/Storage.sol:Storage \
  --rpc-url whitechain_sepolia \
  --verifier blockscout \
  --verifier-url https://explorer.testnet.whitechain.io/api/
```

The verifier URL must end in `/api/`, or the request fails. To verify at deploy
time instead, add the same three `--verifier` flags to the `forge script` command
above along with `--verify`.

## What is in here

| Path | Purpose |
| --- | --- |
| [`src/Storage.sol`](src/Storage.sol) | The example contract, a single `uint256` with `store` and `retrieve`. The companion Hardhat template uses the same contract |
| [`script/DeployStorage.s.sol`](script/DeployStorage.s.sol) | Deploy script |
| [`test/Storage.t.sol`](test/Storage.t.sol) | Unit tests and a fuzz test |
| [`foundry.toml`](foundry.toml) | Pins solc 0.8.28 and registers the `whitechain_sepolia` RPC alias |
| `lib/forge-std/` | Vendored `forge-std`, so a downloaded folder builds without `forge install` |

## Other commands

```shell
forge fmt        # format
forge snapshot   # gas snapshots
anvil            # local node
cast <subcommand>
```

## Related templates

- [`Hardhat/`](../Hardhat) for the same contract and flow under Hardhat
- [`whitechain-dapp-nextjs/`](../whitechain-dapp-nextjs) and
  [`whitechain-dapp-vite/`](../whitechain-dapp-vite) to read and write this
  contract from a frontend
