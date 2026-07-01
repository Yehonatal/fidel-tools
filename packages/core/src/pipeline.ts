import type { LanguagePack } from "./types.js";
import { stem } from "./stemmer.js";
import { removeStopwords } from "./stopword_remover.js";
import { lexAnalyze } from "./lexical_analyzer.js";
import { felig_transliterate, sera_transliterate } from "./transliterator.js";
import { indexDocuments, indexQuery } from "./indexer.js";
import { weighTerms } from "./term_weighter.js";
import type { DocIndexData, QueryIndexData } from "./indexer.js";
import { normalize } from "./normalizer.js";
import { sentenceTokenize } from "./sentence_tokenizer.js";

type CoreNativeModule = {
    initNormalizer: () => void;
    WasmNormalizer: new (
        charMap: Record<string, string>,
        labializedMap: Record<string, string>,
        geminationThreshold: number | undefined,
    ) => {
        normalize(text: string): string;
    };
};

// Dynamically load native module in Node environment without triggering bundler errors in browser
let coreNative: CoreNativeModule | null = null;
let wasmSupported = false;

if (typeof (globalThis as any).window === "undefined") {
    try {
        const { createRequire } = await import(/* webpackIgnore: true */ "node:module");
        const require = createRequire(import.meta.url);
        coreNative = require("@fidel-tools/core-native") as CoreNativeModule;
        if (coreNative) {
            coreNative.initNormalizer();
            wasmSupported = true;
        }
    } catch {
        // Silently fallback to JS implementation
    }
}

export class Pipeline {
    private wasmNormalizer: { normalize(text: string): string } | null = null;

    constructor(private pack: LanguagePack) {
        if (wasmSupported && coreNative && pack.normalization) {
            try {
                this.wasmNormalizer = new coreNative.WasmNormalizer(
                    pack.normalization.char_map || {},
                    pack.normalization.labialized_map || {},
                    pack.normalization.gemination_threshold,
                );
            } catch {
                this.wasmNormalizer = null;
            }
        }
    }

    get stopwords(): string[] {
        return this.pack.stopwords || [];
    }

    normalize(text: string): string {
        if (!text) return "";
        if (this.wasmNormalizer) {
            try {
                return this.wasmNormalizer.normalize(text);
            } catch (e) {
                // fallback
            }
        }
        return normalize(text, this.pack);
    }

    sentenceTokenize(text: string): string[] {
        if (!text) return [];
        return sentenceTokenize(text, this.pack);
    }

    stem(word: string): string {
        if (!word) return "";
        return stem(word, this.pack);
    }

    removeStopwords(corpus: string): string {
        if (!corpus) return "";
        return removeStopwords(corpus, this.pack);
    }

    lexAnalyze(corpus: string): string {
        if (!corpus) return "";
        return lexAnalyze(corpus, this.pack);
    }

    feligTransliterate(word: string, lang: "am" | "en"): string {
        if (!word) return "";
        return felig_transliterate(word, lang, this.pack);
    }

    // Depreciated : Not used across our toolset (just here so we can fix it later)
    seraTransliterate(word: string, lang: "am" | "en"): string {
        if (!word) return "";
        return sera_transliterate(word, lang, this.pack);
    }
    indexDocuments(docs: Array<{ id: string; content: string }>): DocIndexData {
        if (!docs || docs.length === 0) {
            return { corpus_size: 0, corpus_word_count: {}, words: {} };
        }
        return indexDocuments(docs, this.pack);
    }

    indexQuery(query: string): QueryIndexData {
        if (!query) {
            return { corpus_size: 0, corpus_word_count: 0, words: {} };
        }
        return indexQuery(query, this.pack);
    }

    weighTerms(index: DocIndexData | QueryIndexData, type: "doc" | "query") {
        if (!index) return null;
        return weighTerms(index, type);
    }
}
