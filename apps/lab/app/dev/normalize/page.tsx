"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import DiffHighlighter from "@/components/DiffHighlighter";
import { Type, RefreshCw } from "lucide-react";

export default function NormalizePage() {
  const { mode } = useLabMode();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performNormalization(rawText);
      }, 450);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawText, mode]);

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
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          This module acts as a live &quot;spellcheck compiler&quot; that collapses spelling inconsistencies as the user types.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-wider font-mono">
                  Interactive Text Input
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type Amharic text here..."
                />
              </div>
            </div>

            <CodeSnippet title="Pipeline Execution Code" code={codeSnippet} />
          </div>

          {/* Diff Highlighter Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-wider font-mono">
                  Normalizer Diff Highlighting
                </span>
              </div>
              <div className="p-6">
                <DiffHighlighter original={rawText} modified={normalizedText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
