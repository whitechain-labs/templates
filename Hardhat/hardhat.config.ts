import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

// Defaults to the public endpoint, so compile and test work with no .env.
const rpcUrl = process.env.TESTNET_RPC_URL?.trim() || "https://rpc.testnet.whitechain.io";

// Accept the key with or without 0x. Empty means no accounts rather than an
// invalid one, which keeps compile and test working before you fund a deployer.
const rawKey = process.env.PRIVATE_KEY?.trim() ?? "";
const accounts = rawKey === "" ? [] : [rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`];

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: "0.8.28",
  networks: {
    // Chain 2625 is the retired legacy L1 testnet. This is not it.
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
