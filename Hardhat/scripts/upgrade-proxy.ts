// Upgrades an existing UUPS proxy from BoxV1 to BoxV2 and proves that the
// upgrade swapped the code while keeping the proxy address and its state:
//   - deploys BoxV2
//   - calls upgradeToAndCall(newImplementation, "0x") from the owner
//   - re-reads the EIP-1967 slot to confirm it moved
//   - confirms value() survived, version() reports v2, and increment() exists
//
// Run:  PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-proxy.ts --network whitechainSepolia
import { network } from "hardhat";
import { getAddress } from "viem";

// keccak256("eip1967.proxy.implementation") - 1
const IMPL_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const proxyAddress = process.env.PROXY_ADDRESS;
if (!proxyAddress) {
  throw new Error("Set PROXY_ADDRESS to the proxy you want to upgrade.");
}

const { viem } = await network.create();
const [wallet] = await viem.getWalletClients();
if (!wallet) {
  throw new Error(
    "No deployer account. Set PRIVATE_KEY in .env (copy .env.example) and fund it from https://faucet.testnet.whitechain.io",
  );
}

// Whitechain produces a block a second. viem polls every 4s by default, so this
// would spend most of its time waiting to look rather than waiting.
const publicClient = await viem.getPublicClient({ pollingInterval: 1_000 });

const readSlot = async () => {
  const raw = await publicClient.getStorageAt({
    address: proxyAddress as `0x${string}`,
    slot: IMPL_SLOT,
  });
  return { raw, decoded: getAddress("0x" + raw!.slice(-40)) };
};

console.log("proxy   :", proxyAddress);
console.log("caller  :", wallet.account.address);

// --- before ---
const before = await readSlot();
const boxBefore = await viem.getContractAt("BoxV1", proxyAddress as `0x${string}`);
const ownerBefore = await boxBefore.read.owner();

console.log("\n--- before upgrade ---");
console.log("implementation :", before.decoded);
console.log("value()        :", (await boxBefore.read.value()).toString());
console.log("version()      :", await boxBefore.read.version());
console.log("owner()        :", ownerBefore);

if (ownerBefore.toLowerCase() !== wallet.account.address.toLowerCase()) {
  throw new Error(
    `Caller is not the owner. _authorizeUpgrade is onlyOwner, so this would revert.`,
  );
}

// 1. Deploy the new implementation. Still no constructor arguments.
const v2 = await viem.deployContract("BoxV2");
console.log("\nBoxV2 implementation:", v2.address);

// 2. Upgrade. UUPS puts upgradeToAndCall on the implementation, so it is called
//    through the proxy. Empty calldata because BoxV2 needs no reinitializer.
const proxyAsV1 = await viem.getContractAt("BoxV1", proxyAddress as `0x${string}`);
const txHash = await proxyAsV1.write.upgradeToAndCall([v2.address, "0x"]);
console.log("upgradeToAndCall tx :", txHash);

const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log("status              :", receipt.status, "| gas used:", receipt.gasUsed.toString());

// viem does not simulate a write, so a revert only shows up here. Stop rather
// than walk the checks below against a proxy still running the old code: they
// would report `slot moved to V2: NO`, print v1 under a line labelled "expect
// v2", and then fail on increment() with a selector error instead of this one.
if (receipt.status !== "success") {
  throw new Error(
    `upgradeToAndCall reverted in ${txHash}. The proxy still runs the old implementation.`,
  );
}

// 3. Confirm the slot moved.
const after = await readSlot();
console.log("\n--- after upgrade ---");
console.log("EIP-1967 slot  :", after.raw);
console.log("decoded        :", after.decoded);
console.log(
  "slot moved to V2:",
  after.decoded.toLowerCase() === v2.address.toLowerCase() ? "yes" : "NO",
);
console.log(
  "slot changed    :",
  before.decoded.toLowerCase() !== after.decoded.toLowerCase() ? "yes" : "NO",
);

// 4. Read through the proxy with the V2 ABI.
const boxV2 = await viem.getContractAt("BoxV2", proxyAddress as `0x${string}`);
const valueAfterUpgrade = await boxV2.read.value();
console.log("\nvalue()   :", valueAfterUpgrade.toString(), "(expect 42, state preserved)");
console.log("version() :", await boxV2.read.version(), "(expect v2)");
console.log("owner()   :", await boxV2.read.owner());

// 5. Exercise the method that only exists in V2.
const incHash = await boxV2.write.increment();
await publicClient.waitForTransactionReceipt({ hash: incHash });
console.log("\nincrement() tx :", incHash);
console.log("value() after increment :", (await boxV2.read.value()).toString(), "(expect 43)");

console.log("\n--- verification input ---");
console.log(
  `  npx hardhat verify --network ${process.env.HARDHAT_NETWORK ?? "whitechainSepolia"} ${v2.address}`,
);
