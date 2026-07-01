"use client";

import React, { useState, useEffect, useRef } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import DiffHighlighter from "@/components/DiffHighlighter";
import { Type, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

export default function InputPage() {
  const [rawText, setRawText] = useState("ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ወደ ት/ቤት ሄደ።");
  const [normalizedText, setNormalizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performNormalization = async (textToNormalize: string) => {
    if (!textToNormalize.trim()) {
      setNormalizedText("");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToNormalize }),
      });
      const data = await response.json();
      if (!data.error) {
        setNormalizedText(data.result);
      }
    } catch (err) {
      console.error("Normalization failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performNormalization(rawText);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawText]);

  const insertSample = (sample: string) => {
    setRawText(sample);
  };

  const codeSnippet = `// Live Input Handler Example
const handleInputChange = async (val: string) => {
  const res = await fetch('/api/normalize', {
    method: 'POST',
    body: JSON.stringify({ text: val })
  });
  const { result } = await res.json();
  
  // Save result to DB as standard normalized string
  saveToDatabase(result);
};`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Smart Amharic Text Input & Spell-check
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          This module acts as a live &quot;spellcheck compiler&quot; that collapses spelling
          inconsistencies as the user types. This ensures uniform database indexing across spelling
          homophones.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Text Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                  Interactive Text Input
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Start typing Amharic text here..."
                  className="w-full h-[180px] bg-transparent border-0 outline-none focus:outline-none ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed resize-none overflow-y-auto"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">
                Sample Inputs to Test
              </span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => insertSample("ሀኪሙ ሃይሉ ሐኪም ኀይሉ")}
                  className="text-left px-3.5 py-2 text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-450 font-mono text-zinc-700 dark:text-zinc-400 transition-all cursor-pointer"
                >
                  ሀኪሙ ሃይሉ ሐኪም ኀይሉ &rarr; Canonical
                </button>
                <button
                  onClick={() => insertSample("መጽሐፍ ቅዱስን ማንበብ ደስ ይላልልል")}
                  className="text-left px-3.5 py-2 text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-450 font-mono text-zinc-700 dark:text-zinc-400 transition-all cursor-pointer"
                >
                  መጽሐፍ ቅዱስን ማንበብ ደስ ይላልልል &rarr; Trim repeated
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <CodeSnippet title="Input Component Integration Code" code={codeSnippet} />
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Normalized Output Box */}
            <div className="premium-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200">
                  Normalized Equivalent (Database Representation)
                </h4>
              </div>
              <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-150 dark:border-zinc-900 min-h-[60px] break-all leading-relaxed select-all">
                {normalizedText || (
                  <span className="text-zinc-450 font-semibold italic">Waiting for input...</span>
                )}
              </p>
            </div>

            {/* Diffs visualization */}
            {normalizedText && <DiffHighlighter original={rawText} modified={normalizedText} />}

            <div className="block lg:hidden">
              <CodeSnippet title="Input Component Integration Code" code={codeSnippet} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
