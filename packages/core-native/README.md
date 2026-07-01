# @fidel-tools/core-native

<p align="center">
  The high-performance, WebAssembly-compiled Rust core engine for the Fidel Tools NLP suite.
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@fidel-tools/core-native"><img src="https://img.shields.io/npm/v/@fidel-tools/core-native.svg" alt="NPM Version" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## Overview

`@fidel-tools/core-native` is the WebAssembly-compiled Rust core engine for the Fidel Tools Amharic NLP suite. It features an inlined base64 WASM binary, eliminating the need for external asset loading or complex bundler configuration. It works out of the box in Node.js (ESM and CommonJS), browsers, and modern bundlers.

---

## Features

- **Near-Native Performance**: Performs computationally heavy character maps and text transformations in optimized Rust.
- **Inlined WASM Binary**: Encodes the WASM binary directly in the JS bundle to bypass static asset hosting.
- **Dual ESM and CommonJS Bundles**: Built with typescript declarations for both modern imports and legacy require syntax.
- **Linguistic Normalization Core**: Low-level implementation of homophone mapping, labialized sequence expansion, and gemination collapsing.

---

## Installation

```bash
pnpm add @fidel-tools/core-native
```

---

## Quick Start

Initialize the WebAssembly module once before instantiating normalizers.

### ES Modules / TypeScript

```typescript
import { initNormalizer, WasmNormalizer } from '@fidel-tools/core-native';

initNormalizer();

const normalizer = new WasmNormalizer(
  { "ሀ": "ሃ", "ሐ": "ሃ" },
  { "ሏ": "ሉዋ" },
  2 // Gemination threshold
);

console.log(normalizer.normalize("ሐኪም በልቷልልል!")); 
// "ሃኪም በልቷልል!"
```

### CommonJS (Node.js)

```javascript
const { initNormalizer, WasmNormalizer } = require('@fidel-tools/core-native');

initNormalizer();

const normalizer = new WasmNormalizer({ "ሀ": "ሃ" }, { "ሏ": "ሉዋ" }, 2);
console.log(normalizer.normalize("ሀሁሏ")); // "ሃሁሉዋ"
```

---

## API Reference

### `initNormalizer(): void`
Loads and compiles the inlined WASM binary. Must be called once before creating instances of `WasmNormalizer`.

### `WasmNormalizer`
Rust-backed text normalization class.

#### `constructor(charMap: Record<string, string>, labializedMap: Record<string, string>, geminationThreshold: number | null)`
Creates a new normalizer instance.
- `charMap`: Character substitution dictionary.
- `labializedMap`: Labialized character expansion dictionary.
- `geminationThreshold`: Maximum consecutive identical characters allowed. Exceeding characters are collapsed. Pass `null` or `0` to disable.

#### `normalize(text: string): string`
Normalizes the input text and returns the result.

---

## Performance

- **WASM Engine**: ~93,000 ops/s (~10.75 μs latency) - 1.35x speedup compared to JavaScript baseline.
- **JS Fallback**: ~69,000 ops/s (~14.50 μs latency) - Baseline.

For detailed metrics, refer to the main [BENCHMARKS.md](https://github.com/Yehonatal/fidel-tools/blob/main/BENCHMARKS.md).

---

## License

Part of the [Fidel Tools](https://github.com/Yehonatal/fidel-tools) project. Licensed under the [MIT License](https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE).
