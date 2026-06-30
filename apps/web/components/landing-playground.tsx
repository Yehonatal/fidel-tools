"use client";

import { useState, useEffect } from "react";
import { Pipeline } from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am/am.json";
import {
  Check,
  Copy,
  ChevronDown,
  ArrowRight,
  Code2,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  Cpu,
  Zap
} from "lucide-react";

// Initialize local pipeline with imported Amharic pack
const nlp = new Pipeline(amPack as any);

const previewTabs = [
  { id: "pipeline", label: "Pipeline Analyzer", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "transliterator", label: "SERA Transliterator", icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: "stemmer", label: "Morphology Stemmer", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "stopword", label: "Stopwords Filter", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "lexical", label: "Lexical Normalizer", icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: "engine", label: "JS vs WASM Bench", icon: <Cpu className="w-3.5 h-3.5" /> },
] as const;

type TabId = typeof previewTabs[number]["id"];
type TransLang = "am" | "en";

export default function LandingPlayground() {
  const [inputText, setInputText] = useState(
    "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት"
  );
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [transLang, setTransLang] = useState<TransLang>("am");
  const [copied, setCopied] = useState(false);

  const [benchmarking, setBenchmarking] = useState(false);
  const [jsResult, setJsResult] = useState<{ time: number; ops: number } | null>(null);
  const [wasmResult, setWasmResult] = useState<{ time: number; ops: number } | null>(null);

  useEffect(() => {
    setJsResult(null);
    setWasmResult(null);
  }, [inputText]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<TabId, string> = {
    pipeline: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const corpus = "${inputText.slice(0, 30)}...";

const lexed = nlp.lexAnalyze(corpus);
const clean = nlp.removeStopwords(lexed);
const stems = clean.split(' ').map(w => nlp.stem(w));`,

    transliterator: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const word = "${transLang === "am" ? "ወንበር" : "wenber"}";

const result = nlp.feligTransliterate(word, "${transLang}");`,

    stemmer: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const stem = nlp.stem("ልጆቻቸውን"); // -> ልጅ`,

    stopword: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const clean = nlp.removeStopwords("እነሱ ወደ ትምህርት ቤት ሄዱ");`,

    lexical: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const normalized = nlp.lexAnalyze("ት/ቤት እና መስሪያ ቤት");
// -> "ትምህርት ቤት እና መስሪያ ቤት"`,

    engine: `// Transparent backend selection
import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

// Boots with WebAssembly normalizer if available,
// falling back to pure JS normalizer transparently.
const nlp = new Pipeline(amPack);
const normalized = nlp.normalize("ሐኪም ኀይሉ");`
  };

  const sanitize = (val: string) => val.replace(/[.\?"',/#!$%^&*;:፤።{}=\-_`~()]/g, "");

  const localJsNormalize = (text: string, pack: any): string => {
    if (!text) return "";
    if (!pack.normalization) return text;
    let normalized = text;
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
    
    const threshold = pack.normalization.gemination_threshold;
    if (threshold !== undefined && threshold > 0) {
      const regex = new RegExp(`([^\\s])\\1{${threshold},}`, 'g');
      normalized = normalized.replace(regex, (match, p1) => p1.repeat(threshold));
    }
    return normalized;
  };

  const runClientBenchmark = () => {
    if (benchmarking) return;
    setBenchmarking(true);
    setTimeout(() => {
      const runs = 2000;
      
      // Warm up
      for (let i = 0; i < 200; i++) {
        localJsNormalize(inputText, amPack);
        nlp.normalize(inputText);
      }
      
      // JS run
      const jsStart = performance.now();
      for (let i = 0; i < runs; i++) {
        localJsNormalize(inputText, amPack);
      }
      const jsEnd = performance.now();
      const jsTime = jsEnd - jsStart;
      
      // WASM run
      const wasmStart = performance.now();
      for (let i = 0; i < runs; i++) {
        nlp.normalize(inputText);
      }
      const wasmEnd = performance.now();
      const wasmTime = wasmEnd - wasmStart;
      
      setJsResult({
        time: jsTime / runs * 1000,
        ops: Math.round((runs / jsTime) * 1000)
      });
      
      setWasmResult({
        time: wasmTime / runs * 1000,
        ops: Math.round((runs / wasmTime) * 1000)
      });
      
      setBenchmarking(false);
    }, 100);
  };

  const renderActiveVisualizer = () => {
    const lexed = nlp.lexAnalyze(inputText);
    const cleaned = nlp.removeStopwords(lexed);
    const tokens = inputText.split(/\s+/).filter(Boolean);

    switch (activeTab) {
      case "pipeline": {
        const stems = cleaned
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => nlp.stem(word));
        return (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-900">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">1. Lexical Normalization</span>
              <span className="block text-xs text-slate-800 dark:text-zinc-200 truncate font-mono">{lexed}</span>
            </div>
            <div className="flex justify-center text-slate-350 dark:text-zinc-700"><ChevronDown size={14} /></div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-900">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">2. Stopword Filtering</span>
              <span className="block text-xs text-slate-800 dark:text-zinc-200 truncate font-mono">{cleaned}</span>
            </div>
            <div className="flex justify-center text-slate-355 dark:text-zinc-700"><ChevronDown size={14} /></div>
            <div className="p-3 rounded-lg bg-blue-500/5 dark:bg-sky-400/[0.02] border border-blue-500/10 dark:border-sky-400/10">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">3. Stemmed Morphologies</span>
              <div className="flex flex-wrap gap-1 mt-1.5 max-h-[70px] overflow-y-auto">
                {stems.map((s, i) => (
                  <span key={i} className="bg-slate-900 dark:bg-zinc-800 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-transparent">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case "transliterator": {
        const tr = nlp.feligTransliterate(inputText, transLang);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Direction:</span>
              <div className="flex bg-slate-100 dark:bg-zinc-950 p-0.5 rounded border border-slate-200 dark:border-zinc-900">
                <button
                  onClick={() => setTransLang("am")}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                    transLang === "am" ? "bg-white dark:bg-zinc-805 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  AM → ASCII
                </button>
                <button
                  onClick={() => setTransLang("en")}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                    transLang === "en" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  ASCII → AM
                </button>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-900/60 min-h-[140px] max-h-[160px] overflow-y-auto">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Transliterated Corpus</span>
              <p className="text-xs font-mono font-semibold text-slate-800 dark:text-sky-400 leading-relaxed break-all select-all">
                {tr}
              </p>
            </div>
          </div>
        );
      }
      case "stemmer": {
        const stemmed = tokens.map((word) => ({
          orig: word,
          stem: nlp.stem(word),
        }));
        return (
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-2">
              Lexeme Derivation mapping
            </div>
            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {stemmed.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-zinc-950/20 border border-slate-200/50 dark:border-zinc-900 text-[11px] font-mono">
                  <span className="text-slate-700 dark:text-zinc-400 truncate max-w-[120px]">{item.orig}</span>
                  <ArrowRight size={10} className="text-slate-400 dark:text-zinc-500" />
                  <span className="text-blue-600 dark:text-sky-400 font-bold text-right truncate max-w-[120px]">{item.stem}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "stopword": {
        const mapped = tokens.map((word) => {
          const clean = sanitize(word);
          const isStop = amPack.stopwords.includes(clean);
          return { word, isStop };
        });
        const stopCount = mapped.filter((w) => w.isStop).length;
        return (
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Filters: {stopCount} stopwords detected
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[190px] overflow-y-auto pr-1 align-content-start">
              {mapped.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 p-0.5 px-2 rounded font-mono text-[10px] font-semibold border ${
                    item.isStop
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {item.word}
                  <span className="text-[8px] opacity-60">{item.isStop ? "×" : "✓"}</span>
                </span>
              ))}
            </div>
          </div>
        );
      }
      case "lexical": {
        const abbs = tokens
          .map((word) => {
            const clean = sanitize(word);
            const expansion = (amPack.tokenization as any)?.exceptions?.[clean];
            return {
              orig: word,
              expanded: expansion ? expansion.join(" ") : null,
            };
          })
          .filter((item) => item.expanded !== null);
        return (
          <div className="space-y-3">
            <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Abbreviation Expansion
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {abbs.length > 0 ? (
                abbs.map((abbr, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-zinc-950/20 p-2 rounded border border-slate-200/60 dark:border-zinc-900">
                    <span className="text-slate-800 dark:text-zinc-200 font-semibold">{abbr.orig}</span>
                    <span className="text-slate-400 dark:text-zinc-600">&rarr;</span>
                    <span className="text-emerald-600 dark:text-sky-400 font-bold">{abbr.expanded}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500 font-mono italic p-4 text-center border border-dashed border-slate-200/60 dark:border-zinc-900 rounded">
                  No abbreviations detected in current test input.
                </div>
              )}
            </div>
          </div>
        );
      }
      case "engine": {
        const isWasmSupported = !!(nlp as any).wasmNormalizer;
        
        // Compute speedup ratio
        const speedup = jsResult && wasmResult ? jsResult.time / wasmResult.time : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                Hybrid Engine Comparison
              </span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isWasmSupported 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              }`}>
                {isWasmSupported ? "WASM CORE READY" : "JS FALLBACK ONLY"}
              </span>
            </div>

            {jsResult && wasmResult ? (
              <div className="space-y-4">
                {/* Latency / Speedup Banner */}
                <div className="p-3 rounded border border-blue-500/10 dark:border-sky-400/10 bg-blue-500/5 dark:bg-sky-400/[0.02] text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {speedup! > 1 
                        ? `WASM is ${speedup!.toFixed(2)}x faster!` 
                        : `JS is ${(1 / speedup!).toFixed(2)}x faster!`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-semibold leading-normal">
                    {speedup! > 1 
                      ? "The Rust WebAssembly core is bypassing JIT overhead, optimizing character loops in parallel."
                      : "JavaScript is faster on short strings due to the overhead of crossing the JS-WASM boundary."}
                  </p>
                </div>

                {/* Performance Bars */}
                <div className="space-y-3 font-mono text-[10px]">
                  {/* JS Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-zinc-400 font-bold">JavaScript Fallback</span>
                      <span className="text-slate-500 dark:text-zinc-500">
                        {jsResult.ops.toLocaleString()} ops/sec ({jsResult.time.toFixed(1)} μs/op)
                      </span>
                    </div>
                    <div className="h-2 rounded bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded transition-all duration-500"
                        style={{ width: `${Math.min(100, (jsResult.ops / Math.max(jsResult.ops, wasmResult.ops)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* WASM Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-zinc-450 font-bold">WebAssembly (Rust Core)</span>
                      <span className="text-slate-500 dark:text-zinc-500">
                        {wasmResult.ops.toLocaleString()} ops/sec ({wasmResult.time.toFixed(1)} μs/op)
                      </span>
                    </div>
                    <div className="h-2 rounded bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded transition-all duration-500"
                        style={{ width: `${Math.min(100, (wasmResult.ops / Math.max(jsResult.ops, wasmResult.ops)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recalculate Button */}
                <button
                  onClick={runClientBenchmark}
                  disabled={benchmarking}
                  className="w-full py-1.5 px-3 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center disabled:opacity-50"
                >
                  {benchmarking ? "Executing Benchmark..." : "Re-run Live Benchmark"}
                </button>
              </div>
            ) : benchmarking ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 border border-dashed border-slate-200 dark:border-zinc-900 rounded bg-slate-50/50 dark:bg-zinc-950/10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">
                  Running 2,000 normalization loops...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-zinc-900 rounded bg-slate-50/50 dark:bg-zinc-950/10 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Compare performance of pure JS regex rules vs native WebAssembly loops using your current input text.
                  </p>
                  <button
                    onClick={runClientBenchmark}
                    className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded bg-slate-900 text-white dark:bg-zinc-900 dark:text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-zinc-800 shadow-sm transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Live Benchmark</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[9px] font-mono leading-relaxed">
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-900/60 space-y-1">
                    <span className="font-bold text-blue-500">JS ENGINE</span>
                    <p className="text-slate-500 dark:text-zinc-500">
                      Boots instantly. High boundary crossing speed, but slower processing of loops and regexes.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-900/60 space-y-1">
                    <span className="font-bold text-emerald-500">RUST WASM ENGINE</span>
                    <p className="text-slate-500 dark:text-zinc-500">
                      Static compiled speed, memory-safe, zero GC impact. Ideal for larger texts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="border border-slate-200/60 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md shadow-sm overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[600px]">
      
      {/* Tab Switcher Left Navigation Column */}
      <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible shrink-0 scrollbar-none">
        <h3 className="hidden lg:block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2 px-2.5">
          NLP API Modules
        </h3>
        {previewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-left transition-all shrink-0 cursor-pointer text-xs font-bold ${
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-zinc-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/40"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main interactive area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Input Text Box */}
        <div className="flex-1 p-5 flex flex-col border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Live Input Corpus
            </span>
            <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
              {inputText.length} chars
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 min-h-[120px] bg-transparent border-none outline-none resize-none text-xs md:text-sm font-semibold text-slate-900 dark:text-zinc-300 leading-relaxed font-sans placeholder-slate-400"
            placeholder="Type Amharic text here..."
            spellCheck={false}
          />
          <div className="border-t border-slate-200/50 dark:border-zinc-900/80 pt-3 flex items-center justify-between shrink-0 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            <span>Lang Pack: am</span>
            <span>Stopwords: {amPack.stopwords.length} words</span>
          </div>
        </div>

        {/* Visualizer & Code Tabs */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top visualizer segment */}
          <div className="flex-1 p-5 border-b border-slate-200/50 dark:border-zinc-900 overflow-y-auto max-h-[320px] md:max-h-none">
            {renderActiveVisualizer()}
          </div>

          {/* Bottom Code Block section */}
          <div className="bg-[#0b0c10] p-4 font-mono text-[10px] text-zinc-400 relative overflow-hidden h-[180px] shrink-0">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
              <button
                onClick={() => copyCode(codeSnippets[activeTab])}
                className="p-1 px-2 rounded border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-[9px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-auto h-full leading-relaxed select-all scrollbar-thin">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}
