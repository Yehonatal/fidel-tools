# @fidel-tools/validate-pack

<p align="center">
  The automated CLI validation and linting tool for verifying schema correctness, duplicate rules, and cyclic maps in Fidel Tools language packs.
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@fidel-tools/validate-pack"><img src="https://img.shields.io/npm/v/@fidel-tools/validate-pack.svg" alt="NPM Version" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## Overview

`@fidel-tools/validate-pack` is a validation utility and CLI tool for Fidel Tools language packs. It performs static analysis checks to catch circular references, overlap errors, duplicate definitions, and schema schema mismatches that would cause runtime loops or errors in the main pipeline.

---

## Features

- **Schema Check**: Validates language pack configuration against the `LanguagePack` schema definitions.
- **Cycle Detection**: Resolves graph chains in `char_map` and `labialized_map` to flag circular references.
- **Deduplication**: Identifies overlapping rules in stemmer prefixes, suffixes, and stopword arrays.
- **Auto-Fix**: Auto-cleans array duplicates and configuration overlaps with a simple command flag.

---

## Installation

Install globally for CLI usage or locally for programmatic access:

```bash
# Global CLI installation
pnpm add -g @fidel-tools/validate-pack

# Local project dependency
pnpm add @fidel-tools/validate-pack
```

---

## CLI Usage

### Run Validation

Verify a language pack JSON file:

```bash
validate-pack ./path/to/am.json
```

### Auto-Fix Pack

Deduplicate arrays and fix rule conflicts inline:

```bash
validate-pack --fix ./path/to/am.json
```

---

## Programmatic API

```typescript
import { validatePack, fixPack } from '@fidel-tools/validate-pack';
import amPack from '@fidel-tools/lang-am';

// Validate pack schema and logic
const report = validatePack(amPack);
console.log(report.isValid); // true
console.log(report.errors);  // List of warning/error messages

// Fix pack programmatically
const { fixedPack, fixedCount } = fixPack(amPack);
```

---

## API Reference

### `validatePack(pack: any): { isValid: boolean, errors: string[] }`
Validates schema compliance, character cycles, overlapping protection constraints, and list duplicates.

### `fixPack(pack: any): { fixedPack: any, fixedCount: number }`
Resolves array duplicates, protects stemmer keys, and returns the updated pack.

---

## License

Part of the [Fidel Tools](https://github.com/Yehonatal/fidel-tools) project. Licensed under the [MIT License](https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE).
