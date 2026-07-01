"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Award, Flame, CheckCircle2, ChevronRight, HelpCircle, Layers } from "lucide-react";
import { loadPuzzleHistory, PuzzleResult } from "@/lib/puzzle/store";
import { getTodayDateStringUTC, getDayNumber } from "@/lib/puzzle/seed";

export default function PuzzleHubPage() {
  const [mounted, setMounted] = useState(false);
  const [arenaResult, setArenaResult] = useState<PuzzleResult | null>(null);
  const [traceResult, setTraceResult] = useState<PuzzleResult | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [dayNumber, setDayNumber] = useState(1);

  useEffect(() => {
    setMounted(true);
    const today = getTodayDateStringUTC();
    setDateStr(today);
    setDayNumber(getDayNumber(today));

    // Load results for today
    const arenaHistory = loadPuzzleHistory("relevance-arena");
    const todayArena = arenaHistory.results.find((r) => r.dateStr === today);
    if (todayArena) setArenaResult(todayArena);

    const traceHistory = loadPuzzleHistory("trace");
    const todayTrace = traceHistory.results.find((r) => r.dateStr === today);
    if (todayTrace) setTraceResult(todayTrace);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 font-mono text-xs">
        LOADING PUZZLES...
      </div>
    );
  }

  return (
    <div className="space-y-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Welcome Section */}
      <div className="text-center md:text-left space-y-4 border-b border-zinc-200 dark:border-zinc-900 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 dark:border-amber-500/20 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>Fidel Daily Puzzles</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight font-sans">
          A Puzzle a Day, in Ge&apos;ez
        </h1>
        <p className="text-sm text-zinc-555 dark:text-zinc-400 font-medium max-w-xl">
          Challenge your morphological deduction, lexical connotations, and relevance judgment against real Ethiopic natural language processing algorithms.
        </p>
        <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>UTC Today: {dateStr}</span>
          <span>•</span>
          <span>Day: #{dayNumber}</span>
        </div>
      </div>

      {/* Grid of Active Puzzles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Puzzle 1: Relevance Arena */}
        <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-6 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:border-blue-500/10 dark:text-sky-400">
                <Search className="w-5 h-5" />
              </div>
              {arenaResult?.completed ? (
                <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <span>Available</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Relevance Arena
              </h3>
              <p className="text-xs text-zinc-555 dark:text-zinc-400 leading-relaxed font-semibold">
                LMSYS-style blind comparison. Look at a query and two passages; guess which one the TF-IDF weight index ranks higher. Compare your human logic to the algorithm.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between">
            <div>
              {arenaResult?.completed && (
                <div className="text-[10px] font-mono text-zinc-400">
                  Today&apos;s Grid: <span className="font-sans text-xs tracking-tight">{arenaResult.grid}</span>
                </div>
              )}
            </div>
            
            <Link
              href="/puzzle/relevance-arena"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-950 dark:text-zinc-200 group-hover:translate-x-1 transition-transform"
            >
              <span>{arenaResult?.completed ? "Review Rounds" : "Play Arena"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>
        </div>

        {/* Puzzle 2: Trace */}
        <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-6 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="inline-flex p-3 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:border-purple-500/10 dark:text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              {traceResult?.completed ? (
                <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <span>Available</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Pipeline Trace
              </h3>
              <p className="text-xs text-zinc-555 dark:text-zinc-400 leading-relaxed font-semibold">
                Logic-deduction Mastermind puzzle. You are shown only the starting sentence and final pipeline output. Deduce the exact ordered steps that produced it.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between">
            <div>
              {traceResult?.completed && (
                <div className="text-[10px] font-mono text-zinc-400">
                  Guesses: <span className="font-bold text-zinc-900 dark:text-white font-mono">{traceResult.attempts}/6</span>
                </div>
              )}
            </div>
            
            <Link
              href="/puzzle/trace"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-950 dark:text-zinc-200 group-hover:translate-x-1 transition-transform"
            >
              <span>{traceResult?.completed ? "Review Steps" : "Deduce Trace"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Info / Explanation Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-start">
          <div className="hidden sm:inline-flex p-2 bg-amber-500/10 text-amber-550 dark:text-amber-400 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Why daily puzzles?</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Daily puzzles encourage computational linguistics exploration. Solving them reveals how spelling normalizers, tokenizers, stopword sweeping, and stemming interact to yield indexed text models.
            </p>
          </div>
        </div>
        <Link
          href="/dev/pipeline"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-sans text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <span>Use Free-Play Sandbox</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
