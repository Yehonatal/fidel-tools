import React from "react";

interface KeywordCloudProps {
  keywords: Array<[string, number]>;
  onKeywordClick?: (keyword: string) => void;
}

export default function KeywordCloud({ keywords, onKeywordClick }: KeywordCloudProps) {
  if (keywords.length === 0) {
    return (
      <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono italic p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded">
        No keywords extracted yet.
      </div>
    );
  }

  const maxFreq = Math.max(...keywords.map(([, f]) => f));

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md p-4 transition-colors">
      <h4 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
        Morphology Keyword Cloud
      </h4>
      <div className="flex flex-wrap gap-2.5 items-center justify-center py-4 px-2 max-h-[220px] overflow-y-auto">
        {keywords.map(([word, freq]) => {
          const weightRatio = maxFreq > 1 ? (freq - 1) / (maxFreq - 1) : 0.5;
          const fontSize = 11 + weightRatio * 8;

          let colorClass = "text-zinc-650 dark:text-zinc-400";
          if (weightRatio > 0.7) {
            colorClass = "text-blue-600 dark:text-sky-450 font-extrabold";
          } else if (weightRatio > 0.4) {
            colorClass = "text-zinc-900 dark:text-zinc-100 font-bold";
          }

          return (
            <button
              key={word}
              onClick={() => onKeywordClick?.(word)}
              style={{ fontSize: `${fontSize}px` }}
              className={`font-mono transition-all duration-150 select-none px-1.5 hover:scale-[1.08] cursor-pointer ${colorClass}`}
              title={`Frequency: ${freq}`}
            >
              {word}
              <span className="text-[9px] opacity-40 font-semibold ml-0.5">({freq})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
