"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { Activity, RefreshCw } from "lucide-react";

export default function TokenizePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ። የአዲስ አበባ ከተማ እጅግ ትልቅ ነው።");
  const [sentences, setSentences] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const performTokenization = async (textToTokenize: string) => {
    if (!textToTokenize.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTokenize }),
      });
      const data = await response.json();
      if (!data.error) {
        setSentences(data.sentences || []);
        setWords(data.words || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      performTokenization(text);
    }
  }, [text, mode]);

  const codeSnippet = `// Segment Words Functional API
import { sentenceTokenize } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const sentences = sentenceTokenize(text, amPack);
console.log(sentences); // Outputs array of sentence strings`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Sentence Boundary segmenter & Word Tokenizer
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Analyze how the pipeline tokenizes text into distinct sentences using Ethiopic sentence boundaries.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                  Input Corpus Text
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-450 resize-none overflow-y-auto"
                  placeholder="Type paragraph content..."
                />
              </div>
            </div>

            <CodeSnippet title="Functional API usage" code={codeSnippet} />
          </div>

          {/* Results Visualizer Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-955 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-550 uppercase tracking-wider font-mono">
                  Sentence Boundary Segments
                </span>
              </div>
              <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                {sentences.length > 0 ? (
                  sentences.map((sent, i) => (
                    <div
                      key={i}
                      className="p-3 border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-955/60 rounded-lg text-xs leading-relaxed font-sans text-zinc-800 dark:text-zinc-250 flex items-start gap-3"
                    >
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0 font-mono">
                        SENT {i + 1}
                      </span>
                      <span>{sent}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-10 text-zinc-400 text-xs font-mono">
                    No sentence boundaries detected
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
