import { nlp } from "../lib/nlp";

console.log("SMOKE TEST: Running initial Amharic normalization check...");
const input = "ሐኪሙ ኀይሉ በልቷልልል!";
const normalized = nlp.normalize(input);
console.log("Input: ", input);
console.log("Normalized: ", normalized);
const stem = nlp.stem(nlp.normalize("ሐኪሙ"));
console.log("Stemmed Root: ", stem);
if (stem === "ሀኪም") {
  console.log("SMOKE TEST: PASSED!");
} else {
  console.log("SMOKE TEST: FAILED!");
}
