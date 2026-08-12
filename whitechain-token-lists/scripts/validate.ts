import { readFileSync, existsSync } from "node:fs";
import { OUTPUT_FILE } from "../src/build.js";
import { validateTokenList } from "../src/schema.js";
import type { TokenList } from "../src/types.js";

function main() {
  if (!existsSync(OUTPUT_FILE)) {
    console.error(`${OUTPUT_FILE} not found — run \`npm run generate\` first.`);
    process.exit(1);
  }

  let list: TokenList;
  try {
    list = JSON.parse(readFileSync(OUTPUT_FILE, "utf8")) as TokenList;
  } catch (err) {
    console.error(`${OUTPUT_FILE} is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }

  const errors = validateTokenList(list);
  if (errors.length > 0) {
    console.error(`${OUTPUT_FILE} is invalid:\n`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log(
    `${OUTPUT_FILE} is valid: ${list.tokens.length} token(s), ` +
      `v${list.version.major}.${list.version.minor}.${list.version.patch}`,
  );
}

main();
