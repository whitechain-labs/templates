## Whitechain Foundry Template

A minimal [Foundry](https://book.getfoundry.sh/) project template pre-configured for deploying and verifying contracts on the **Whitechain Sepolia testnet**.

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

Documentation: https://book.getfoundry.sh/

## Network details

| | |
| --- | --- |
| Network | Whitechain Sepolia (testnet) |
| Chain ID | 1874 |
| RPC URL | https://rpc.testnet.whitechain.io/ |
| Explorer | https://explorer.testnet.whitechain.io |
| Faucet | https://faucet.testnet.whitechain.io |

Full quick-start reference: https://l2docs.whitechain.io/getting-started/quick-start/deploy_with_foundry

## Contract

[`src/Storage.sol`](src/Storage.sol) is the basic example contract used by the deploy script and tests in this template — the same contract used by the companion Whitechain Hardhat template, for consistency across the two.

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Gas snapshots

```shell
forge snapshot
```

### Local node (Anvil)

```shell
anvil
```

## Deploy to Whitechain Sepolia

### 1. Prerequisites

- Foundry installed (`foundryup`).
- A throwaway private key funded with test WBT from the [faucet](https://faucet.testnet.whitechain.io).

### 2. Configure environment

Copy the example env file and fill in your private key:

```shell
cp .env.example .env
source .env
```

`WHITECHAIN_TESTNET_RPC_URL` is already set to the public testnet RPC in `.env.example`; only `PRIVATE_KEY` needs to be filled in. `.env` is git-ignored — never commit it.

The RPC endpoint is also registered in [`foundry.toml`](foundry.toml) under `[rpc_endpoints]` as `whitechain_testnet`, so it can be referenced by name instead of the full URL.

### 3. Deploy

```shell
forge script script/DeployStorage.s.sol:DeployStorage \
  --rpc-url whitechain_testnet \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Note the deployed contract address printed in the broadcast output (also saved under `broadcast/DeployStorage.s.sol/1874/run-latest.json`).

### 4. Verify

```shell
forge verify-contract <contract_address> src/Storage.sol:Storage \
  --rpc-url whitechain_testnet \
  --verifier blockscout \
  --verifier-url https://explorer.testnet.whitechain.io/api/
```

The verifier URL must end with `/api/` or verification will fail. Once verified, the source code is browsable at `https://explorer.testnet.whitechain.io/address/<contract_address>`.

## Other commands

```shell
cast <subcommand>
forge --help
anvil --help
cast --help
```
