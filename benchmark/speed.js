import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pipeline, normalize as jsNormalize } from "../packages/core/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const amPackPath = path.resolve(__dirname, "../packages/lang-am/am.json");
const amPack = JSON.parse(fs.readFileSync(amPackPath, "utf8"));

const pipeline = new Pipeline(amPack);

const baseSentences = [
  "ሐኪም ኀይሉ ሄደ።",
  "ልጁ በልቷል ሟች ቤተሰብም አለ።",
  "እባክህህህህ በጣምምምምም አመሰግናለሁህህህ።",
  "አዲስ አበባ ትልቅ ከተማ ናት።",
  "አንድ ሁለት ሦስት አራት አምስት",
  "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!",
];

// Payload generation
const shortPayload = baseSentences[0]; // ~10 chars

const mediumParts = [];
for (let i = 0; i < 10; i++) {
  mediumParts.push(baseSentences[i % baseSentences.length]);
}
const mediumPayload = mediumParts.join(" "); // ~150-200 chars

const largeParts = [];
for (let i = 0; i < 100; i++) {
  largeParts.push(baseSentences[i % baseSentences.length]);
}
const largePayload = largeParts.join(" "); // ~1500-2000 chars

function runSuite(label, payload, iterations) {
  // Warmup
  for (let i = 0; i < 500; i++) {
    jsNormalize(payload, amPack);
    pipeline.normalize(payload);
  }

  // JS Run
  const jsLatencies = [];
  const jsStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    jsNormalize(payload, amPack);
    const t1 = performance.now();
    jsLatencies.push((t1 - t0) * 1000); // convert to microseconds
  }
  const jsEnd = performance.now();
  const jsTotalTime = jsEnd - jsStart;
  const jsThroughput = (iterations / jsTotalTime) * 1000;

  // WASM Run
  const wasmLatencies = [];
  const wasmStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    pipeline.normalize(payload);
    const t1 = performance.now();
    wasmLatencies.push((t1 - t0) * 1000); // convert to microseconds
  }
  const wasmEnd = performance.now();
  const wasmTotalTime = wasmEnd - wasmStart;
  const wasmThroughput = (iterations / wasmTotalTime) * 1000;

  // Sort latencies to compute percentiles
  jsLatencies.sort((a, b) => a - b);
  wasmLatencies.sort((a, b) => a - b);

  const getPercentile = (arr, pct) => {
    const index = Math.floor((pct / 100) * arr.length);
    return arr[Math.min(index, arr.length - 1)];
  };

  const jsP50 = getPercentile(jsLatencies, 50);
  const jsP95 = getPercentile(jsLatencies, 95);
  const jsP99 = getPercentile(jsLatencies, 99);

  const wasmP50 = getPercentile(wasmLatencies, 50);
  const wasmP95 = getPercentile(wasmLatencies, 95);
  const wasmP99 = getPercentile(wasmLatencies, 99);

  const speedup = jsTotalTime / wasmTotalTime;

  console.log(`\n--- Speed Benchmark: ${label} (${iterations} iterations) ---`);
  console.log(
    `  JS:   Throughput: ${jsThroughput.toFixed(0)} ops/sec | p50: ${jsP50.toFixed(2)} μs | p95: ${jsP95.toFixed(2)} μs | p99: ${jsP99.toFixed(2)} μs`,
  );
  console.log(
    `  WASM: Throughput: ${wasmThroughput.toFixed(0)} ops/sec | p50: ${wasmP50.toFixed(2)} μs | p95: ${wasmP95.toFixed(2)} μs | p99: ${wasmP99.toFixed(2)} μs`,
  );
  console.log(`  Speedup Factor: ${speedup.toFixed(2)}x`);

  return {
    label,
    iterations,
    js: { throughput: jsThroughput, p50: jsP50, p95: jsP95, p99: jsP99 },
    wasm: { throughput: wasmThroughput, p50: wasmP50, p95: wasmP95, p99: wasmP99 },
    speedup,
  };
}

console.log("Running speed benchmarks...");
const shortResults = runSuite("Short Payload (~15 chars)", shortPayload, 10000);
const mediumResults = runSuite("Medium Payload (~200 chars)", mediumPayload, 5000);
const largeResults = runSuite("Large Payload (~2000 chars)", largePayload, 1000);

const resultsFile = path.resolve(__dirname, "speed_results.json");
fs.writeFileSync(
  resultsFile,
  JSON.stringify(
    {
      short: shortResults,
      medium: mediumResults,
      large: largeResults,
    },
    null,
    2,
  ),
);
