"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Search, Plus, RefreshCw, Trash2 } from "lucide-react";

export default function SearchPage() {
  const { mode } = useLabMode();
  const [query, setQuery] = useState("ሐኪም");
  const [docs, setDocs] = useState([
    { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ በሆስፒታሉ ውስጥ ይሰበሰባሉ።" },
    { id: "doc-2", content: "ሃኪሙ ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።" },
    { id: "doc-3", content: "ልጆች ትምህርት ቤት ሄደው አዲስ እውቀት ይማራሉ።" },
    { id: "doc-4", content: "የገንዘብ ሚኒስቴር ለት/ቤቶች ተጨማሪ በጀት ፈቀደ።" },
  ]);
  const [newDocText, setNewDocText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [queryStems, setQueryStems] = useState<string[]>([]);
  const [rawIndex, setRawIndex] = useState<any>(null);
  const [rawWeights, setRawWeights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "index" | "weights">("results");

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
        setRawIndex(data.rawIndex || null);
        setRawWeights(data.rawWeights || null);
      }
    } catch (err: any) {
      setError(err.message || "Search request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      performSearch(query);
    }
  }, [docs, mode]);

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

  const codeSnippet = `// Live Query relevance search
const res = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: "ሐኪም",
    documents: [
      { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ..." }
    ]
  })
});
const { results, queryStems } = await res.json();
console.log(results); // sorted by TF-IDF score`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            TF-IDF Relevance Vector Search Engine
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Index a custom corpus of documents and query the TF-IDF weighted vector space index live.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Add documents & Search controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Input bar */}
            <form onSubmit={handleSearchSubmit} className="premium-card p-4 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search query term..."
                className="flex-grow bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-3 text-xs font-sans text-zinc-800 dark:text-zinc-250 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-md transition-all cursor-pointer font-mono"
              >
                Search
              </button>
            </form>

            {/* Document Index Corpus */}
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                  Document Corpus ({docs.length})
                </span>
              </div>
              
              {/* Document list */}
              <div className="divide-y divide-zinc-200 dark:divide-zinc-900 overflow-y-auto max-h-[220px]">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-blue-500 font-mono">{doc.id.toUpperCase()}</span>
                      <p className="text-zinc-650 dark:text-zinc-400 font-medium">{doc.content}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add document form */}
              <form onSubmit={handleAddDocument} className="p-3 bg-zinc-50 dark:bg-zinc-955/60 border-t border-zinc-200 dark:border-zinc-900 flex gap-2">
                <input
                  type="text"
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Add document content..."
                  className="flex-grow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-1.5 px-3 text-xs font-sans text-zinc-800 dark:text-zinc-250 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Results Tab console panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center px-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("results")}
                    className={`py-3 text-[9px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
                      activeTab === "results"
                        ? "border-blue-500 text-blue-600 dark:text-sky-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Relevance Results
                  </button>
                  <button
                    onClick={() => setActiveTab("index")}
                    className={`py-3 text-[9px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
                      activeTab === "index"
                        ? "border-blue-500 text-blue-600 dark:text-sky-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Corpus Inverted Index
                  </button>
                  <button
                    onClick={() => setActiveTab("weights")}
                    className={`py-3 text-[9px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
                      activeTab === "weights"
                        ? "border-blue-500 text-blue-600 dark:text-sky-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Weight Matrices
                  </button>
                </div>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-md text-red-500 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {activeTab === "results" && (
                  <div className="space-y-4">
                    {/* Query stems visual badge helper */}
                    {queryStems.length > 0 && (
                      <div className="flex gap-1.5 items-center flex-wrap">
                        <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-widest font-mono">Query tokens:</span>
                        {queryStems.map((stem, i) => (
                          <TokenBadge key={i} token={stem} />
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      {results.map((res, i) => (
                        <div
                          key={res.id}
                          className="p-4 border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-955 rounded-lg flex items-center justify-between gap-4 text-xs font-sans"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-blue-500 shrink-0 font-mono">
                              #{i + 1} | {res.id.toUpperCase()}
                            </span>
                            <p className="text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">
                              {res.content}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-sky-400 text-[10px] font-black font-mono">
                              SCORE: {res.score.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {results.length === 0 && (
                        <div className="text-center p-12 text-zinc-450 font-mono">
                          No query relevance search performed yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "index" && (
                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-955 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-900">
                          <th className="px-4 py-2.5">Term (Stemmed)</th>
                          <th className="px-4 py-2.5">Posting List (Doc IDs)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-650 dark:text-zinc-400">
                        {rawIndex ? (
                          Object.entries(rawIndex).map(([term, docIds]: any) => (
                            <tr key={term} className="hover:bg-zinc-50/40">
                              <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-sky-400">{term}</td>
                              <td className="px-4 py-2.5">{docIds.join(", ").toUpperCase()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="text-center py-10 text-zinc-450">
                              Inverted Index empty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "weights" && (
                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-955 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-900">
                          <th className="px-4 py-2.5">Term</th>
                          {docs.map((d) => (
                            <th key={d.id} className="px-4 py-2.5 uppercase text-[9px]">{d.id} TF-IDF</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-zinc-650 dark:text-zinc-400">
                        {rawWeights ? (
                          Object.entries(rawWeights).map(([term, docWeights]: any) => (
                            <tr key={term} className="hover:bg-zinc-50/40">
                              <td className="px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-350">{term}</td>
                              {docs.map((d) => (
                                <td key={d.id} className="px-4 py-2.5">
                                  {docWeights[d.id] ? docWeights[d.id].toFixed(4) : "0.0000"}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={docs.length + 1} className="text-center py-10 text-zinc-450">
                              Weight Matrix empty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
