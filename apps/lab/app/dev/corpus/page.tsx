"use client";

import React, { useState, useEffect } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import { FolderArchive, AlertTriangle, RefreshCw } from "lucide-react";

const BATCH_1 = [
  {
    id: "doc-1.txt",
    content: "የገንዘብ ሚኒስቴር ምክር ቤት ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ አዋጅ አዘጋጀ።",
  },
  {
    id: "doc-2.txt",
    content: "ሚኒስቴሩ በታክስ ማሻሻያው አማካኝነት የሀገር ውስጥ ገቢን ለማሳደግ እና የታክስ አስተዳደር ሥርዓቱን ዘመናዊ ለማድረግ ያለማል።",
  },
  {
    id: "doc-3.txt",
    content: "አዲሱ ረቂቅ አዋጅ ለምክር ቤቱ ቀርቦ ውይይት እንደሚደረግበትና የሕዝብ አስተያየት እንደሚሰበሰብበት ታውቋል።",
  },
  {
    id: "doc-4.txt",
    content: "ትምህርት ቤቶችና ሌሎች የልማት ተቋማት ከተጨማሪ ታክስ ነፃ እንዲሆኑ ማሻሻያው ላይ ተገልጿል።",
  },
];

const BATCH_2 = [
  {
    id: "doc-1.txt",
    content: "የአማርኛ ቋንቋ የሰዋስው ጥናት እጅግ ውስብስብና በርካታ ቅጥያዎችን የያዘ ነው።",
  },
  {
    id: "doc-2.txt",
    content: "በቋንቋው ላይ የሚደረጉ የምርምር ሥራዎች የኮምፒውተር ፕሮግራሞችን ለመሥራት ወሳኝ ሚና ይጫወታሉ።",
  },
];

export default function CorpusPage() {
  const [docs, setDocs] = useState<Array<{ id: string; content: string }>>(BATCH_1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [invertedIndex, setInvertedIndex] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchWord, setSearchWord] = useState("");

  const indexCorpus = async (corpusDocs: Array<{ id: string; content: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/corpus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: corpusDocs }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStats(data.stats);
        setInvertedIndex(data.invertedIndex);
      }
    } catch (err: any) {
      setError(err.message || "Failed to index corpus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    indexCorpus(docs);
  }, [docs]);

  const loadBatch = (batchNum: number) => {
    if (batchNum === 1) {
      setDocs(BATCH_1);
    } else {
      setDocs(BATCH_2);
    }
  };

  const filteredStems = invertedIndex
    ? Object.keys(invertedIndex).filter((stem) =>
        stem.toLowerCase().includes(searchWord.toLowerCase()),
      )
    : [];

  const codeSnippet = `// Corpus Batch Inverted Indexer
const invertedIndex = {};

documents.forEach(doc => {
  const normalized = nlp.normalize(doc.content);
  const lexed = nlp.lexAnalyze(normalized);
  const cleaned = nlp.removeStopwords(lexed);
  const tokens = cleaned.split(' ');
  
  tokens.forEach(w => {
    const stem = nlp.stem(w);
    if (!invertedIndex[stem]) invertedIndex[stem] = [];
    
    const entry = invertedIndex[stem].find(e => e.id === doc.id);
    if (entry) entry.count++;
    else invertedIndex[stem].push({ id: doc.id, count: 1 });
  });
});`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <FolderArchive className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Corpus Indexer & Scale Tester
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Index document batches simultaneously. This module processes multi-file corpus sets,
          measures execution latencies, registers vocabulary growth, and exports inverted index
          mappings.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Batch Configurations */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">
                Manage Corpus Batch
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadBatch(1)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all active:scale-95 ${
                    docs === BATCH_1
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-black"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-405"
                  }`}
                >
                  Batch 1 (News Tax)
                </button>
                <button
                  onClick={() => loadBatch(2)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all active:scale-95 ${
                    docs === BATCH_2
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-black"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-405"
                  }`}
                >
                  Batch 2 (Language)
                </button>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {docs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg"
                  >
                    <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase">
                      {doc.id}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans mt-1">
                      {doc.content}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => indexCorpus(docs)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                Force Re-index Batch
              </button>
            </div>

            <CodeSnippet title="Inverted Index Implementation" code={codeSnippet} />
          </div>

          {/* Index Metrics & Inverted Index Trace */}
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
                <span>Performing batch indexing and profiling...</span>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Performance Metrics cards - Made responsive */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Indexed Files
                    </span>
                    <span className="text-lg font-mono font-extrabold text-zinc-900 dark:text-white mt-1 block">
                      {stats.totalDocuments}
                    </span>
                  </div>
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Total Stems
                    </span>
                    <span className="text-lg font-mono font-extrabold text-zinc-900 dark:text-white mt-1 block">
                      {stats.uniqueStemsCount}
                    </span>
                  </div>
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Tokens Processed
                    </span>
                    <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-sky-405 mt-1 block">
                      {stats.totalTokensProcessed}
                    </span>
                  </div>
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Execution Time
                    </span>
                    <span className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                      {stats.processingTimeMs} ms
                    </span>
                  </div>
                </div>

                {/* Searchable Inverted Index Display */}
                {invertedIndex && (
                  <div className="premium-card p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-900 pb-3">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">
                        Inverted Index Vocabulary Map
                      </span>
                      <input
                        type="text"
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        placeholder="Filter vocabulary stems..."
                        className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-900 rounded-lg bg-transparent text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none"
                      />
                    </div>

                    <div className="max-h-[360px] overflow-y-auto pr-1 divide-y divide-zinc-100 dark:divide-zinc-900">
                      {filteredStems.map((stem) => (
                        <div
                          key={stem}
                          className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
                        >
                          <span className="font-bold text-blue-600 dark:text-sky-400 text-sm">
                            {stem}
                          </span>
                          <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                            {invertedIndex[stem].map((occ: any, i: number) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 border border-zinc-150 dark:border-zinc-850 rounded-md bg-zinc-50 dark:bg-zinc-950 font-bold"
                              >
                                {occ.id} ({occ.count}x)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unstemmed words (regression checks) */}
                {stats.unreducedTokens?.length > 0 && (
                  <div className="premium-card p-5 space-y-3">
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider font-mono mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Unreduced Word Tokens (Vocabulary Coverage Review)</span>
                    </span>
                    <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                      The stemmer left the following tokens unmodified (often correct for unique
                      nouns/root verbs, but useful for dictionary auditing):
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 max-h-[160px] overflow-y-auto">
                      {stats.unreducedTokens.map((tok: string) => (
                        <span
                          key={tok}
                          className="px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-950 text-zinc-555 border border-zinc-200 dark:border-zinc-900 text-xs font-mono"
                        >
                          {tok}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
