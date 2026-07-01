import React from "react";

interface TokenBadgeProps {
  token: string;
  type?: "normal" | "stopword" | "stem" | "highlight";
  subtitle?: string;
  onClick?: () => void;
}

export default function TokenBadge({ token, type = "normal", subtitle, onClick }: TokenBadgeProps) {
  const baseClasses =
    "inline-flex flex-col items-center justify-center px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border select-none";

  let typeClasses = "";
  if (type === "normal") {
    typeClasses =
      "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300";
  } else if (type === "stopword") {
    typeClasses =
      "bg-red-500/[0.04] dark:bg-red-500/[0.02] border-red-500/10 dark:border-red-500/10 text-red-500";
  } else if (type === "stem") {
    typeClasses =
      "bg-blue-500/5 dark:bg-sky-400/[0.02] border-blue-500/10 dark:border-sky-400/10 text-blue-600 dark:text-sky-400";
  } else if (type === "highlight") {
    typeClasses =
      "bg-emerald-500/5 dark:bg-emerald-500/[0.02] border-emerald-500/10 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }

  const clickableClasses = onClick ? "cursor-pointer hover:scale-[1.03] active:scale-95" : "";

  return (
    <div onClick={onClick} className={`${baseClasses} ${typeClasses} ${clickableClasses}`}>
      <span>{token}</span>
      {subtitle && (
        <span className="text-[8px] opacity-60 font-semibold mt-0.5 tracking-wider uppercase">
          {subtitle}
        </span>
      )}
    </div>
  );
}
