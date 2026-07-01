export interface LanguagePackMeta {
  code: string;
  name: string;
  native_name?: string;
  script: string;
  version?: string;
  authors?: string[];
}

export interface NormalizationConfig {
  char_map: Record<string, string>;
  labialized_map: Record<string, string>;
  gemination_threshold: number;
}

export interface TokenizationConfig {
  split_on_spaces: boolean;
  sentence_boundaries: string[];
  punctuation: string[];
  exceptions: Record<string, string[]>;
}

export interface StemmerConfig {
  prefixes: string[];
  suffixes: string[];
  protected_words: string[];
}

export interface TransliterationSchemeConfig {
  scheme: string;
  map: Record<string, string>;
}

export interface TransliterationConfig {
  sera: TransliterationSchemeConfig;
  felig: TransliterationSchemeConfig;
}

export interface NumbersConfig {
  ethiopic_to_arabic: Record<string, string>;
}

// TODO: Implement Sentiment analysis in core engine. Currently defined for future LanguagePack schema completeness.
export interface SentimentConfig {
  model: string;
  lexicon: string;
}

// TODO: Implement Named Entity Recognition (NER) in core engine. Currently defined for future LanguagePack schema completeness.
export interface NERConfig {
  model: string;
  name_lists: string[];
}

export interface LanguagePack {
  meta: LanguagePackMeta;
  normalization?: NormalizationConfig;
  tokenization?: TokenizationConfig;
  stopwords: string[];
  stemmer: StemmerConfig;
  transliteration: TransliterationConfig;
  numbers?: NumbersConfig;
  sentiment?: SentimentConfig;
  ner?: NERConfig;
}
