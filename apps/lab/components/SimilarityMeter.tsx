import React from "react";

interface SimilarityMeterProps {
  score: number;
}

export default function SimilarityMeter({ score }: SimilarityMeterProps) {
  const percentage = Math.round(score * 100);

  let color = "stroke-zinc-300 dark:stroke-zinc-700";
  let textColor = "text-zinc-500";
  if (percentage > 80) {
    color = "stroke-emerald-500";
    textColor = "text-emerald-500";
  } else if (percentage > 40) {
    color = "stroke-blue-500";
    textColor = "text-blue-500";
  } else if (percentage > 10) {
    color = "stroke-amber-500";
    textColor = "text-amber-500";
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score * circumference;

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md p-4 transition-colors flex flex-col items-center justify-center text-center">
      <h4 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 w-full text-left">
        Jaccard Similarity Index
      </h4>

      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-zinc-100 dark:stroke-zinc-900 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`fill-none transition-all duration-500 ${color}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-mono font-extrabold tracking-tighter ${textColor}`}>
            {percentage}%
          </span>
          <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
            Match
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 max-w-[200px] leading-relaxed">
        {percentage > 85 ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            Extremely high similarity. Near duplicate copies.
          </span>
        ) : percentage > 50 ? (
          <span className="text-blue-600 dark:text-blue-400">
            Moderate to high overlap. Shared concepts.
          </span>
        ) : percentage > 15 ? (
          <span className="text-amber-600 dark:text-amber-400">
            Low similarity. Co-occurrence of key vocabulary.
          </span>
        ) : (
          <span className="text-zinc-500 dark:text-zinc-500">
            Almost zero overlap. Distinct documents.
          </span>
        )}
      </div>
    </div>
  );
}
