import React from "react";
import TokenBadge from "./TokenBadge";
import { ArrowDown, Layers, Terminal, Sparkles, Code2, Activity, Play } from "lucide-react";

interface PipelineVisualizerProps {
  inputText: string;
  trace: {
    normalize?: string;
    lexAnalyze?: string;
    removeStopwords?: string;
    stem?: string;
    transliterate?: string;
  };
}

export default function PipelineVisualizer({ inputText, trace }: PipelineVisualizerProps) {
  // Utility to split text into word pill tokens
  const getWordTokens = (text: string) => {
    return text.split(/\s+/).filter(Boolean);
  };

  return (
    <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 py-2">
      {/* Stage 1: Input */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Play className="w-3.5 h-3.5 text-zinc-550 dark:text-zinc-400 fill-current" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                Stage 1
              </span>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                Raw Input Document
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {getWordTokens(inputText).length} tokens
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 max-h-[140px] overflow-y-auto">
            {getWordTokens(inputText).map((token, idx) => (
              <TokenBadge key={idx} token={token} type="normal" />
            ))}
          </div>
        </div>
      </div>

      {/* Stage 2: Normalization */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Code2 className="w-3.5 h-3.5 text-blue-500" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Stage 2
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              Lexical Normalization
            </h4>
          </div>
          <p className="text-[10px] font-semibold text-zinc-450 leading-tight">
            Collapses phoneme homophones (e.g. ሀ/ሐ/ኀ) and cleans letters to uniform spelling
            representations.
          </p>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 max-h-[140px] overflow-y-auto">
            {trace.normalize ? (
              getWordTokens(trace.normalize).map((token, idx) => (
                <TokenBadge key={idx} token={token} type="normal" />
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">Processing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 3: Lex Analyze */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Stage 3
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              Lexical Analyzer & Expansion
            </h4>
          </div>
          <p className="text-[10px] font-semibold text-zinc-450 leading-tight">
            Identifies token boundaries, expands common abbreviations (e.g. ት/ቤት &rarr; ትምህርት ቤት),
            and strips non-word punctuation.
          </p>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 max-h-[140px] overflow-y-auto">
            {trace.lexAnalyze ? (
              getWordTokens(trace.lexAnalyze).map((token, idx) => (
                <TokenBadge key={idx} token={token} type="normal" />
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">Processing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 4: Stopword Filtering */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Stage 4
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              Stopwords Filtering
            </h4>
          </div>
          <p className="text-[10px] font-semibold text-zinc-450 leading-tight">
            Filters out high-frequency prepositions, conjunctions, and copulas, keeping semantic
            keywords.
          </p>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 max-h-[140px] overflow-y-auto">
            {trace.removeStopwords ? (
              getWordTokens(trace.removeStopwords).map((token, idx) => (
                <TokenBadge key={idx} token={token} type="stopword" />
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">Processing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 5: Stemming */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Stage 5
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              Morphology Stemming
            </h4>
          </div>
          <p className="text-[10px] font-semibold text-zinc-450 leading-tight">
            Trims inflectional prefixes and suffixes, leaving the root stem of each Amharic word.
          </p>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 max-h-[140px] overflow-y-auto">
            {trace.stem ? (
              getWordTokens(trace.stem).map((s, idx) => <TokenBadge key={idx} token={s} type="stem" />)
            ) : (
              <span className="text-xs text-zinc-400 italic">Processing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 6: Transliteration */}
      <div className="relative group">
        <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs transition-colors group-hover:border-blue-500">
          <Terminal className="w-3.5 h-3.5 text-purple-500" />
        </span>
        <div className="premium-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
              Stage 6
            </span>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
              SERA ASCII Phonetic Output
            </h4>
          </div>
          <p className="text-[10px] font-semibold text-zinc-450 leading-tight">
            Maps Ge&apos;ez Unicode characters into SERA phonetic ASCII strings.
          </p>
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-150 dark:border-zinc-900/60 font-mono text-xs text-blue-600 dark:text-sky-400 break-all select-all">
            {trace.transliterate || "Processing..."}
          </div>
        </div>
      </div>
    </div>
  );
}
