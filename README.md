<p align="center">
  <img height="150" src="./Fidel.png" alt="Fidel Tools logo" />
</p>


<p align="center">
  The most comprehensive, schema-driven NLP pre-processing framework for Amharic.
</p>

<p align="center">
  <a href="https://fidel-tools.vercel.app/">Website</a> · 
  <a href="https://github.com/Yehonatal/fidel-tools/issues">Issues</a> · 
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@fidel-tools/core"><img src="https://img.shields.io/npm/v/@fidel-tools/core.svg" alt="NPM Version" /></a>
  <a href="https://pypi.org/project/fidel-tools/"><img src="https://img.shields.io/pypi/v/fidel-tools.svg" alt="PyPI Version" /></a>
  <a href="https://fidel-tools.vercel.app/"><img src="https://img.shields.io/badge/demo-live-brightgreen.svg" alt="Live Demo" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## What is Fidel Tools?

Fidel Tools is a modular, schema-driven pre-processing and Natural Language Processing (NLP) toolkit designed specifically for Amharic and other Ethiopic script text. It provides high-performance components out of the box including character normalization, sentence boundary tokenization, prefix-aware stopword removal, light stemming, and bidirectional transliteration.

Natural Language Processing in the Ethiopic ecosystem is a half-solved problem. Most implementations require hardcoded, unconfigurable logic and suffer from low accuracy. We believe developers deserve a production-grade, highly customizable solution hence, **Fidel Tools**.

---

## Packages

Fidel Tools is managed as a monorepo workspace. Check the individual package directories and their respective changelogs:

| Package | Description | Version | Changelog |
| :--- | :--- | :--- | :--- |
| [`@fidel-tools/core`](./packages/core) | Core processing pipeline and NLP engine | `0.1.8` | [Changelog](./packages/core/CHANGELOG.md) |
| [`@fidel-tools/lang-am`](./packages/lang-am) | Amharic language pack & schema configurations | `0.1.8` | [Changelog](./packages/lang-am/CHANGELOG.md) |
| [`@fidel-tools/validate-pack`](./packages/validate-pack) | CLI tool to validate & fix language packs | `0.1.8` | [Changelog](./packages/validate-pack/CHANGELOG.md) |
| [`fidel-tools` (Python)](./packages/py-fidel-tools) | Python bindings for the core native Rust engine | `0.1.8` | [README](./packages/py-fidel-tools/README.md) |

---

## Quick Start

### Installation

**Node.js**:
```bash
pnpm add @fidel-tools/core @fidel-tools/lang-am
```

**Python**:
```bash
pip install fidel-tools
```

### Usage

**Node.js**:
```typescript
import { Pipeline } from '@fidel-tools/core'
import amPack from '@fidel-tools/lang-am'

const nlp = new Pipeline(amPack)

// Normalize homophones, labialization, and gemination
const text = nlp.normalize("ሐኪም ኀይሉ በልቷልልል!")
console.log(text) // "ሃኪም ሃይሉ በልቱዋልል!"

// Remove stopwords using boundary rules
const cleaned = nlp.removeStopwords("ያወጣውን የተጨማሪ እሴት")
console.log(cleaned) // "ያወጣውን የ እሴት"

// Stem Amharic words
const stem = nlp.stem("ልጆቻቸውን")
console.log(stem) // "ልጅ"
```

**Python**:
```python
import fidel_tools as fidel

# Load Amharic language pack
am_pack = fidel.get_amharic_pack()

# Initialize pipeline
nlp = fidel.Pipeline(am_pack)

# Normalize homophones, labialization, and gemination
text = nlp.normalize("ሐኪም ኀይሉ በልቷልልል!")
print(text)  # "ሃኪም ሃይሉ በልቱዋልል!"

# Remove stopwords using boundary rules
cleaned = nlp.remove_stopwords("ያወጣውን የተጨማሪ እሴት")
print(cleaned)  # "ያወጣውን የ እሴት"

# Stem Amharic words
stem = nlp.stem("ልጆቻቸውን")
print(stem)  # "ልጅ"
```

---

## Performance & Benchmarks

Fidel Tools prioritizes execution speed and scalability. We measure throughput and latencies across three different target environments: pure JavaScript, compiled WebAssembly (Rust), and native Python bindings (via PyO3).

### Processing Throughput (ops/sec)

Benchmarks evaluated on standard medium-length paragraphs (~200 characters):

| Environment | Language / Tech | Throughput | Average Latency | Speedup |
| :--- | :--- | :--- | :--- | :--- |
| **Python Package** | Python + PyO3 Native | ~117,000 ops/s | ~8.50 μs | **1.70x** (Fastest) |
| **WASM Engine** | Node.js + WebAssembly | ~93,000 ops/s | ~10.75 μs | **1.35x** |
| **JS Fallback** | Pure JavaScript | ~69,000 ops/s | ~14.50 μs | Baseline (1.00x) |

*For complete performance percentiles (p50, p95, p99), category breakdowns, and linguistic accuracy benchmarks, please refer to the detailed [BENCHMARKS.md](BENCHMARKS.md) report.*

---

## Production Deployment Notes

### Rate Limiter Limitation
The built-in rate limiter (`apps/api/src/middleware/rateLimiter.ts`) stores request counters in an in-memory Javascript store. While perfectly sufficient for single-instance applications or local testing, this state is volatile and resets on server restarts. If you are deploying the API across multiple distributed instances, it is recommended to refactor the memory store in `rateLimiter.ts` to utilize a shared cache database like Redis.

---

## Contribution

Fidel Tools is free and open-source software licensed under the [MIT License](LICENSE). You can support the project by:

- Contributing features, fixes, or new language packs. Read our [Contributing Guide](CONTRIBUTING.md).
- Opening [issues](https://github.com/Yehonatal/fidel-tools/issues) or submitting feature requests.

---

## Academic References

The processing logic draws on academic foundations in Ethiopic NLP:

- [Girma Neshir Alemneh. “Amharic Light Stemmer”. ResearchGate. Sep 2020.](https://www.researchgate.net/publication/344285263_Amharic_Light_Stemmer)
- [Genet Mezemir Fikremariam. “Automatic Stemming for Amharic text: An experiment using successor variety approach”. AAU. Jan 2009.](http://etd.aau.edu.et/bitstream/handle/123456789/14590/Genet%20Mezemir.pdf?sequence=1&isAllowed=y)
- [Tessema Mindaye Mengistu. “Design and Implementation of Amharic Search Engine”. ResearchGate. August 2007.](https://www.researchgate.net/publication/323384408_Design_and_Implementation_of_Amharic_Search_Engine)
- [Yitna Firdyiwek and Daniel Yaqob. “The System for Ethiopic Representation in ASCII”. ResearchGate. Jan 1997.](https://www.researchgate.net/publication/2682324_The_System_for_Ethiopic_Representation_in_ASCII)
