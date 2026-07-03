"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import GeezCharMap from "@/components/GeezCharMap";
import { Keyboard, ArrowRightLeft, RefreshCw } from "lucide-react";

export default function TransliteratePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ሰላም ጤና ይስጥልኝ።");
  const [result, setResult] = useState("");
  const [direction, setDirection] = useState<"to-sera" | "to-geez">("to-sera");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const runTransliteration = async (inputVal: string, dir: "to-sera" | "to-geez") => {
    if (!inputVal.trim()) {
      setResult("");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/transliterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputVal, direction: dir }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError(err.message || "Transliteration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runTransliteration(text, direction);
      }, 450);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, direction, mode]);

  const toggleDirection = () => {
    const newDir = direction === "to-sera" ? "to-geez" : "to-sera";
    setDirection(newDir);
    setText(result || "");
    setResult(text);
  };

  const codeSnippet = `// Transliteration Compiler Integration
const res = await fetch('/api/transliterate', {
  method: 'POST',
  body: JSON.stringify({
    text: "selam",
    direction: "to-geez"
  })
});
const { result } = await res.json();
console.log(result); // Outputs "ሰላም"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Orthographic Transliteration Engine
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Convert Ge&apos;ez script dynamically into Latin SERA phonetics and vice-versa.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Workspace ({direction === "to-sera" ? "Ge'ez" : "SERA"})
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type script here..."
                />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-955/60 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <button
                  onClick={toggleDirection}
                  className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
                  title="Toggle translation direction"
                >
                  <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => runTransliteration(text, direction)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer font-mono"
                >
                  Transliterate
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Result Output Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-955 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Transliterated Output ({direction === "to-sera" ? "SERA" : "Ge'ez"})
                </span>
              </div>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-md text-red-500 text-xs font-semibold">
                    {error}
                  </div>
                )}
                <div className="p-4 bg-zinc-100/50 dark:bg-zinc-955 rounded-lg text-zinc-800 dark:text-zinc-300 font-bold select-all leading-relaxed font-sans min-h-[120px]">
                  {result || "-"}
                </div>
              </div>
            </div>

            {/* Matrix chart helper component */}
            <div className="premium-card p-6 space-y-4">
              <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                Interactive Ge&apos;ez Matrix lookup
              </span>
              <GeezCharMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
