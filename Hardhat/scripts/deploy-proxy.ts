// Deploys BoxV1 behind an ERC1967 (UUPS) proxy on the selected network, then
// prints everything the proxy verification guide needs:
//   - the implementation address
//   - the proxy address
//   - the ABI-encoded initializer calldata (the proxy's 2nd constructor arg)
//   - the EIP-1967 implementation slot read back from the proxy
//
// Run:  npx hardhat run scripts/deploy-proxy.ts --network whitechainSepolia
import { network } from "hardhat";
import { encodeFunctionData, getAddress } from "viem";

// keccak256("eip1967.proxy.implementation") - 1
const IMPL_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

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

const owner = wallet.account.address;
const INITIAL_VALUE = 42n;

console.log("deployer:", owner);

// 1. Implementation. No constructor arguments, so verification needs none.
const impl = await viem.deployContract("BoxV1");
console.log("\nimplementation:", impl.address);

// 2. Initializer calldata, passed to the proxy constructor.
const initData = encodeFunctionData({
  abi: impl.abi,
  functionName: "initialize",
  args: [INITIAL_VALUE, owner],
});

// 3. Proxy. Constructor args are (implementation, initializer calldata).
const proxy = await viem.deployContract("ERC1967Proxy", [impl.address, initData]);
console.log("proxy         :", proxy.address);

// 4. Read the EIP-1967 slot back to confirm the link the explorer relies on.
const raw = await publicClient.getStorageAt({
  address: proxy.address,
  slot: IMPL_SLOT,
});
const fromSlot = getAddress("0x" + raw!.slice(-40));

console.log("\nEIP-1967 slot :", raw);
console.log("decoded       :", fromSlot);
console.log(
  "slot matches  :",
  fromSlot.toLowerCase() === impl.address.toLowerCase() ? "yes" : "NO",
);

// 5. Read through the proxy to confirm state lives there.
const box = await viem.getContractAt("BoxV1", proxy.address);
console.log("\nvalue() via proxy  :", (await box.read.value()).toString());
console.log("version() via proxy:", await box.read.version());
console.log("owner() via proxy  :", await box.read.owner());

console.log("\n--- verification inputs ---");
console.log("implementation :", impl.address);
console.log("proxy          :", proxy.address);
console.log("constructor arg 1 (implementation):", impl.address);
console.log("constructor arg 2 (init calldata) :", initData);
console.log(`
Next:
  npx hardhat verify --network ${process.env.HARDHAT_NETWORK ?? "whitechainSepolia"} ${impl.address}
  npx hardhat verify --force --network ${process.env.HARDHAT_NETWORK ?? "whitechainSepolia"} ${proxy.address} ${impl.address} ${initData}
`);
