import { createRequire } from "node:module";
import { getAddress } from "@ethersproject/address";
import { CHAINS } from "./chains.js";
import type { TokenList } from "./types.js";

// ajv and ajv-formats are CommonJS; load them via require so the default-export
// interop is unambiguous under NodeNext (both tsc and tsx agree on the shape).
const require = createRequire(import.meta.url);
const Ajv = require("ajv") as typeof import("ajv").default;
const addFormats = require("ajv-formats") as typeof import("ajv-formats").default;
// The official Uniswap Token List JSON schema ships inside the package.
const schema = require("@uniswap/token-lists/src/tokenlist.schema.json");

/** Validate a token list against the official schema + Whitechain-specific rules. */
export function validateTokenList(list: TokenList): string[] {
  const errors: string[] = [];

  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  if (!validate(list)) {
    for (const err of validate.errors ?? []) {
      errors.push(`schema ${err.instancePath || "/"} ${err.message ?? ""}`.trim());
    }
  }

  const knownChainIds = new Set<number>(Object.values(CHAINS));

  list.tokens.forEach((token, i) => {
    const where = `tokens[${i}] (${token.symbol} @ ${token.address})`;

    // Every chainId must exist in the chain config.
    if (!knownChainIds.has(token.chainId)) {
      errors.push(`${where}: chainId ${token.chainId} is not in src/chains.ts`);
    }

    // Every address must be a checksummed 40-hex EVM address.
    if (!/^0x[0-9a-fA-F]{40}$/.test(token.address)) {
      errors.push(`${where}: address is not a 40-hex EVM address`);
    } else {
      let checksummed: string | null = null;
      try {
        checksummed = getAddress(token.address);
      } catch {
        errors.push(`${where}: address fails EIP-55 checksum`);
      }
      if (checksummed && checksummed !== token.address) {
        errors.push(
          `${where}: address is not checksummed (expected ${checksummed})`,
        );
      }
    }
  });

  return errors;
}
