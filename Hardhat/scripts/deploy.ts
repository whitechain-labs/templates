import { network } from "hardhat";

// `network.create()` with no argument uses whatever `--network` selects, which
// the `deploy:testnet` script sets to `whitechainSepolia`.
const { viem } = await network.create();

const [deployer] = await viem.getWalletClients();
if (!deployer) {
  throw new Error(
    "No deployer account. Set PRIVATE_KEY in .env (copy .env.example) and fund it from https://faucet.testnet.whitechain.io",
  );
}

const storage = await viem.deployContract("Storage");

console.log("Storage deployed to:", storage.address);
console.log("Explorer:", `https://explorer.testnet.whitechain.io/address/${storage.address}`);
