import { nlp } from "../lib/nlp";

const cases = [
  "ሀ ሃ ሐ ኀ ኃ",
  "ት/ቤት አ.አ ዓ.ም",
  "አዲስ አበባ 2015 ዓ.ም ።",
  "ኢትዮጵያ፣ ኤርትራ፣ ሶማሊያ፡ ሁሉም አፍሪካ ናቸው።",
  "ሰማይ ሰማያያ ሰማያያያያ",
  "አ",
  "",
  "   ",
  "። ፡ ! ?",
  "ሰው ልጅ ሰው ልጅ",
];

for (const input of cases) {
  console.log("\n─────────────────");
  console.log("INPUT:", JSON.stringify(input));
  try {
    const normalized = nlp.normalize(input);
    console.log("normalize:       ", normalized);

    const lexed = nlp.lexAnalyze(normalized);
    console.log("lexAnalyze:      ", lexed);

    const cleaned = nlp.removeStopwords(lexed);
    console.log("removeStopwords: ", cleaned);

    const stems = cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => nlp.stem(w));
    console.log("stems:           ", stems);

    const transliterated = nlp.feligTransliterate(cleaned, "am");
    console.log("transliterate:   ", transliterated);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
