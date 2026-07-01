// Removes stop words
import type { LanguagePack } from "./types.js";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Removes commonly occuring words that have no contribution to the semantics of the corpus.
 * @param corpus : Amharic text
 * @param pack : language pack configuration
 * @returns : the corpus without stopwords listed on {@link LanguagePack.stopwords}
 *
 * @example {remove stopwords}
 * removeStopwords("ይህ ሞባይል እና ኮምፒዩተር", amPack) // returns "ሞባይል ኮምፒዩተር"
 */
export function removeStopwords(corpus: string, pack: LanguagePack): string {
  let result = corpus;
  // Sort stopwords by length descending to match longer words first
  const sortedStopwords = [...pack.stopwords].sort((a, b) => b.length - a.length);

  sortedStopwords.forEach((word) => {
    // Regex that matches:
    // Group 1: Leading boundary (non-Ge'ez char or start of string)
    // Group 2: Optional prefix (standard prepositions)
    // Group 3: The stopword itself
    // Group 4: Optional suffix (standard markers)
    // Followed by lookahead for trailing boundary (non-Ge'ez char or end of string)
    const regex = new RegExp(
      `(^|[^\\u1200-\\u137F])(የ|በ|ከ|ለ|ስለ|የሚ|የማ)?(${escapeRegExp(word)})(ም|ን)?(?=[^\\u1200-\\u137F]|$)`,
      "g",
    );
    result = result.replace(regex, (match, p1, p2, p3, p4) => {
      // Keep boundary, prefix, and suffix, remove the stopword itself
      return `${p1}${p2 || ""}${p4 || ""}`;
    });
  });

  return result;
}

export default removeStopwords;
