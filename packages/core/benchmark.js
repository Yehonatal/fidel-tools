import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pipeline } from "./dist/pipeline.js";
import { normalize as jsNormalize } from "./dist/normalizer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const amPackPath = path.resolve(__dirname, "../lang-am/am.json");
const amPack = JSON.parse(fs.readFileSync(amPackPath, "utf8"));

// Initialize pipeline
const pipeline = new Pipeline(amPack);

const baseSentences = [
  "ሐኪም ኀይሉ ሄደ።",
  "ልጁ በልቷል ሟች ቤተሰብም አለ።",
  "እባክህህህህ በጣምምምምም አመሰግናለሁህህህ።",
  "አዲስ አበባ ትልቅ ከተማ ናት።",
  "አንድ ሁለት ሦስት አራት አምስት",
  "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!",
];

// Generate different test corpora sizes
function runBenchmark(label, corpus) {
  const size = corpus.length;

  // Warm up
  for (let i = 0; i < Math.min(size, 200); i++) {
    jsNormalize(corpus[i], amPack);
    pipeline.normalize(corpus[i]);
  }

  // JS Benchmark
  const jsStart = performance.now();
  for (let i = 0; i < size; i++) {
    jsNormalize(corpus[i], amPack);
  }
  const jsEnd = performance.now();
  const jsDuration = jsEnd - jsStart;
  const jsOpsPerSec = (size / jsDuration) * 1000;

  // WASM Benchmark
  const wasmStart = performance.now();
  for (let i = 0; i < size; i++) {
    pipeline.normalize(corpus[i]);
  }
  const wasmEnd = performance.now();
  const wasmDuration = wasmEnd - wasmStart;
  const wasmOpsPerSec = (size / wasmDuration) * 1000;

  const speedup = jsDuration / wasmDuration;

  console.log(`\n--- ${label} (${size} items) ---`);
  console.log(
    `  JS Time  : ${jsDuration.toFixed(2)} ms (${((jsDuration / size) * 1000).toFixed(2)} μs/op, ${jsOpsPerSec.toFixed(0)} ops/s)`,
  );
  console.log(
    `  WASM Time: ${wasmDuration.toFixed(2)} ms (${((wasmDuration / size) * 1000).toFixed(2)} μs/op, ${wasmOpsPerSec.toFixed(0)} ops/s)`,
  );
  console.log(`  Speedup  : ${speedup.toFixed(2)}x`);
}

// 1. Short sentences corpus (5,000 items)
const shortCorpus = [];
for (let i = 0; i < 5000; i++) {
  shortCorpus.push(baseSentences[i % baseSentences.length]);
}

// 2. Medium paragraphs corpus (1,000 items, each combining 10 base sentences)
const mediumCorpus = [];
for (let i = 0; i < 1000; i++) {
  const paragraphParts = [];
  for (let j = 0; j < 10; j++) {
    paragraphParts.push(baseSentences[(i * 10 + j) % baseSentences.length]);
  }
  mediumCorpus.push(paragraphParts.join(" "));
}

// 3. Large documents corpus (200 items, each combining 100 base sentences)
const largeCorpus = [];
for (let i = 0; i < 200; i++) {
  const docParts = [];
  for (let j = 0; j < 100; j++) {
    docParts.push(baseSentences[(i * 100 + j) % baseSentences.length]);
  }
  largeCorpus.push(docParts.join(" "));
}

console.log(`==================================================`);
console.log(`FIDEL TOOLS NORMALIZER PERFORMANCE BENCHMARK (MULTI-SCALE)`);
console.log(`==================================================`);

runBenchmark("Short Sentences (~10 chars)", shortCorpus);
runBenchmark("Medium Paragraphs (~150 chars)", mediumCorpus);
runBenchmark("Large Documents (~1500 chars)", largeCorpus);

console.log(`==================================================\n`);
