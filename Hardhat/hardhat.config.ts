import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

// Default to the public endpoint so `compile` and `test` work on a fresh clone
// with no `.env` at all. Point TESTNET_RPC_URL at your own node to override.
const rpcUrl = process.env.TESTNET_RPC_URL?.trim() || "https://rpc.testnet.whitechain.io";

// Hardhat requires a 0x-prefixed key, so accept either form in `.env`. An empty
// key yields an empty account list rather than an invalid one: that keeps
// `compile` and `test` working before you have funded a deployer.
const rawKey = process.env.PRIVATE_KEY?.trim() ?? "";
const accounts = rawKey === "" ? [] : [rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`];

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: "0.8.28",
  networks: {
    // Whitechain Sepolia, the current L2 testnet. Chain 2625 is the retired
    // legacy L1 testnet and is not what you want here.
    whitechainSepolia: {
      type: "http",
      chainType: "op",
      url: rpcUrl,
      accounts,
      chainId: 1874,
    },
  },
  chainDescriptors: {
    1874: {
      name: "Whitechain Sepolia",
      chainType: "op",
      blockExplorers: {
        blockscout: {
          name: "Blockscout",
          url: "https://explorer.testnet.whitechain.io",
          apiUrl: "https://explorer.testnet.whitechain.io/api",
        },
      },
    },
  },
};

export default config;
