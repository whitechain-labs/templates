import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Storage", async function () {
  const { viem } = await network.create();

  it("starts at zero", async function () {
    const storage = await viem.deployContract("Storage");

    assert.equal(await storage.read.retrieve(), 0n);
  });

  it("stores and retrieves a value", async function () {
    const storage = await viem.deployContract("Storage");

    await storage.write.store([42n]);

    assert.equal(await storage.read.retrieve(), 42n);
  });
});
