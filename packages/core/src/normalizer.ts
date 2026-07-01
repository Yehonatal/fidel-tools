import type { LanguagePack } from "./types.js";

/**
 * Normalizes Amharic text by applying character mapping,
 * labialized sequence normalization, and gemination collapse.
 *
 * @param text The input string to normalize.
 * @param pack The language pack containing normalization configuration.
 * @returns The normalized string.
 */
export function normalize(text: string, pack: LanguagePack): string {
  if (!text) {
    return "";
  }

  if (!pack.normalization) {
    return text;
  }

  let normalized = text;

  // 1 & 2. Apply char_map and labialized_map in a single pass over characters
  const charMap = pack.normalization.char_map || {};
  const labializedMap = pack.normalization.labialized_map || {};

  if (Object.keys(charMap).length > 0 || Object.keys(labializedMap).length > 0) {
    const chars = normalized.split("");
    for (let i = 0; i < chars.length; i++) {
      let char = chars[i];
      if (charMap[char] !== undefined) {
        char = charMap[char];
      }
      if (labializedMap[char] !== undefined) {
        char = labializedMap[char];
      }
      chars[i] = char;
    }
    normalized = chars.join("");
  }

  // 3. Collapse gemination
  const threshold = pack.normalization.gemination_threshold;
  if (threshold !== undefined && threshold > 0) {
    const regex = new RegExp(`([^\\s])\\1{${threshold},}`, "g");
    normalized = normalized.replace(regex, (match, p1) => p1.repeat(threshold));
  }

  return normalized;
}

export default normalize;
