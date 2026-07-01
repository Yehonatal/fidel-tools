# fidel-tools

<p align="center">
  Python port of Fidel Tools - Amharic language preprocessing toolkit.
</p>

<p align="center">
  <a href="https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://pypi.org/project/fidel-tools/"><img src="https://img.shields.io/pypi/v/fidel-tools" alt="PyPI Version" /></a>
</p>

---

## Overview

`fidel-tools` is the Python wrapper package for the Fidel Tools NLP suite. It wraps the core native Rust library (`core-native`) compiled via maturin's PyO3 bindings, bringing near-native speed and performance to Amharic preprocessing in Python. It includes a symmetrical API (matching JS), standard snake_case pythonic mappings, and a spaCy compatible tokenizer.

---

## Features

- **High-Performance Rust Core**: Employs PyO3 native extensions for fast homophone mapping, labialized string expansion, and gemination collapsing.
- **Pythonic & JS Symmetrical APIs**: Exposes both pythonic (snake_case) and JavaScript (camelCase) signatures on the Pipeline class.
- **spaCy Integration**: Easy integration of tokenizers into spaCy language pipelines.
- **Stopword & Stemmer Engines**: Morphology-aware boundary stopword filtering and light stemming.
- **Transliteration & Term Indexer**: SERA/Felig ASCII schemes and TF-IDF document/query indexers.

---

## Installation

```bash
pip install fidel-tools
```

---

## Quick Start

### Basic Pipeline Usage

```python
import fidel_tools as fidel

# 1. Load the pre-configured Amharic language pack
am_pack = fidel.get_amharic_pack()

# 2. Instantiate the pipeline
nlp = fidel.Pipeline(am_pack)

# 3. Perform pre-processing operations
normalized = nlp.normalize("ሐኪም ኀይሉ በልቷልልል!")
cleaned = nlp.remove_stopwords("ያወጣውን የተጨማሪ እሴት")
stemmed = nlp.stem("ልጆቻቸውን")

print(normalized)  # "ሃኪም ሃይሉ በልቱዋልል!"
```

### spaCy Tokenizer Integration

```python
import spacy
from fidel_tools import Pipeline, get_spacy_tokenizer, get_amharic_pack

# Create spaCy model
nlp = spacy.blank("am")

# Configure tokenizer
pipeline = Pipeline(get_amharic_pack())
nlp.tokenizer = get_spacy_tokenizer(nlp, pipeline)

# Process text
doc = nlp("ይህ የመጀመሪያው ዓረፍተ ነገር ነው።")
print([token.text for token in doc])
```

---

## API Reference

### Pipeline Methods
Supports both `camelCase` (symmetrical to JS) and `snake_case` signatures.

- `normalize(text: str) -> str`: Normalizes characters and collapses geminations.
- `sentence_tokenize(text: str) -> list`: Tokenizes text into sentences.
- `stem(word: str) -> str`: Extracts the base form of a word.
- `remove_stopwords(corpus: str) -> str`: Removes stopwords.
- `text_analyze(corpus: str) -> str`: Expands abbreviations and strips punctuation/numbers.
- `felig_transliterate(word: str, lang: str) -> str`: Felig transliteration.
- `sera_transliterate(word: str, lang: str) -> str`: SERA transliteration.
- `index_documents(docs: list) -> dict`: Indexes document dictionaries.
- `index_query(query: str) -> dict`: Indexes a single query string.
- `weigh_terms(index: dict, type_of_index: str) -> dict`: Calculates TF-IDF weights.

---

## License

Licensed under the [MIT License](https://github.com/Yehonatal/fidel-tools/blob/main/LICENSE).
