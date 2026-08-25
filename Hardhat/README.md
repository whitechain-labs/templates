# Whitechain Hardhat Template

A [Hardhat](https://hardhat.org/) 3 project, pre-configured to deploy and verify
contracts on **Whitechain Sepolia** using [viem](https://viem.sh/). Clone it, add
a funded key, deploy. No scaffolding, no hand-written network config.

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

Guide: https://docs.whitechain.io/build/deploy/deploy-with-hardhat

## Prerequisites

- **Node.js 22 or later.** Hardhat 3 requires it. Check with `node -v`.
- npm, bundled with Node.js.
- A throwaway private key, funded with test WBT from the
  [faucet](https://faucet.testnet.whitechain.io). Never reuse a mainnet key.

## 1. Get the template

This pulls the `Hardhat` folder alone, without the rest of the templates
repository:

```shell
npx degit whitechain-labs/templates/Hardhat whitechain-hardhat
cd whitechain-hardhat
```

## 2. Install dependencies

```shell
npm install
```

## 3. Configure the environment

```shell
cp .env.example .env
```

Open `.env` and set one variable:

| Variable | Fill in | Required for |
| --- | --- | --- |
| `PRIVATE_KEY` | Your throwaway deployer key, 32 bytes hex, with or without `0x` | Deploy and verify |
| `TESTNET_RPC_URL` | Already set to the public endpoint. Change it only to use your own node | Nothing, it has a default |

`.env` is git-ignored. Never commit it.

`compile` and `test` work before you fill anything in, so you can confirm the
toolchain first and get a key later.

## 4. Compile and test

```shell
npm run compile
npm test
```

Expected output:

```
Compiled 1 Solidity file with solc 0.8.28 (evm target: cancun)

  Storage
    ✔ starts at zero
    ✔ stores and retrieves a value

2 passing
```

## 5. Deploy

```shell
npm run deploy:testnet
```

Expected output, where `0xYourDeployedAddress` is the address you just created:

```
Storage deployed to: 0xYourDeployedAddress
Explorer: https://explorer.testnet.whitechain.io/address/0xYourDeployedAddress
```

Open the explorer link to see the deployment. If the key is missing or unfunded,
the script says so instead of failing with a stack trace.

## 6. Verify

```shell
npx hardhat verify --network whitechainSepolia <contract_address>
```

Append constructor arguments after the address for contracts that take them.
`Storage` takes none. This submits to every verifier configured for the network,
which here is the Whitechain Blockscout explorer and Sourcify.

One wrinkle specific to this template: `Storage` is already verified at another
address on Whitechain Sepolia, so the explorer recognises the bytecode and shows
the source for your address as a "verified twin" before you verify anything.
Hardhat sees the source is already there and skips Blockscout, verifying only on
Sourcify. Your address is still not verified in its own right. To record it:

```shell
npx hardhat verify blockscout --force --network whitechainSepolia <contract_address>
```

Your own contracts have unique bytecode, so they have no twin and the plain
`verify` command covers both verifiers.

## What is in here

| Path | Purpose |
| --- | --- |
| [`contracts/Storage.sol`](contracts/Storage.sol) | The example contract, a single `uint256` with `store` and `retrieve`. The companion Foundry template uses the same contract |
| [`scripts/deploy.ts`](scripts/deploy.ts) | Deploy script, prints the address and the explorer link |
| [`test/Storage.ts`](test/Storage.ts) | Tests over Hardhat's Node test runner and viem |
| [`hardhat.config.ts`](hardhat.config.ts) | Registers the `whitechainSepolia` network (chain 1874) and points verification at the Whitechain Blockscout explorer |

## Related templates

- [`Foundry/`](../Foundry) for the same contract and flow under Foundry
- [`whitechain-dapp-nextjs/`](../whitechain-dapp-nextjs) and
  [`whitechain-dapp-vite/`](../whitechain-dapp-vite) to read and write this
  contract from a frontend
