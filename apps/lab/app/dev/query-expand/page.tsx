"use client";

import React, { useState, useEffect, useRef } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Maximize2, AlertTriangle, HelpCircle } from "lucide-react";

export default function QueryExpandPage() {
  const [word, setWord] = useState("ልጅ");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const expandQuery = async (inputWord: string) => {
    if (!inputWord.trim()) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?expand=${encodeURIComponent(inputWord)}`);
      const resData = await response.json();
      if (resData.error) {
        setError(resData.error);
      } else {
        setData(resData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch query expansion options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      expandQuery(word);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [word]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  const codeSnippet = `import amPack from '@fidel-tools/lang-am';
import { Pipeline } from '@fidel-tools/core';

const nlp = new Pipeline(amPack);
const baseStem = nlp.stem(nlp.normalize(searchWord));

// Locate dictionary entries that resolve to the same stem
const expansions = amPack.dictionary
  .map(entry => entry.word)
  .filter(candidate => {
    // verify stemmer collapses it back
    return nlp.stem(nlp.normalize(candidate)) === baseStem;
  });`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Maximize2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Search-Engine-Style Query Expander
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          See the stemmer&apos;s behavior transparently. By typing a word, this tool tests suffix
          endings against the stemmer, proving which grammar inflections collapse back to the same
          root for a search hit.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input area */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest block">
                Type Search Term
              </span>
              <input
                type="text"
                value={word}
                onChange={handleInputChange}
                placeholder="Type word (e.g. ልጅ, ሐኪም)..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:outline-none"
              />
              <p className="text-[10px] font-medium text-zinc-400 leading-normal">
                This triggers a search index dictionary audit to see all registered inflections that
                collapse down to the same grammatical stem root.
              </p>
            </div>

            <CodeSnippet title="Query Expansion Pipeline Code" code={codeSnippet} />
          </div>

          {/* Results Area */}
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
                <span>Expanding query space...</span>
              </div>
            ) : data ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Stem summary */}
                <div className="premium-card p-5 flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Resolved Stem Root
                    </span>
                    <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                      {data.stem || "None"}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8px] font-mono font-bold text-zinc-405 uppercase tracking-wider block">
                      Matched Variants count
                    </span>
                    <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-sky-450">
                      {data.expansions?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Variants cloud */}
                <div className="premium-card p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">
                      Search Index Equivalence class (Synset)
                    </span>
                  </div>

                  {data.expansions?.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {data.expansions.map((exp: string) => (
                        <TokenBadge
                          key={exp}
                          token={exp}
                          type={exp === word ? "highlight" : "normal"}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">
                      No alternative inflected spelling variants discovered in dictionary index.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
