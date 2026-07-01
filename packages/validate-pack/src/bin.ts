#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validatePack, fixPack } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const args = process.argv.slice(2);
  const fixFlag = args.includes("--fix");
  const nonFlagArgs = args.filter((arg) => arg !== "--fix");
  let filePath = nonFlagArgs[0];

  if (!filePath) {
    // Attempt to locate packages/lang-am/am.json relative to workspace root
    filePath = path.resolve(__dirname, "../../lang-am/am.json");
    if (!fs.existsSync(filePath)) {
      console.error("Usage: validate-pack [--fix] <path-to-json-file>");
      process.exit(1);
    }
  }

  console.log(`Validating language pack at: ${filePath}`);

  let pack: any;
  try {
    const rawContent = fs.readFileSync(filePath, "utf8");
    pack = JSON.parse(rawContent);
  } catch (error: any) {
    console.error(`Error reading/parsing JSON file: ${error.message}`);
    process.exit(1);
  }

  if (fixFlag) {
    const { fixedPack, fixedCount } = fixPack(pack);
    if (fixedCount > 0) {
      console.log(`\n🔧 Fixing pack: resolved ${fixedCount} issues/duplicates.`);
      try {
        fs.writeFileSync(filePath, JSON.stringify(fixedPack, null, 4), "utf8");
        console.log(`Saved fixed pack back to ${filePath}\n`);
        pack = fixedPack;
      } catch (error: any) {
        console.error(`Error saving fixed pack: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log("\nNo fixable issues found.\n");
    }
  }

  const result = validatePack(pack);

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((warn) => console.log(`  - ${warn}`));
  }

  if (result.errors.length > 0) {
    console.error("\n❌ Errors found during validation:");
    result.errors.forEach((err) => console.error(`  - ${err}`));
    console.log("\nValidation FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ Validation PASSED! No schema errors or cyclic mappings found.");
    process.exit(0);
  }
}

main();
