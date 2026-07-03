"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BarChart3, RefreshCw } from "lucide-react";

export default function LexicalAnalyzePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ት/ቤት መሄድ ግዴታ ነው። አ.አ 2015 ዓ.ም ተመሰረተ። መ/ቤት ተዘጋ።");
  const [resultText, setResultText] = useState("");
  const [loading, setLoading] = useState(false);

  const runLexicalAnalyze = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/lexical-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setResultText(data.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runLexicalAnalyze(text);
    }
  }, [mode]);

  const codeSnippet = `// Lexical Abbreviation Expansion API Call
const res = await fetch('/api/lexical-analyze', {
  method: 'POST',
  body: JSON.stringify({ text: "ት/ቤት መሄድ ግዴታ ነው።" })
});
const { result } = await res.json();
console.log(result); // Outputs "ትምህርት ቤት መሄድ ግዴታ ነው።"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Lexical Analysis & Abbreviation Normalizer
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Spot and expand orthographic shorthand codes, acronyms, and sentence contractions.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Abbreviated Text
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type text with contractions..."
                />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-955/60 border-t border-zinc-200 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={() => runLexicalAnalyze(text)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer font-mono"
                >
                  Expand Text
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Results Comparison Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-955 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Expansion comparison
                </span>
              </div>
              <div className="p-6 space-y-6 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider mb-1">Before Normalization</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-955 rounded-lg text-zinc-800 dark:text-zinc-300 font-medium select-all leading-relaxed font-sans">
                    {text}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider mb-1">After Normalization</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-955 rounded-lg text-blue-600 dark:text-emerald-450 font-bold select-all leading-relaxed font-sans">
                    {resultText || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
