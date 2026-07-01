"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Wrench, ArrowRight, ArrowLeft } from "lucide-react";

interface UnderConstructionOverlayProps {
  title: string;
  description: string;
  badge?: string;
}

export default function UnderConstructionOverlay({
  title,
  description,
  badge = "UNDER CONSTRUCTION",
}: UnderConstructionOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/60 dark:bg-black/60 backdrop-blur-md transition-all duration-300 p-6">
      <div className="border border-slate-200 dark:border-zinc-900 bg-white/95 dark:bg-[#070709]/95 rounded-2xl p-8 md:p-10 shadow-2xl max-w-lg w-full text-center relative overflow-hidden backdrop-blur-xl hover:border-blue-500/20 transition-all duration-500 flex flex-col items-center">
        {/* Decorative Grid background inside card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Animated Badge Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 flex items-center justify-center mb-6 relative border border-amber-500/20 shadow-inner group">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 animate-ping opacity-75" />
          <Wrench className="w-6 h-6 animate-pulse" />
        </div>

        {/* Under Construction Pill Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 uppercase tracking-widest">
          <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
          {badge}
        </span>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight font-sans relative z-10">
          {title}
        </h2>

        <div className="border-b border-slate-200 dark:border-zinc-900 w-24 my-4 relative z-10" />

        {/* Description */}
        <p className="text-xs md:text-sm font-medium text-slate-550 dark:text-zinc-400 leading-relaxed max-w-sm mb-8 relative z-10">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full relative z-10">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-center border border-slate-200 hover:border-slate-355 dark:border-zinc-800 dark:hover:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-black dark:hover:bg-zinc-950 text-slate-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <a
            href="mailto:support@fidel.tools?subject=Early Access Request - Fidel Tools"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold text-center border border-transparent bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black shadow-sm transition-all cursor-pointer"
          >
            <span>Request Early Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
