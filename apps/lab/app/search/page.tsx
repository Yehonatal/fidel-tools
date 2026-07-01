"use client";

import React, { useState, useEffect } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Search, ListFilter, Plus, RefreshCw, AlertTriangle, Trash2 } from "lucide-react";

const INITIAL_DOCS = [
  { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ በሆስፒታሉ ውስጥ ይሰበሰባሉ።" },
  { id: "doc-2", content: "ሃኪሙ ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።" },
  { id: "doc-3", content: "ልጆች ትምህርት ቤት ሄደው አዲስ እውቀት ይማራሉ።" },
  { id: "doc-4", content: "የገንዘብ ሚኒስቴር ለት/ቤቶች ተጨማሪ በጀት ፈቀደ።" },
  { id: "doc-5", content: "አ.አ ውስጥ የሚኖሩት ሰራተኞች አዲስ አበባ ከተማን ያደንቃሉ።" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("ሐኪም");
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [newDocText, setNewDocText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [queryStems, setQueryStems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (currentQuery: string) => {
    if (!currentQuery.trim() || docs.length === 0) {
      setResults([]);
      setQueryStems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery, documents: docs }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
        setQueryStems(data.queryStems || []);
      }
    } catch (err: any) {
      setError(err.message || "Search request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(query);
  }, [docs]);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocText.trim()) return;
    const newDoc = {
      id: `doc-${docs.length + 1}`,
      content: newDocText.trim(),
    };
    setDocs([...docs, newDoc]);
    setNewDocText("");
  };

  const handleRemoveDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const codeSnippet = `import { indexDocument, score } from './search'

const docStems = indexDocument(documentText)
const queryStems = indexDocument(searchQuery)

const relevanceScore = score(docStems, queryStems)`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title Block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Amharic Full-Text Search Engine
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Standard search engines fail on spelling variants (e.g. `ሐኪሞች` vs `ሃኪሙ`) or plural
          inflections (e.g. `ልጅ` vs `ልጆች`). By running query and document text through normalizer
          and stemmer pipelines, queries match exact roots.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Search input & Corpus management */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">
                Search Query
              </span>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search corpus (e.g. ሐኪም, ልጅ)..."
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-3 p-1 text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Add custom document */}
            <div className="premium-card overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-wider font-mono">
                  Index Document into Corpus
                </span>
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <form onSubmit={handleAddDocument} className="p-4 space-y-3.5">
                <textarea
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Type Amharic document sentence..."
                  className="w-full min-h-[80px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 text-xs font-semibold text-zinc-805 dark:text-zinc-300 resize-none outline-none focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-xs font-bold tracking-wider transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Index Document
                </button>
              </form>
            </div>

            <CodeSnippet title="Query and Rank Implementation" code={codeSnippet} />
          </div>

          {/* Right column: Search Results list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">
                  Relevance Results ({results.length})
                </span>
                {docs.length > 0 && (
                  <button
                    onClick={() => setDocs([])}
                    className="text-[9px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider font-mono cursor-pointer active:scale-95"
                  >
                    [Clear All Documents]
                  </button>
                )}
              </div>
              {queryStems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-405 font-mono font-semibold">
                    Query Stems:
                  </span>
                  <div className="flex gap-1.5">
                    {queryStems.map((st) => (
                      <TokenBadge key={st} token={st} type="stem" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="border border-dashed border-zinc-200 dark:border-zinc-900 rounded-md p-16 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-555 font-mono text-xs gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching and scoring documents...</span>
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg text-xs font-mono italic text-zinc-400">
                Corpus is empty. Type sentences on the left to index custom documents.
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((res) => {
                  const isMatch = res.score > 0;
                  return (
                    <div
                      key={res.id}
                      className={`premium-card p-5 transition-all duration-200 ${
                        isMatch
                          ? "border-blue-500/25 dark:border-blue-500/20 bg-blue-500/[0.01] dark:bg-blue-550/[0.005]"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                            {res.id}
                          </span>
                          <button
                            onClick={() => handleRemoveDoc(res.id)}
                            className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove from corpus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          {res.matchedStems?.length > 0 && (
                            <div className="flex gap-1">
                              {res.matchedStems.map((ms: string) => (
                                <span
                                  key={ms}
                                  className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[10px] font-bold font-mono border border-emerald-500/10"
                                >
                                  {ms}
                                </span>
                              ))}
                            </div>
                          )}
                          <span
                            className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${
                              isMatch
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-sky-400"
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-400"
                            }`}
                          >
                            Score: {Math.round(res.score * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                        {res.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg text-xs font-mono italic text-zinc-400">
                No matching documents. Try searching a different term.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
