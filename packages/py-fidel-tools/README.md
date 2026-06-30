# Fidel Tools - Python Toolkit

Fidel Tools is a suite of high-performance natural language processing (NLP) components for the Amharic language. This package leverages a native Rust core (`core-native`) compiled via PyO3 to provide lightning-fast, production-ready Amharic preprocessing.

## Installation

```bash
pip install fidel-tools
```

## Features

- **Text Normalization**: Standardizes character representations and collapses gemination.
- **Sentence Tokenization**: Splits Amharic text into logical sentences based on customizable boundaries.
- **Stemming**: Custom affix-removal stemmer mapping Amharic words to their base forms.
- **Stopwords Removal**: Dynamic removal of common semantically low-value words.
- **Lexical Analysis**: Expanded abbreviations, number removal, and punctuation handling.
- **Transliteration**: High-performance transliteration schemes (Sera, Felig).
- **Indexing & Term Weighting**: Production-grade document and query indexer with TF-IDF weighting.
- **spaCy Integration**: Native spaCy-compatible tokenizer.
