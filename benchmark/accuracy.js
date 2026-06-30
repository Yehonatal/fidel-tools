import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pipeline, normalize, sentenceTokenize, stem } from '../packages/core/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const amPackPath = path.resolve(__dirname, '../packages/lang-am/am.json');
const amPack = JSON.parse(fs.readFileSync(amPackPath, 'utf8'));

const pipeline = new Pipeline(amPack);

// Helper to read JSONL
function readJsonl(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return fileContent
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

function evaluateNormalization() {
  console.log('Evaluating Normalization Accuracy...');
  const corpusPath = path.resolve(__dirname, 'corpus/normalization.jsonl');
  const dataset = readJsonl(corpusPath);
  
  let jsMatches = 0;
  let wasmMatches = 0;
  const total = dataset.length;
  
  for (const { input, expected } of dataset) {
    const jsResult = normalize(input, amPack);
    const wasmResult = pipeline.normalize(input);
    
    if (jsResult === expected) jsMatches++;
    if (wasmResult === expected) wasmMatches++;
  }
  
  const jsAcc = (jsMatches / total) * 100;
  const wasmAcc = (wasmMatches / total) * 100;
  
  console.log(`  JS Normalizer Accuracy  : ${jsAcc.toFixed(2)}% (${jsMatches}/${total})`);
  console.log(`  WASM Normalizer Accuracy: ${wasmAcc.toFixed(2)}% (${wasmMatches}/${total})`);
  
  return { jsAcc, wasmAcc };
}

function evaluateStemming() {
  console.log('Evaluating Stemming Accuracy...');
  const corpusPath = path.resolve(__dirname, 'corpus/stemming.jsonl');
  const dataset = readJsonl(corpusPath);
  
  let matches = 0;
  const total = dataset.length;
  
  for (const { input, expected } of dataset) {
    const result = pipeline.stem(input);
    if (result === expected) {
      matches++;
    }
  }
  
  const acc = (matches / total) * 100;
  console.log(`  Stemmer Accuracy        : ${acc.toFixed(2)}% (${matches}/${total})`);
  return { acc };
}

function evaluateTokenization() {
  console.log('Evaluating Tokenization Accuracy...');
  const corpusPath = path.resolve(__dirname, 'corpus/tokenization.jsonl');
  const dataset = readJsonl(corpusPath);
  
  let exactMatches = 0;
  let totalTokenPairs = 0;
  let correctTokenPairs = 0;
  let generatedTokens = 0;
  
  const total = dataset.length;
  
  for (const { input, expected } of dataset) {
    const result = pipeline.sentenceTokenize(input);
    
    // Check exact array match
    const isExact = expected.length === result.length && expected.every((val, index) => val === result[index]);
    if (isExact) {
      exactMatches++;
    }
    
    // Boundary metrics calculation (token overlapping for Precision, Recall, F1)
    const expectedSet = new Set(expected);
    const resultSet = new Set(result);
    
    totalTokenPairs += expected.length;
    generatedTokens += result.length;
    
    for (const resToken of result) {
      if (expectedSet.has(resToken)) {
        correctTokenPairs++;
      }
    }
  }
  
  const exactAcc = (exactMatches / total) * 100;
  
  // NLP Precision, Recall, F1
  const precision = correctTokenPairs / (generatedTokens || 1);
  const recall = correctTokenPairs / (totalTokenPairs || 1);
  const f1 = (2 * precision * recall) / ((precision + recall) || 1) * 100;
  
  console.log(`  Tokenizer Exact Match   : ${exactAcc.toFixed(2)}% (${exactMatches}/${total})`);
  console.log(`  Tokenizer F1 Score      : ${f1.toFixed(2)}% (P: ${(precision * 100).toFixed(2)}%, R: ${(recall * 100).toFixed(2)}%)`);
  
  return { exactAcc, f1 };
}

const normResults = evaluateNormalization();
const stemResults = evaluateStemming();
const tokenResults = evaluateTokenization();

// Write results to JSON file for report consolidation
const resultsFile = path.resolve(__dirname, 'accuracy_results.json');
fs.writeFileSync(resultsFile, JSON.stringify({
  normalization: normResults,
  stemming: stemResults,
  tokenization: tokenResults
}, null, 2));
