# @fidel-tools/core

<p align="center">
  The core NLP pipeline and text preprocessing engine for Amharic and Ethiopic script processing.
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@fidel-tools/core"><img src="https://img.shields.io/npm/v/@fidel-tools/core.svg" alt="NPM Version" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## Overview

`@fidel-tools/core` provides the primary processing pipeline for Amharic NLP. It coordinates tokenization, stopword removal, character normalization, transliteration, and indexing. If the `@fidel-tools/core-native` WebAssembly module is installed and initialized, it automatically delegates heavy normalization tasks to it for maximum performance.

---

## Features

- **Unified Pipeline**: Simple class interface to perform all pre-processing operations in sequence.
- **Text Normalization**: Standardizes homophones, expands labialized strings, and collapses character geminations.
- **Tokenization**: Sentence-level tokenization and lexical analysis with abbreviation expansion.
- **Stopword Removal**: Morphology-aware filtering that removes stopwords without corrupting word bases.
- **Light Stemming**: Rule-based affix removal for root word extraction.
- **Bidirectional Transliteration**: Supports both SERA and Felig ASCII schemas.
- **Indexing & Term Weighting**: Production-ready document and query indexer with TF-IDF calculation.

---

## Installation

```bash
pnpm add @fidel-tools/core @fidel-tools/lang-am
```

---

## Quick Start

### 1. Unified Pipeline

```typescript
import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);

// Normalize, tokenize, stem, and remove stopwords
const normalized = nlp.normalize("ሐኪም ኀይሉ በልቷልልል!");
const tokens = nlp.lexAnalyze("ት/ቤት እና መስሪያ ቤት");
const stem = nlp.stem("ልጆቻቸውን");
const clean = nlp.removeStopwords("ያወጣውን የተጨማሪ እሴት");
```

### 2. Functional API

You can also import and use individual processing functions directly.

```typescript
import { normalize, removeStopwords, stem } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const text = normalize("ሐኪም ኀይሉ", amPack);
const clean = removeStopwords("በመሆኑም ትምህርት", amPack);
const root = stem("ልጆች", amPack);
```

---

## API Reference

### `Pipeline`
Unified preprocessing context.

- `constructor(pack: LanguagePack)`: Initializes the pipeline with a language pack configuration.
- `normalize(text: string): string`: Normalizes characters and collapses geminations.
- `sentenceTokenize(text: string): string[]`: Tokenizes text into sentences.
- `stem(word: string): string`: Extracts the base form of an Amharic word.
- `removeStopwords(corpus: string): string`: Strips stopwords using morphology rules.
- `lexAnalyze(corpus: string): string`: Standardizes text, expands abbreviations, and strips punctuation.
- `feligTransliterate(word: string, lang: 'am' | 'en'): string`: Transliterates to/from English using the Felig scheme.
- `indexDocuments(docs: Array<{ id: string, content: string }>): DocIndexData`: Builds a term-frequency index of document corpora.
- `indexQuery(query: string): QueryIndexData`: Indexes search query strings.
- `weighTerms(index: DocIndexData | QueryIndexData, type: 'doc' | 'query'): Record<string, any>`: Calculates TF-IDF weights on indexes.

---

## Performance

For extreme workloads, install `@fidel-tools/core-native` to accelerate normalizations:
- **WASM Engine**: ~93,000 ops/s - 1.35x speedup compared to pure JS.
- **JS Fallback**: ~69,000 ops/s - Baseline.

---

## License

Part of the [Fidel Tools](https://github.com/Yehonatal/fidel-tools) project. Licensed under the [MIT License](https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE).
