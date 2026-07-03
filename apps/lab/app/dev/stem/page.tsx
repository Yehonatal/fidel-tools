"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { Compass, RefreshCw } from "lucide-react";

export default function StemPage() {
  const { mode } = useLabMode();
  const [inputText, setInputText] = useState("ልጆች ቤቶቻቸውን ትምህርታቸውን እና ነገሮችን ይወዳሉ።");
  const [stemmedList, setStemmedList] = useState<Array<{ word: string; stem: string }>>([]);
  const [loading, setLoading] = useState(false);

  const runStem = async (textToStem: string) => {
    if (!textToStem.trim()) return;
    setLoading(true);
    try {
      const wordsArray = textToStem.split(/\s+/).filter(Boolean);
      const response = await fetch("/api/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: wordsArray }),
      });
      const data = await response.json();
      if (!data.error && data.stems) {
        const mapped = wordsArray.map((w, idx) => ({
          word: w,
          stem: data.stems[idx]?.stem || w,
        }));
        setStemmedList(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runStem(inputText);
    }
  }, [mode]);

  const codeSnippet = `// Light Stemmer integration snippet
const res = await fetch('/api/stem', {
  method: 'POST',
  body: JSON.stringify({
    words: ["ልጆቻችን", "ቤቶቻቸውን"]
  })
});
const { stems } = await res.json();
// Output: [{ word: "ልጆቻችን", stem: "ልጅ" }, ...]`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Morphological Light Stemmer
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Strip prefixes and suffixes from Amharic words to return their base canonical stem.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Corpus Text
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type inflected sentences..."
                />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-955/60 border-t border-zinc-200 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={() => runStem(inputText)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer font-mono"
                >
                  Analyze stems
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Stems Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card overflow-hidden">
              <table className="w-full border-collapse text-left font-sans text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-955 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider font-mono">
                    <th className="px-6 py-3">Inflected Source Word</th>
                    <th className="px-6 py-3">Canonical Base Stem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 font-medium">
                  {stemmedList.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300">
                      <td className="px-6 py-3.5 font-bold font-sans">{item.word}</td>
                      <td className="px-6 py-3.5 text-blue-600 dark:text-sky-400 font-bold font-sans">{item.stem}</td>
                    </tr>
                  ))}
                  {stemmedList.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-zinc-450 font-mono">
                        No stems computed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
