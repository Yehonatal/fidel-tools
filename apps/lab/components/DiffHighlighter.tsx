import React from "react";
import { ArrowRight } from "lucide-react";

interface DiffHighlighterProps {
  original: string;
  modified: string;
}

export default function DiffHighlighter({ original, modified }: DiffHighlighterProps) {
  const origWords = original.split(/\s+/).filter(Boolean);
  const modWords = modified.split(/\s+/).filter(Boolean);

  const maxLen = Math.max(origWords.length, modWords.length);
  const diffs: Array<{ o: string; m: string; changed: boolean }> = [];

  for (let i = 0; i < maxLen; i++) {
    const o = origWords[i] || "";
    const m = modWords[i] || "";
    const changed = o !== m;
    diffs.push({ o, m, changed });
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md p-4 transition-colors">
      <h4 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
        Visual Alignment Diff
      </h4>
      <div className="flex flex-wrap gap-2 align-content-start max-h-[200px] overflow-y-auto pr-1">
        {diffs.map((diff, index) => {
          if (!diff.changed) {
            return (
              <span
                key={index}
                className="px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-400 text-xs font-mono border border-zinc-200 dark:border-zinc-800"
              >
                {diff.o || diff.m}
              </span>
            );
          }
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/[0.04] dark:bg-amber-400/[0.02] border border-amber-500/10 dark:border-amber-400/10 text-xs font-mono"
            >
              <span className="text-red-500 line-through decoration-red-500/50">
                {diff.o || "Ø"}
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {diff.m || "Ø"}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
