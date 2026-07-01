"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Award, Layers, Search, Flame, Terminal, HelpCircle, X, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { loadPuzzleHistory, PuzzleHistory } from "@/lib/puzzle/store";
import { useLabMode } from "@/components/mode-context";

export default function PuzzleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [statsOpen, setStatsOpen] = useState(false);
  const [arenaStats, setArenaStats] = useState<PuzzleHistory | null>(null);
  const [traceStats, setTraceStats] = useState<PuzzleHistory | null>(null);

  // Load stats
  const refreshStats = () => {
    setArenaStats(loadPuzzleHistory("relevance-arena"));
    setTraceStats(loadPuzzleHistory("trace"));
  };

  useEffect(() => {
    refreshStats();
  }, [pathname, statsOpen]);

  // Generate 15 columns * 7 days of historical cells
  const generateHeatmapCells = () => {
    const cells: { dateStr: string; completions: number; dateLabel: string }[] = [];
    const today = new Date();
    
    // Go back to the Sunday 14 weeks ago
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek - (14 * 7)); // 15 weeks total
    
    const totalArenaPlays = arenaStats?.results.filter(r => r.completed).length || 0;
    const totalTracePlays = traceStats?.results.filter(r => r.completed).length || 0;
    const isFirstTimeUser = totalArenaPlays === 0 && totalTracePlays === 0;

    for (let i = 0; i < 15 * 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      
      let completions = 0;
      
      if (isFirstTimeUser) {
        // Generate pseudo-random onboarding visual dots
        let hash = 0;
        for (let j = 0; j < dateStr.length; j++) {
          hash = (hash * 31 + dateStr.charCodeAt(j)) | 0;
        }
        const val = Math.abs(hash) % 10;
        if (val === 2 || val === 5 || val === 8) {
          completions = 1;
        } else if (val === 7) {
          completions = 2;
        }
      } else {
        if (arenaStats?.results.some(r => r.dateStr === dateStr && r.completed)) completions++;
        if (traceStats?.results.some(r => r.dateStr === dateStr && r.completed)) completions++;
      }
      
      const dateLabel = currentDate.toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
      
      cells.push({ dateStr, completions, dateLabel });
    }
    return cells;
  };

  const heatmapCells = generateHeatmapCells();
  const perfectDaysCount = heatmapCells.filter(c => c.completions === 2).length;

  const { setMode } = useLabMode();

  const handleBackToConsole = () => {
    setMode("academic");
  };

  // Nav item list
  const navItems = [
    { name: "Hub", href: "/puzzle", icon: <Layers className="w-4 h-4" /> },
    { name: "Relevance Arena", href: "/puzzle/relevance-arena", icon: <Search className="w-4 h-4" /> },
    { name: "Trace", href: "/puzzle/trace", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5 select-none">
              <span className="font-loga text-2xl font-light text-zinc-950 dark:text-white tracking-tight">
                ፊደል
              </span>
              <div className="relative h-4 overflow-hidden mt-1.5">
                <span className="block text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-mono transition-transform duration-300 group-hover:-translate-y-6">
                  Puzzle
                </span>
                <span className="absolute top-0 left-0 text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono transition-transform duration-300 translate-y-6 group-hover:translate-y-0 whitespace-nowrap">
                  ← Back to Labs
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls & Actions */}
          <div className="flex items-center gap-3">
            {/* Streak Counter / Stats */}
            <button
              onClick={() => {
                refreshStats();
                setStatsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold font-mono text-zinc-650 dark:text-zinc-350 hover:border-amber-500/50 hover:text-amber-500 dark:hover:border-amber-500/30 dark:hover:text-amber-450 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Show Stats & Streaks"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>
                {Math.max((arenaStats?.currentStreak || 0), (traceStats?.currentStreak || 0))}
              </span>
            </button>

            {/* Back to Console */}
            <button
              onClick={handleBackToConsole}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:text-blue-500 hover:border-blue-500/30 dark:hover:text-sky-400 dark:hover:border-sky-400/20 transition-all cursor-pointer active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-mono">Fidel Dev</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sub Header for Mobile Navigation */}
      <div className="md:hidden border-b border-zinc-200 dark:border-zinc-900 bg-white/40 dark:bg-black/40 backdrop-blur-xs flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                active
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleBackToConsole}
          className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-zinc-500 dark:text-zinc-400"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8 md:py-12 z-10">
        {children}
      </main>

      {/* Stats Modal */}
      {statsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setStatsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-lg font-bold uppercase tracking-wider font-mono">
                Your Puzzle Progress
              </h3>
            </div>

            <div className="space-y-6">
              {/* Daily Completion Heatmap */}
              <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Completion Streak</span>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                    Perfect Days: {perfectDaysCount}
                  </span>
                </h4>

                {/* Heatmap Grid visualization */}
                <div className="flex gap-1.5 justify-center py-2 overflow-x-auto select-none">
                  {Array.from({ length: 15 }).map((_, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1.5">
                      {Array.from({ length: 7 }).map((_, rowIdx) => {
                        const cellIdx = colIdx * 7 + rowIdx;
                        const cell = heatmapCells[cellIdx];
                        if (!cell) return null;

                        let cellColor = "bg-zinc-150 dark:bg-zinc-900 border-zinc-200/40 dark:border-zinc-800/30";
                        if (cell.completions === 1) {
                          cellColor = "bg-amber-500/40 dark:bg-amber-500/20 border-amber-500/30 dark:border-amber-500/10";
                        } else if (cell.completions === 2) {
                          cellColor = "bg-amber-500 dark:bg-amber-400 border-amber-600 dark:border-amber-350 shadow-[0_0_8px_rgba(245,158,11,0.25)]";
                        }

                        return (
                          <div
                            key={rowIdx}
                            className={`w-3.5 h-3.5 rounded-[3px] border ${cellColor} transition-all duration-200 hover:scale-110`}
                            title={`${cell.dateLabel}: ${cell.completions} of 2 puzzles completed`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend & Summary */}
                <div className="flex justify-between items-center text-[9px] font-bold text-zinc-450 dark:text-zinc-500 font-mono pt-1">
                  <span className="uppercase">15 Weeks History</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-[2px] border border-zinc-200/50 dark:border-zinc-800/30 bg-zinc-150 dark:bg-zinc-900" />
                      <span>0</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-[2px] border border-amber-500/30 dark:border-amber-500/10 bg-amber-500/40 dark:bg-amber-500/20" />
                      <span>1</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-[2px] border border-amber-600 dark:border-amber-350 bg-amber-500 dark:bg-amber-400" />
                      <span>2</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* Relevance Arena Stats */}
              <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                <h4 className="text-xs font-bold font-mono uppercase text-blue-600 dark:text-sky-400 mb-3 flex items-center justify-between">
                  <span>Relevance Arena</span>
                  <span className="text-[10px] text-zinc-400">TF-IDF ranker</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono">
                      {arenaStats?.results.filter((r) => r.completed).length || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Played</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono text-amber-500">
                      {arenaStats?.currentStreak || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Streak</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono text-emerald-500">
                      {arenaStats?.longestStreak || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Max Streak</p>
                  </div>
                </div>
              </div>

              {/* Trace Stats */}
              <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                <h4 className="text-xs font-bold font-mono uppercase text-blue-600 dark:text-sky-400 mb-3 flex items-center justify-between">
                  <span>Trace Deductions</span>
                  <span className="text-[10px] text-zinc-400">pipeline trace</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono">
                      {traceStats?.results.filter((r) => r.completed).length || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Played</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono text-amber-500">
                      {traceStats?.currentStreak || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Streak</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-zinc-150 dark:border-zinc-850">
                    <p className="text-xl font-bold font-mono text-emerald-500">
                      {traceStats?.longestStreak || 0}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Max Streak</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStatsOpen(false)}
              className="w-full mt-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer font-mono"
            >
              Back to Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
