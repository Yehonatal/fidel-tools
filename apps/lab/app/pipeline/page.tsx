"use client";

import React, { useState, useEffect } from "react";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import CodeSnippet from "@/components/CodeSnippet";
import { Layers, Play, AlertTriangle, RefreshCw } from "lucide-react";

const PRESETS = [
  { label: "Homophone Groups", text: "ሀ ሃ ሐ ኀ ኃ ሰ ሠ አ ዐ" },
  { label: "Abbreviations Expansion", text: "ት/ቤት አ.አ ዓ.ም" },
  { label: "Mixed Script & Numbers", text: "አዲስ አበባ 2015 ዓ.ም ።" },
  { label: "Punctuation Heavy", text: "ኢትዮጵያ፣ ኤርትራ፣ ሶማሊያ፡ ሁሉም አፍሪካ ናቸው።" },
  { label: "Suffix Gemination", text: "ሰማይ ሰማያያ ሰማያያያያ" },
  { label: "Word Self-Stemming", text: "ሰው ልጅ mouse-pad" },
];

export default function PipelinePage() {
  const [text, setText] = useState(
    "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
  );
  const [stages, setStages] = useState<string[]>([
    "normalize",
    "lexAnalyze",
    "removeStopwords",
    "stem",
    "transliterate",
  ]);
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async (inputText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, stages }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTrace(data.trace);
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact pipeline API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPipeline(text);
  }, []);

  const handlePresetSelect = (presetText: string) => {
    setText(presetText);
    runPipeline(presetText);
  };

  const codeSnippet = `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const text = "${text.replace(/"/g, '\\"').slice(0, 50)}...";

// 1. Collapse homophones
const normalized = nlp.normalize(text);

// 2. Expand abbreviations
const lexed = nlp.lexAnalyze(normalized);

// 3. Remove stopwords
const cleaned = nlp.removeStopwords(lexed);

// 4. Light stem (per word)
const stems = cleaned.split(' ').map(w => nlp.stem(w));

// 5. SERA Transliterate
const sera = nlp.feligTransliterate(cleaned, 'am');`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Core Pipeline Stage Runner
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Trace how Amharic text parses through each layer of the NLP compilation system
          sequentially: `normalize` &rarr; `lexAnalyze` &rarr; `removeStopwords` &rarr; `stem`
          &rarr; `transliterate`.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        {/* Regression pills */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-widest block">
            Edge Case Regression Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset.text)}
                className="px-3.5 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-650 dark:text-zinc-350 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-450 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main interface grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: input text & code */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Test Corpus Editor
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[200px] lg:h-[260px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Paste or type Amharic text..."
                />
                <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3.5 mt-3.5 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold">
                    {text.length} characters
                  </span>
                  <button
                    onClick={() => runPipeline(text)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold font-sans transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{loading ? "Running..." : "Compile Text"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <CodeSnippet title="Pipeline Execution Code" code={codeSnippet} />
            </div>
          </div>

          {/* Right column: visual trace timeline */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="border border-dashed border-zinc-200 dark:border-zinc-900 rounded-md p-16 flex flex-col items-center justify-center text-zinc-405 dark:text-zinc-555 font-mono text-xs gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing stage transitions...</span>
              </div>
            ) : (
              <PipelineVisualizer inputText={text} trace={trace} />
            )}

            <div className="block lg:hidden">
              <CodeSnippet title="Pipeline Execution Code" code={codeSnippet} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
