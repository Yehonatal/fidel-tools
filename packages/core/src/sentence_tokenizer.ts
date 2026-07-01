import type { LanguagePack } from "./types.js";

/**
 * Tokenizes Amharic text into sentences using configured sentence boundaries.
 *
 * @param text The input string to split into sentences.
 * @param pack The language pack containing tokenization configuration.
 * @returns An array of sentence strings.
 */
export function sentenceTokenize(text: string, pack: LanguagePack): string[] {
  const boundaries = pack.tokenization?.sentence_boundaries || ["።", "፡", "?", "!", "."];
  if (boundaries.length === 0) {
    return [text];
  }

  // Escape boundaries for Regex character class
  const escaped = boundaries.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
  const regex = new RegExp(`[${escaped}]+`, "g");

  // Split on boundaries, trim whitespace, filter out empty sentences
  return text
    .split(regex)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default sentenceTokenize;
