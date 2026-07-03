"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BookOpen, RefreshCw } from "lucide-react";

export default function LanguagesPage() {
  const { mode } = useLabMode();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/languages");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const codeSnippet = `// Get Supported Languages Endpoint
const res = await fetch('http://localhost:3001/api/v1/nlp/languages', {
  headers: {
    'x-api-key': 'your_api_key_here'
  }
});
const { supported, default: def } = await res.json();
console.log(supported); // Output: ["am"]`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Supported Languages & Reference Console
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Retrieve operational linguistic registry models, default language parameters, and exception rules loaded on startup.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documentation / Snippets */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                API Endpoint Specifications
              </h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-green-500/10 text-green-600 dark:text-emerald-400">GET</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">/api/v1/nlp/languages</span>
                </div>
                <p className="text-zinc-500 leading-relaxed font-medium">
                  Fetches active language configurations, rules count, and normalizer exception mappings. Authenticated via raw headers.
                </p>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Interactive JSON Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Live Response Visualizer
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-6">
                {data ? (
                  <pre className="text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-blue-600 dark:text-sky-400 max-h-[480px]">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                ) : (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-900 rounded-md p-16 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs gap-3">
                    <span>No data fetched from API backend.</span>
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
