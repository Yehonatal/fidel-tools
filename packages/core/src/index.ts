// Types
export type {
  LanguagePack,
  LanguagePackMeta,
  StemmerConfig,
  TransliterationConfig,
} from "./types.js";

// Pipeline (primary API)
export { Pipeline } from "./pipeline.js";

// Individual functions (secondary API, for tree-shaking)
export { normalize } from "./normalizer.js";
export { sentenceTokenize } from "./sentence_tokenizer.js";
export { stem } from "./stemmer.js";
export { removeStopwords } from "./stopword_remover.js";
export { lexAnalyze } from "./lexical_analyzer.js";
export { felig_transliterate } from "./transliterator.js";
export { indexDocuments, indexQuery, indexTerms } from "./indexer.js";
export { weighTerms, weigh_terms } from "./term_weighter.js";
