// Takes Amharic language words and produces a stem
// ልጆች -> ልጅኦች -> ljoc -> lj -> ልጅ
import { felig_transliterate } from "./transliterator.js";
import type { LanguagePack } from "./types.js";

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Takes an Amharic word and returns the stem through affix-removal with longest match.
 * @param word : word possibly containing one or more affix
 * @param pack : the language pack configuration
 * @returns : the stem of the word passed
 *
 * @example {stem word with affix}
 * stem("ልጆቻቸውን", amPack) // returns "ልጅ"
 */
export function stem(word: string, pack: LanguagePack): string {
  if (pack.stemmer.protected_words) {
    if (pack.stemmer.protected_words.includes(word)) {
      return word;
    }
    // Check if stripping any prefix yields a protected word
    const prefixes = pack.stemmer.prefixes || [];
    for (const prefix of prefixes) {
      if (word.startsWith(prefix)) {
        const stripped = word.substring(prefix.length);
        if (pack.stemmer.protected_words.includes(stripped)) {
          return stripped;
        }
      }
    }
  }

  let cv_string = felig_transliterate(word, "am", pack); // consonant-vowel string

  const sfx_arr: string[] = [];
  const pfx_arr: string[] = [];

  // Prepare suffix array
  const sarr = pack.stemmer.suffixes || [];
  sarr.forEach((suffix) => {
    sfx_arr.push(felig_transliterate(suffix, "am", pack));
    if (suffix.startsWith("ዎ")) {
      const altSuffix = "ኦ" + suffix.substring(1);
      sfx_arr.push(felig_transliterate(altSuffix, "am", pack));
    }
  });

  sfx_arr.push("Wa"); // Special case for ሯ
  sfx_arr.sort((a, b) => b.length - a.length);

  // Prepare prefix array
  const parr = pack.stemmer.prefixes || [];
  parr.forEach((prefix) => {
    pfx_arr.push(felig_transliterate(prefix, "am", pack));
  });
  pfx_arr.sort((a, b) => b.length - a.length);

  // Remove suffixes
  sfx_arr.every(function (sfx, index) {
    if (cv_string.endsWith(sfx)) {
      let regex = new RegExp(`${escapeRegExp(sfx)}$`, `i`);
      cv_string = cv_string.replace(regex, "");
      return false;
    } else return true;
  });

  // Remove prefixes
  pfx_arr.every(function (pfx, index) {
    if (cv_string.startsWith(pfx)) {
      let regex = new RegExp(`^${escapeRegExp(pfx)}`);
      cv_string = cv_string.replace(regex, "");
      return false;
    } else return true;
  });

  // Remove infixes
  if (/.+([^aeiou])[aeiou]\1[aeiou].?/i.test(cv_string)) {
    cv_string = cv_string.replace(/\S\S[^aeiou][aeiou]/i, cv_string[0] + cv_string[1]);
  } else if (/^(.+)a\1$/i.test(cv_string)) {
    cv_string = cv_string.replace(/a.+/i, "");
  }

  const ccvMatch = cv_string.match(/[bcdfghjklmnpqrstvwxyz]{2}e/i);
  if (ccvMatch) {
    cv_string = cv_string.replace(
      /[bcdfghjklmnpqrstvwxyz]{2}e/i,
      ccvMatch[0].substring(0, 1) + "X" + ccvMatch[0].substring(1),
    );
  }

  return felig_transliterate(cv_string, "en", pack);
}

export default stem;
