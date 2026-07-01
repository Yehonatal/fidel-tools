export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a language pack for schema correctness, cycle detection, and consistency.
 *
 * @param pack The language pack object to validate.
 * @returns A ValidationResult containing errors and warnings.
 */
export function validatePack(pack: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pack || typeof pack !== "object") {
    errors.push("Language pack must be a valid JSON object.");
    return { isValid: false, errors, warnings };
  }

  // 1. Meta Validation
  if (!pack.meta || typeof pack.meta !== "object") {
    errors.push("Missing or invalid meta block.");
  } else {
    const { name, code, script, version, authors } = pack.meta;
    if (typeof name !== "string" || !name) errors.push("meta.name must be a non-empty string.");
    if (typeof code !== "string" || !code) errors.push("meta.code must be a non-empty string.");
    if (typeof script !== "string" || !script)
      errors.push("meta.script must be a non-empty string.");
    if (version !== undefined && typeof version !== "string")
      errors.push("meta.version must be a string.");
    if (authors !== undefined) {
      if (!Array.isArray(authors)) {
        errors.push("meta.authors must be an array of strings.");
      } else {
        authors.forEach((a: any, idx: number) => {
          if (typeof a !== "string") errors.push(`meta.authors[${idx}] must be a string.`);
        });
      }
    }
  }

  // 2. Normalization Validation
  if (pack.normalization) {
    if (typeof pack.normalization !== "object") {
      errors.push("normalization block must be an object.");
    } else {
      const { char_map, labialized_map, gemination_threshold } = pack.normalization;

      if (char_map && typeof char_map !== "object") {
        errors.push("normalization.char_map must be an object.");
      } else if (char_map) {
        validateMapObject("normalization.char_map", char_map, errors);
        detectMapCycles("normalization.char_map", char_map, errors);
      }

      if (labialized_map && typeof labialized_map !== "object") {
        errors.push("normalization.labialized_map must be an object.");
      } else if (labialized_map) {
        validateMapObject("normalization.labialized_map", labialized_map, errors);
        detectMapCycles("normalization.labialized_map", labialized_map, errors);
      }

      if (
        gemination_threshold !== undefined &&
        (typeof gemination_threshold !== "number" || gemination_threshold < 0)
      ) {
        errors.push("normalization.gemination_threshold must be a non-negative number.");
      }
    }
  }

  // 3. Tokenization Validation
  if (pack.tokenization) {
    if (typeof pack.tokenization !== "object") {
      errors.push("tokenization block must be an object.");
    } else {
      const { split_on_spaces, sentence_boundaries, punctuation, exceptions } = pack.tokenization;

      if (split_on_spaces !== undefined && typeof split_on_spaces !== "boolean") {
        errors.push("tokenization.split_on_spaces must be a boolean.");
      }

      if (sentence_boundaries && !Array.isArray(sentence_boundaries)) {
        errors.push("tokenization.sentence_boundaries must be an array of strings.");
      } else if (sentence_boundaries) {
        sentence_boundaries.forEach((b: any, idx: number) => {
          if (typeof b !== "string")
            errors.push(`tokenization.sentence_boundaries[${idx}] must be a string.`);
        });
      }

      if (punctuation && !Array.isArray(punctuation)) {
        errors.push("tokenization.punctuation must be an array of strings.");
      } else if (punctuation) {
        punctuation.forEach((p: any, idx: number) => {
          if (typeof p !== "string")
            errors.push(`tokenization.punctuation[${idx}] must be a string.`);
        });
      }

      if (exceptions && typeof exceptions !== "object") {
        errors.push("tokenization.exceptions must be an object.");
      } else if (exceptions) {
        Object.entries(exceptions).forEach(([key, val]: [string, any]) => {
          if (!Array.isArray(val)) {
            errors.push(`tokenization.exceptions['${key}'] must map to an array of strings.`);
          } else {
            val.forEach((word: any, idx: number) => {
              if (typeof word !== "string") {
                errors.push(`tokenization.exceptions['${key}'][${idx}] must be a string.`);
              }
            });
            if (val.length === 0) {
              warnings.push(`tokenization.exceptions['${key}'] maps to an empty array.`);
            }
          }
        });
      }
    }
  }

  // 4. Stemmer Validation
  if (pack.stemmer) {
    if (typeof pack.stemmer !== "object") {
      errors.push("stemmer block must be an object.");
    } else {
      const { prefixes, suffixes, protected_words } = pack.stemmer;

      if (prefixes && !Array.isArray(prefixes)) {
        errors.push("stemmer.prefixes must be an array of strings.");
      } else if (prefixes) {
        prefixes.forEach((p: any, idx: number) => {
          if (typeof p !== "string") errors.push(`stemmer.prefixes[${idx}] must be a string.`);
        });
        detectDuplicates("stemmer.prefixes", prefixes, warnings);
      }

      if (suffixes && !Array.isArray(suffixes)) {
        errors.push("stemmer.suffixes must be an array of strings.");
      } else if (suffixes) {
        suffixes.forEach((s: any, idx: number) => {
          if (typeof s !== "string") errors.push(`stemmer.suffixes[${idx}] must be a string.`);
        });
        detectDuplicates("stemmer.suffixes", suffixes, warnings);
      }

      if (protected_words && !Array.isArray(protected_words)) {
        errors.push("stemmer.protected_words must be an array of strings.");
      } else if (protected_words) {
        protected_words.forEach((w: any, idx: number) => {
          if (typeof w !== "string")
            errors.push(`stemmer.protected_words[${idx}] must be a string.`);
        });
        detectDuplicates("stemmer.protected_words", protected_words, warnings);
      }
    }
  }

  // 5. Stopwords Validation
  if (pack.stopwords) {
    if (!Array.isArray(pack.stopwords)) {
      errors.push("stopwords must be an array of strings.");
    } else {
      pack.stopwords.forEach((w: any, idx: number) => {
        if (typeof w !== "string") errors.push(`stopwords[${idx}] must be a string.`);
      });
      detectDuplicates("stopwords", pack.stopwords, warnings);

      // Check cross-reference consistency: stopword in protected_words
      if (pack.stemmer?.protected_words) {
        const protectedSet = new Set(pack.stemmer.protected_words);
        pack.stopwords.forEach((w: string) => {
          if (protectedSet.has(w)) {
            warnings.push(`Word '${w}' is defined in both stopwords and stemmer.protected_words.`);
          }
        });
      }
    }
  }

  // 6. Transliteration Validation
  if (pack.transliteration) {
    if (typeof pack.transliteration !== "object") {
      errors.push("transliteration block must be an object.");
    } else {
      ["sera", "felig"].forEach((type) => {
        const block = pack.transliteration[type];
        if (block) {
          if (typeof block !== "object") {
            errors.push(`transliteration.${type} must be an object.`);
          } else {
            if (typeof block.scheme !== "string") {
              errors.push(`transliteration.${type}.scheme must be a string.`);
            }
            if (block.map && typeof block.map !== "object") {
              errors.push(`transliteration.${type}.map must be an object.`);
            } else if (block.map) {
              validateMapObject(`transliteration.${type}.map`, block.map, errors);
            }
          }
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateMapObject(name: string, obj: Record<string, any>, errors: string[]) {
  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val !== "string") {
      errors.push(`${name}['${key}'] must map to a string value.`);
    }
  });
}

function detectMapCycles(name: string, obj: Record<string, string>, errors: string[]) {
  for (const startKey of Object.keys(obj)) {
    let current = startKey;
    const visited = new Set<string>();
    const path: string[] = [];
    while (current in obj) {
      if (visited.has(current)) {
        errors.push(`Cyclic mapping path detected in ${name}: ${path.join(" -> ")} -> ${current}`);
        break;
      }
      visited.add(current);
      path.push(current);
      current = obj[current];
    }
  }
}

function detectDuplicates(name: string, arr: any[], warnings: string[]) {
  const seen = new Set<any>();
  arr.forEach((item) => {
    if (seen.has(item)) {
      warnings.push(`Duplicate item '${item}' found in ${name}.`);
    }
    seen.add(item);
  });
}

/**
 * Automatically fixes common warnings and minor consistency issues in a language pack.
 *
 * @param pack The language pack object to fix.
 * @returns An object containing the fixed pack and the count of fixed items.
 */
export function fixPack(pack: any): { fixedPack: any; fixedCount: number } {
  let fixedCount = 0;
  if (!pack || typeof pack !== "object") {
    return { fixedPack: pack, fixedCount };
  }

  // 1. Deduplicate stemmer.prefixes
  if (pack.stemmer?.prefixes && Array.isArray(pack.stemmer.prefixes)) {
    const origLength = pack.stemmer.prefixes.length;
    pack.stemmer.prefixes = Array.from(new Set(pack.stemmer.prefixes));
    if (pack.stemmer.prefixes.length < origLength) {
      fixedCount += origLength - pack.stemmer.prefixes.length;
    }
  }

  // 2. Deduplicate stemmer.suffixes
  if (pack.stemmer?.suffixes && Array.isArray(pack.stemmer.suffixes)) {
    const origLength = pack.stemmer.suffixes.length;
    pack.stemmer.suffixes = Array.from(new Set(pack.stemmer.suffixes));
    if (pack.stemmer.suffixes.length < origLength) {
      fixedCount += origLength - pack.stemmer.suffixes.length;
    }
  }

  // 3. Deduplicate stemmer.protected_words
  if (pack.stemmer?.protected_words && Array.isArray(pack.stemmer.protected_words)) {
    const origLength = pack.stemmer.protected_words.length;
    pack.stemmer.protected_words = Array.from(new Set(pack.stemmer.protected_words));
    if (pack.stemmer.protected_words.length < origLength) {
      fixedCount += origLength - pack.stemmer.protected_words.length;
    }
  }

  // 4. Deduplicate stopwords
  if (pack.stopwords && Array.isArray(pack.stopwords)) {
    const origLength = pack.stopwords.length;
    pack.stopwords = Array.from(new Set(pack.stopwords));
    if (pack.stopwords.length < origLength) {
      fixedCount += origLength - pack.stopwords.length;
    }

    // 5. Remove stopwords that are also in protected_words
    if (pack.stemmer?.protected_words && Array.isArray(pack.stemmer.protected_words)) {
      const protectedSet = new Set(pack.stemmer.protected_words);
      const originalStopwordsLength = pack.stopwords.length;
      pack.stopwords = pack.stopwords.filter((w: string) => !protectedSet.has(w));
      if (pack.stopwords.length < originalStopwordsLength) {
        fixedCount += originalStopwordsLength - pack.stopwords.length;
      }
    }
  }

  return { fixedPack: pack, fixedCount };
}
