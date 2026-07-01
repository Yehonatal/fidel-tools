"use client";

import React, { useState, useEffect } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Tag as TagIcon, AlertTriangle } from "lucide-react";

export default function TagsPage() {
  const [text, setText] = useState(
    "የአማርኛ ቋንቋ በኢትዮጵያ ውስጥ ሰፊ የህዝብ ቁጥር የሚናገረው ብሔራዊ ቋንቋ ነው። ይህ ቋንቋ የራሱ የፊደል መዋቅር አለው። የአማርኛ ቋንቋ ጥናትና ምርምር በሀገሪቱ ዩኒቨርሲቲዎች ውስጥ በስፋት ይካሄዳል።",
  );
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<any | null>(null);

  const generateTags = async () => {
    setLoading(true);
    setError(null);
    setSelectedTag(null);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, limit: 10 }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTags(data.tags || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateTags();
  }, []);

  const codeSnippet = `// Tag / Keyword Extraction Pipeline
const normalized = nlp.normalize(text);
const lexed = nlp.lexAnalyze(normalized);
const cleaned = nlp.removeStopwords(lexed);
const stems = cleaned.split(' ').map(w => nlp.stem(w));

// Count frequencies, sort, and slice top N tags
const freq = {};
stems.forEach(s => {
  if (s.length > 1) freq[s] = (freq[s] || 0) + 1;
});`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <TagIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Stopword-Aware Tag Generator
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Extract meaningful metadata tags from unstructured text. This pipeline filters the ~435
          most common Amharic particles and function words so only high-signal noun and verb roots
          remain.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor text area */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                  Source Document
                </span>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-[180px] bg-transparent border-0 outline-none focus:outline-none ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed resize-none overflow-y-auto"
                  placeholder="Paste article text..."
                />
                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3.5 mt-3.5 flex justify-end shrink-0">
                  <button
                    onClick={generateTags}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    {loading ? "Extracting..." : "Generate Tags"}
                  </button>
                </div>
              </div>
            </div>

            <CodeSnippet title="Tag Extractor Code" code={codeSnippet} />
          </div>

          {/* Tags Grid Output */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="premium-card p-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-900 pb-2">
                Generated Badges (Click to trace inflected occurrences)
              </span>

              {loading ? (
                <div className="py-6 flex justify-center text-xs text-zinc-400 font-mono">
                  Running tag extraction...
                </div>
              ) : tags.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {tags.map((item) => (
                    <TokenBadge
                      key={item.tag}
                      token={item.tag}
                      subtitle={`Count: ${item.count}`}
                      type={selectedTag?.tag === item.tag ? "highlight" : "stem"}
                      onClick={() => setSelectedTag(item)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No tags generated.</p>
              )}
            </div>

            {/* Details on selected tag */}
            {selectedTag && (
              <div className="premium-card p-5 space-y-3.5 animate-in slide-in-from-bottom-2 duration-250">
                <h4 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  Trace details for:{" "}
                  <span className="text-blue-600 dark:text-sky-400 font-extrabold">
                    {selectedTag.tag}
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  The following inflections in the source document were collapsed into the root
                  stem:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedTag.examples.map((ex: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-semibold text-zinc-750 dark:text-zinc-300 font-sans"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
