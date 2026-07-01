# @fidel-tools/lang-am

<p align="center">
  The curated Amharic language pack and schema configuration for Fidel Tools.
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@fidel-tools/lang-am"><img src="https://img.shields.io/npm/v/@fidel-tools/lang-am.svg" alt="NPM Version" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## Overview

`@fidel-tools/lang-am` contains the standardized, schema-compliant definition of Amharic linguistic rules, dictionary maps, abbreviation rules, and stemming configurations used by the Fidel Tools NLP pipeline.

---

## Features

- **Metadata Configuration**: Contains author, versioning, language codes, and script identifiers.
- **Normalization Maps**: Predefined dictionaries mapping homophones (`char_map`), labialized sequences (`labialized_map`), and gemination repetition rules.
- **Stopwords**: Standardized academic list of 430+ Amharic stopwords.
- **Stemmer Rules**: Prefix and suffix definitions for Amharic light stemming, alongside protected words to avoid stemmer corruption.
- **Tokenization rules**: Custom sentence boundaries and a list of 570+ Amharic abbreviation expansion mappings.
- **Transliteration tables**: Rules for bidirectional SERA and Felig ASCII mapping.

---

## Installation

```bash
pnpm add @fidel-tools/lang-am
```

---

## Usage

Use the pack directly with the `@fidel-tools/core` pipeline:

```typescript
import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
console.log(nlp.normalize("ሐኪም ኀይሉ")); // "ሃኪም ሃይሉ"
```

---

## Language Pack Schema Reference

A language pack configuration conforms to the `LanguagePack` interface in `@fidel-tools/core`. It consists of:

```json
{
  "meta": {
    "code": "am",
    "name": "Amharic",
    "script": "ethiopic"
  },
  "normalization": {
    "char_map": { "ሀ": "ሃ" },
    "labialized_map": { "ሏ": "ሉዋ" },
    "gemination_threshold": 2
  },
  "tokenization": {
    "sentence_boundaries": ["።", "፡", "?", "!"],
    "exceptions": { "ት/ቤት": ["ትምህርት", "ቤት"] }
  },
  "stopwords": ["እና", "በመሆኑም"],
  "stemmer": {
    "prefixes": ["የ", "በ", "ከ"],
    "suffixes": ["ኦች", "ዎች"],
    "protected_words": ["ኢትዮጵያ"]
  },
  "transliteration": {
    "sera": { "map": { "ሀ": "h" } },
    "felig": { "map": { "ሀ": "he" } }
  }
}
```

---

## License

Part of the [Fidel Tools](https://github.com/Yehonatal/fidel-tools) project. Licensed under the [MIT License](https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE).
