import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import babel from "@babel/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmPath = path.join(__dirname, "dist", "fidel_tools_core_native_bg.wasm");
const jsGluePath = path.join(__dirname, "dist", "fidel_tools_core_native.js");

if (!fs.existsSync(wasmPath)) {
  console.error(`WASM binary not found at ${wasmPath}. Make sure wasm-pack build succeeded.`);
  process.exit(1);
}

const wasmBuffer = fs.readFileSync(wasmPath);
const wasmBase64 = wasmBuffer.toString("base64");

const template = `import init, { initSync, WasmNormalizer } from './fidel_tools_core_native.js';

const wasmBase64 = "${wasmBase64}";

let wasmBytes = null;
function getWasmBytes() {
  if (!wasmBytes) {
    if (typeof Buffer !== 'undefined') {
      wasmBytes = Buffer.from(wasmBase64, 'base64');
    } else {
      const binaryString = atob(wasmBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      wasmBytes = bytes;
    }
  }
  return wasmBytes;
}

let initialized = false;
export function initNormalizer() {
  if (!initialized) {
    initSync({ module: getWasmBytes() });
    initialized = true;
  }
}

export { WasmNormalizer };
`;

// Write ESM version of inline loader
fs.writeFileSync(path.join(__dirname, "dist", "wasm_inline.js"), template);

// Compile generated ESM files to CommonJS using Babel
console.log("Compiling ES modules to CommonJS...");

let glueCode = fs.readFileSync(jsGluePath, "utf8");

// Prevent bundlers (like Webpack/Turbopack) from statically scanning and trying to resolve the missing .wasm asset
glueCode = glueCode.replace(
  /new URL\(['"]fidel_tools_core_native_bg\.wasm['"],\s*import\.meta\.url\)/g,
  "undefined",
);
fs.writeFileSync(jsGluePath, glueCode);

// Replace import.meta.url to prevent SyntaxError in CommonJS environment
let cjsGlueCode = glueCode.replace(/import\.meta\.url/g, "undefined");

const compiledGlue = babel.transformSync(cjsGlueCode, {
  plugins: ["@babel/plugin-transform-modules-commonjs"],
}).code;
fs.writeFileSync(path.join(__dirname, "dist", "fidel_tools_core_native.cjs"), compiledGlue);

const inlineCodeWithCjsImport = template.replace(
  "./fidel_tools_core_native.js",
  "./fidel_tools_core_native.cjs",
);
const compiledInline = babel.transformSync(inlineCodeWithCjsImport, {
  plugins: ["@babel/plugin-transform-modules-commonjs"],
}).code;
fs.writeFileSync(path.join(__dirname, "dist", "wasm_inline.cjs"), compiledInline);

// Write .d.ts declaration file
const dtsTemplate = `export * from './fidel_tools_core_native.js';
export function initNormalizer(): void;
`;
fs.writeFileSync(path.join(__dirname, "dist", "wasm_inline.d.ts"), dtsTemplate);

console.log("Successfully inlined WASM binary and generated both ESM and CommonJS bundles.");
