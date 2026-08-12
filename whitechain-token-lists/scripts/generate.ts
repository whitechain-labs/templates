import { writeFileSync } from "node:fs";
import { buildList, OUTPUT_FILE } from "../src/build.js";
import { validateTokenList } from "../src/schema.js";

function main() {
  const timestamp = new Date().toISOString();
  const list = buildList(timestamp);

  // Never write an invalid list.
  const errors = validateTokenList(list);
  if (errors.length > 0) {
    console.error(`Refusing to write ${OUTPUT_FILE} — validation failed:\n`);
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");

  const { major, minor, patch } = list.version;
  console.log(
    `Wrote ${OUTPUT_FILE}: ${list.tokens.length} token(s), ` +
      `v${major}.${minor}.${patch}, timestamp ${timestamp}`,
  );
}

main();
