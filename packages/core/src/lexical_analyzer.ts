// Separates words, expands abbreviations, removes numbers, breaks up hyphenated words, and removes punctuation
import type { LanguagePack } from "./types.js";

/**
 * Separates words, expands abbreviations, removes numbers, breaks up hyphenated words, and removes punctuation
 * @param corpus : Amharic text
 * @param pack : language pack configuration
 * @returns : Lexically analyzed Amharic text
 */
export function lexAnalyze(corpus: string, pack: LanguagePack): string {
  // Expand exceptions (abbreviations)
  if (pack.tokenization && pack.tokenization.exceptions) {
    for (const key in pack.tokenization.exceptions) {
      const expansion = pack.tokenization.exceptions[key].join(" ");
      corpus = corpus.replaceAll(key, expansion);
    }
  }

  corpus = corpus
    .replace(/[.\?"',/#!$%^&*;:፤።{}=\-_`~()]/g, " ")
    .replace(/[.፩፪፫፬፭፮፯፰፱፲፳፴፵፶፷፸፹፺፻0123456789]/g, " ")
    .replace(/\s{2,}/g, " ");

  return corpus;
}

export default lexAnalyze;
