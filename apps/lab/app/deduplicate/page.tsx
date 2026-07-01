"use client";

import React, { useState, useEffect } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import SimilarityMeter from "@/components/SimilarityMeter";
import TokenBadge from "@/components/TokenBadge";
import { CopyCheck, ArrowRight, AlertTriangle } from "lucide-react";

export default function DeduplicatePage() {
  const [textA, setTextA] = useState("ሐኪሙ ትናንትና ማታ ወደ አዲስ አበባ ሄዶ ነበረ። እዚያም ብዙ ልጆችን አይቷል።");
  const [textB, setTextB] = useState("ሀኪሙ ትላንት ማታ ወደ አ.አ ሄዶ ነበር። በቦታውም በርካታ ልጅ አይቶአል።");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const compareTexts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textA, textB }),
      });
      const resData = await response.json();
      if (resData.error) {
        setError(resData.error);
      } else {
        setData(resData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to call comparison endpoint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    compareTexts();
  }, []);

  const codeSnippet = `import { getStems, jaccardSimilarity } from './similarity'

const stemsA = getStems(textA)
const stemsB = getStems(textB)

const score = jaccardSimilarity(
  new Set(stemsA),
  new Set(stemsB)
)`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <CopyCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Similarity & Deduplication Checker
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Before normalization, `ሐኪሙ` and `ሀኪሙ` look like different strings. After stemming and
          abbreviation expansion, they resolve to the same stems. This checker calculates semantic
          Jaccard similarity.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Text A */}
              <div className="premium-card flex flex-col overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Document A
                  </span>
                </div>
                <div className="p-4 flex-grow">
                  <textarea
                    value={textA}
                    onChange={(e) => setTextA(e.target.value)}
                    className="w-full h-[180px] bg-transparent border-0 outline-none focus:outline-none ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed resize-none overflow-y-auto"
                    placeholder="Type first Amharic text..."
                  />
                </div>
              </div>

              {/* Text B */}
              <div className="premium-card flex flex-col overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Document B
                  </span>
                </div>
                <div className="p-4 flex-grow">
                  <textarea
                    value={textB}
                    onChange={(e) => setTextB(e.target.value)}
                    className="w-full h-[180px] bg-transparent border-0 outline-none focus:outline-none ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-805 dark:text-zinc-200 leading-relaxed resize-none overflow-y-auto"
                    placeholder="Type second Amharic text..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={compareTexts}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-sans py-2 px-5 rounded-md text-xs font-bold tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                {loading ? "Comparing..." : "Compare Stems"}
              </button>
            </div>

            {/* Stems Categorization Grid */}
            {data && (
              <div className="space-y-6">
                {/* Intersection */}
                <div className="premium-card p-5 space-y-3.5">
                  <span className="text-[9px] font-bold text-emerald-505 dark:text-emerald-400 uppercase tracking-wider font-mono block">
                    Shared Stems (Intersection)
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {data.intersection.length > 0 ? (
                      data.intersection.map((stem: string) => (
                        <TokenBadge key={stem} token={stem} type="highlight" />
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">
                        No overlapping stems found.
                      </span>
                    )}
                  </div>
                </div>

                {/* Symmetric differences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Unique A */}
                  <div className="premium-card p-5 space-y-3.5">
                    <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono block">
                      Unique to A
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {data.uniqueA.length > 0 ? (
                        data.uniqueA.map((stem: string) => (
                          <TokenBadge key={stem} token={stem} type="normal" />
                        ))
                      ) : (
                        <span className="text-xs text-zinc-455 italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Unique B */}
                  <div className="premium-card p-5 space-y-3.5">
                    <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider font-mono block">
                      Unique to B
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {data.uniqueB.length > 0 ? (
                        data.uniqueB.map((stem: string) => (
                          <TokenBadge key={stem} token={stem} type="normal" />
                        ))
                      ) : (
                        <span className="text-xs text-zinc-455 italic">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Gauge + Code */}
          <div className="lg:col-span-1 space-y-6">
            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {data && <SimilarityMeter score={data.similarity} />}

            <CodeSnippet title="Similarity Score Code" code={codeSnippet} />
          </div>
        </div>
      </div>
    </div>
  );
}
