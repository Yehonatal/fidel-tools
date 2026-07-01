"use client";

import React, { useState, useEffect } from "react";
import CodeSnippet from "@/components/CodeSnippet";
import KeywordCloud from "@/components/KeywordCloud";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2, AlertTriangle, RefreshCw } from "lucide-react";

export default function AnalyzePage() {
  const [text, setText] = useState(
    "የአዲስ አበባ ከተማ አስተዳደር ትምህርት ቢሮ በትምህርት ቤቶች ውስጥ የሚታዩትን የትምህርት ጥራት ችግሮች ለመፍታት አዲስ መመሪያ አወጣ። መመሪያው መምህራን በተገቢው መንገድ እንዲያስተምሩ እና ተማሪዎችም በትጋት እንዲያጠኑ ያዛል። ት/ቤት መሄድ ግዴታ ነው።",
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const resData = await response.json();
      if (resData.error) {
        setError(resData.error);
      } else {
        setData(resData);
      }
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeDocument(text);
  }, []);

  const chartData = data?.topKeywords
    ? data.topKeywords.map(([word, freq]: [string, number]) => ({
        name: word,
        frequency: freq,
      }))
    : [];

  const stopwordRatio = data?.wordCount
    ? Math.round(((data.wordCount.raw - data.wordCount.afterProcessing) / data.wordCount.raw) * 100)
    : 0;

  const codeSnippet = `// Document Analysis Pipeline
const normalized = nlp.normalize(rawText);
const lexed = nlp.lexAnalyze(normalized);
const cleaned = nlp.removeStopwords(lexed);
const tokens = cleaned.split(' ');
const stems = tokens.map(t => nlp.stem(t));

const transliterated = nlp.feligTransliterate(cleaned, 'am');`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Amharic Document Analyzer
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Audit the grammatical and semantic density of a text. This system isolates keywords by
          stripping stopwords, collapses words into their morphological stems, and provides
          real-time vocabulary charts.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Editor */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-wider font-mono">
                  Document Input
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[220px] lg:h-[280px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Paste document text here..."
                />
                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3.5 mt-3.5 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-555 font-bold">
                    {text.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    onClick={() => analyzeDocument(text)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    Analyze Document
                  </button>
                </div>
              </div>
            </div>

            <CodeSnippet title="Analyzer Execution Pipeline" code={codeSnippet} />
          </div>

          {/* Results grid */}
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
                <span>Processing vocabulary analytics...</span>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Density statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Raw Word Count
                    </span>
                    <span className="text-xl font-mono font-extrabold text-zinc-900 dark:text-white mt-1 block">
                      {data.wordCount.raw}
                    </span>
                  </div>
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Cleaned Tokens
                    </span>
                    <span className="text-xl font-mono font-extrabold text-blue-600 dark:text-sky-400 mt-1 block">
                      {data.wordCount.afterProcessing}
                    </span>
                  </div>
                  <div className="premium-card p-4">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Stopword Ratio
                    </span>
                    <span className="text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                      {stopwordRatio}%
                    </span>
                  </div>
                </div>

                {/* Chart of Stems */}
                {chartData.length > 0 && (
                  <div className="premium-card p-5 space-y-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">
                      Extracted Stem Frequency Chart
                    </span>
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#070709",
                              borderColor: "#222222",
                              fontSize: "10px",
                              fontFamily: "monospace",
                              color: "#ffffff",
                            }}
                          />
                          <Bar
                            dataKey="frequency"
                            fill="#2563eb"
                            radius={[2, 2, 0, 0]}
                            maxBarSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Keyword Cloud */}
                <KeywordCloud keywords={data.topKeywords || []} />

                {/* Transliterated preview */}
                <div className="premium-card p-5 space-y-3">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-wider font-mono block">
                    SERA Transliterated Output
                  </span>
                  <p className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 max-h-[140px] overflow-y-auto break-words bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200/50 dark:border-zinc-850 select-all leading-relaxed">
                    {data.transliterated}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
