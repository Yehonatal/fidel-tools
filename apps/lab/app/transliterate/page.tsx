"use client";

import React, { useState, useEffect, useRef } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import GeezCharMap from "@/components/GeezCharMap";
import { Keyboard, ArrowRightLeft, AlertTriangle } from "lucide-react";

export default function TransliteratePage() {
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
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runTransliteration(text, direction);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, direction]);

  const toggleDirection = () => {
    const newDir = direction === "to-sera" ? "to-geez" : "to-sera";
    setDirection(newDir);
    // Swap contents
    setText(result || "");
    setResult(text);
  };

  const codeSnippet = `import { Pipeline } from '@fidel-tools/core'
import amPack from '@fidel-tools/lang-am'

const nlp = new Pipeline(amPack)

// 1. Ge'ez unicode to SERA ASCII
const sera = nlp.feligTransliterate("ሰላም", "am") // -> "selam"

// 2. SERA ASCII to Ge'ez unicode
const geez = nlp.feligTransliterate("selam", "en") // -> "ሰላም"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Ge&apos;ez ↔ SERA Phonetic Transliteration
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Convert Ge&apos;ez Unicode characters into their phonetic ASCII equivalents (SERA) and
          vice versa. This enables integration with legacy ASCII-only databases or SMS gateways.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Converter Panes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-3">
              <span className="text-[10px] font-mono font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-widest">
                Direction:{" "}
                {direction === "to-sera"
                  ? "Ge'ez Unicode ➔ SERA ASCII"
                  : "SERA ASCII ➔ Ge'ez Unicode"}
              </span>
              <button
                onClick={toggleDirection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-xs font-bold font-sans text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-blue-500 transition-colors shadow-xs active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Swap Direction</span>
              </button>
            </div>

            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Pane */}
              <div className="premium-card flex flex-col min-h-[180px] overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Input Content
                  </span>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full flex-grow bg-transparent border-0 outline-none focus:outline-none ring-0 focus:ring-0 text-sm md:text-base font-sans font-medium text-zinc-850 dark:text-zinc-150 leading-relaxed resize-none overflow-y-auto"
                    placeholder={direction === "to-sera" ? "ሀኪም..." : "selam..."}
                  />
                </div>
              </div>

              {/* Output Pane */}
              <div className="premium-card flex flex-col min-h-[180px] overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Transliteration Output
                  </span>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <div className="w-full flex-grow bg-transparent text-sm md:text-base font-mono font-extrabold text-blue-600 dark:text-sky-405 leading-relaxed break-all select-all overflow-y-auto max-h-[140px]">
                    {loading
                      ? "Translating..."
                      : result || (
                          <span className="text-zinc-400 font-semibold italic">Waiting...</span>
                        )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive grid */}
            <GeezCharMap />
          </div>

          {/* Code representation */}
          <div className="lg:col-span-1">
            <CodeSnippet title="SDK Transliteration Code" code={codeSnippet} />
          </div>
        </div>
      </div>
    </div>
  );
}
