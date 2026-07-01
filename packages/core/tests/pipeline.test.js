import { Pipeline } from "../dist/pipeline.js";
import { normalize } from "../dist/normalizer.js";
import { sentenceTokenize } from "../dist/sentence_tokenizer.js";
import fs from "fs";
import { resolve } from "path";

const amPack = JSON.parse(fs.readFileSync(resolve(__dirname, "../../lang-am/am.json"), "utf8"));

describe("Amharic Pipeline Normalizer & Tokenizer", () => {
  const pipeline = new Pipeline(amPack);

  test("normalizes characters using char_map", () => {
    // ሐ (U+1210) maps to ሀ (U+1208) in char_map
    // ኀ (U+1280) maps to ሀ (U+1208)
    const input = "ሐኪም ኀይሉ";
    const expected = "ሃኪም ሃይሉ";
    expect(normalize(input, amPack)).toBe(expected);
    expect(pipeline.normalize(input)).toBe(expected);
  });

  test("normalizes labialized characters", () => {
    // ቷ maps to ቱዋ
    // ሟ maps to ሙዋ
    const input = "በልቷል ሟች";
    const expected = "በልቱዋል ሙዋች";
    expect(normalize(input, amPack)).toBe(expected);
    expect(pipeline.normalize(input)).toBe(expected);
  });

  test("collapses gemination based on threshold", () => {
    // Repeated characters should be collapsed to threshold (2)
    const input = "እባክህህህህ በጣምምምምም";
    const expected = "እባክህህ በጣምም";
    expect(normalize(input, amPack)).toBe(expected);
    expect(pipeline.normalize(input)).toBe(expected);
  });

  test("tokenizes sentences based on sentence boundaries", () => {
    const input = "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!";
    const expected = ["ይህ የመጀመሪያው ዓረፍተ ነገር ነው", "ሁለተኛው ደግሞ ይከተላል", "ሦስተኛውም አለ"];
    expect(sentenceTokenize(input, amPack)).toEqual(expected);
    expect(pipeline.sentenceTokenize(input)).toEqual(expected);
  });
});
