import { network } from "hardhat";

// Uses whatever `--network` selects, which `deploy:testnet` sets to whitechainSepolia.
const { viem } = await network.create();

const [wallet] = await viem.getWalletClients();
if (!wallet) {
  throw new Error(
    "No deployer account. Set PRIVATE_KEY in .env (copy .env.example) and fund it from https://faucet.testnet.whitechain.io",
  );
}

// Whitechain produces a block a second. viem polls every 4s by default, so the
// deploy would spend most of its time waiting to look rather than waiting.
const publicClient = await viem.getPublicClient({ pollingInterval: 1_000 });

const storage = await viem.deployContract("Storage", [], {
  client: { public: publicClient, wallet },
});

console.log("Storage deployed to:", storage.address);
console.log("Explorer:", `https://explorer.testnet.whitechain.io/address/${storage.address}`);
