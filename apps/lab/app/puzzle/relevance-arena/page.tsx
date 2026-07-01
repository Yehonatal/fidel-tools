"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Flame, Share2, ArrowRight, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { getRelevanceArenaPuzzle } from "@/lib/puzzle/api-client";
import { addPuzzleResult, loadPuzzleHistory, PuzzleResult } from "@/lib/puzzle/store";
import { renderShareGrid, copyToClipboard } from "@/lib/puzzle/share";
import { getTodayDateStringUTC } from "@/lib/puzzle/seed";
import FidelLoader from "@/components/FidelLoader";

interface RoundData {
  roundIndex: number;
  query: string;
  passageA: string;
  passageB: string;
  scoreA: number;
  scoreB: number;
  winner: string; // "A" | "B" | "tie"
  termsA: Array<{ term: string; weight: number }>;
  termsB: Array<{ term: string; weight: number }>;
  relativeDiffPercent: number;
}

export default function RelevanceArenaPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [dateStr, setDateStr] = useState("");

  // Game state
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [userPicks, setUserPicks] = useState<Record<number, "A" | "B">>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Load daily puzzle & check history
  useEffect(() => {
    setMounted(true);
    const today = getTodayDateStringUTC();
    setDateStr(today);

    async function init() {
      try {
        setLoading(true);
        const data = await getRelevanceArenaPuzzle(today);
        setRounds(data.payload.rounds || []);
        setDayNumber(data.day_number || 1);

        // Check if already completed today in history
        const history = loadPuzzleHistory("relevance-arena");
        const existing = history.results.find((r) => r.dateStr === today);
        if (existing) {
          // Re-populate choices from stored grid if possible, or just skip to completion
          setGameCompleted(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load Relevance Arena puzzle.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <FidelLoader 
        layout="component" 
        mode="fun" 
      />
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 leading-relaxed font-mono">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 text-xs font-bold font-mono rounded-lg transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const currentRound = rounds[currentRoundIdx];

  const handlePick = (pick: "A" | "B") => {
    if (revealed[currentRoundIdx]) return;

    setUserPicks((prev) => ({ ...prev, [currentRoundIdx]: pick }));
    setRevealed((prev) => ({ ...prev, [currentRoundIdx]: true }));
  };

  const getRoundOutcome = (idx: number, pick: "A" | "B"): "green" | "yellow" | "black" => {
    const r = rounds[idx];
    if (r.winner === "tie") return "yellow";
    if (pick === r.winner) return "green";
    
    // Disagreed. Check closeness
    if (r.relativeDiffPercent < 15) return "yellow";
    return "black";
  };

  const handleNext = () => {
    if (currentRoundIdx < 4) {
      setCurrentRoundIdx((prev) => prev + 1);
    } else {
      // Calculate final results
      const outcomes = Object.entries(userPicks).map(([idx, pick]) =>
        getRoundOutcome(Number(idx), pick)
      );

      const agreementCount = outcomes.filter((o) => o === "green").length;
      const rate = Math.round((agreementCount / 5) * 100);

      // Render grid emoji block
      const emojiMap = { green: "green", yellow: "yellow", black: "black" } as const;
      const finalOutcomes = outcomes.map((o) => emojiMap[o]);
      const grid = renderShareGrid(
        "Relevance Arena",
        dayNumber,
        finalOutcomes,
        `Agreement: ${rate}%`
      ).split("\n")[1]; // Extract just the emoji row for DB storage

      const newResult: PuzzleResult = {
        puzzleId: "relevance-arena",
        dateStr,
        completed: true,
        won: agreementCount >= 3, // Won if they agreed on at least 3 rounds
        attempts: 1,
        grid,
        agreementRate: rate,
      };

      addPuzzleResult("relevance-arena", newResult);
      setGameCompleted(true);
    }
  };

  const handleShare = () => {
    const outcomes = rounds.map((_, idx) => {
      const pick = userPicks[idx] || "A";
      return getRoundOutcome(idx, pick);
    });

    const agreementCount = outcomes.filter((o) => o === "green").length;
    const rate = Math.round((agreementCount / 5) * 100);

    const shareText = renderShareGrid(
      "Relevance Arena",
      dayNumber,
      outcomes,
      `Agreement: ${rate}%`
    );

    copyToClipboard(shareText).then((success) => {
      if (success) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    });
  };

  // Replay/Review Rounds after completion
  const handleReviewRounds = () => {
    // Populate fake picks matching the winner to let them read the explanations, or check stored
    setGameCompleted(false);
    setCurrentRoundIdx(0);
  };

  if (gameCompleted) {
    const history = loadPuzzleHistory("relevance-arena");
    const todayResult = history.results.find((r) => r.dateStr === dateStr);

    const finalOutcomes = rounds.map((_, idx) => {
      const pick = userPicks[idx] || "A";
      return getRoundOutcome(idx, pick);
    });

    const rate = todayResult?.agreementRate ?? 0;

    return (
      <div className="max-w-md mx-auto text-center border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 space-y-6 bg-white dark:bg-zinc-950/20 shadow-xl animate-in scale-in duration-300">
        <div className="text-5xl">🏆</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wider font-mono">
            Arena Completed!
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Fidel Lab Relevance Arena #{dayNumber}
          </p>
        </div>

        {/* Emojis Grid */}
        <div className="flex justify-center gap-2 text-2xl py-3 border-y border-dashed border-zinc-200 dark:border-zinc-800">
          {finalOutcomes.map((outcome, i) => (
            <span key={i}>
              {outcome === "green" && "🟩"}
              {outcome === "yellow" && "🟨"}
              {outcome === "black" && "⬛"}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-2xl font-bold font-mono text-blue-500">{rate}%</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Agreement Rate</p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-900/10">
            <p className="text-2xl font-bold font-mono text-amber-500">
              {history.currentStreak}
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Streak</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{shareCopied ? "Copied!" : "Share Results"}</span>
          </button>
          
          <button
            onClick={handleReviewRounds}
            className="w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer"
          >
            Review Rounds
          </button>

          <Link
            href="/puzzle"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
          >
            <span>Back to Puzzles Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const roundPick = userPicks[currentRoundIdx];
  const roundRevealed = revealed[currentRoundIdx];
  const roundOutcome = roundPick ? getRoundOutcome(currentRoundIdx, roundPick) : "black";

  return (
    <div className="space-y-8 w-full">
      {/* Top Progress info */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono uppercase text-zinc-400">
            Round {currentRoundIdx + 1} of 5
          </span>
        </div>
        <div className="text-xs font-bold font-mono uppercase text-zinc-400">
          Fidel Arena #{dayNumber}
        </div>
      </div>

      {/* Query Banner */}
      <div className="bg-zinc-900 text-white dark:bg-zinc-950 border border-zinc-800 dark:border-zinc-900 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block mb-1">
          Search Query
        </span>
        <h2 className="text-3xl font-extrabold tracking-wide font-sans">{currentRound.query}</h2>
      </div>

      {/* Passages VS Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Visual VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-400 z-10 hidden md:flex">
          VS
        </div>

        {/* Passage A Card */}
        <button
          onClick={() => handlePick("A")}
          disabled={roundRevealed}
          className={`group/card text-left border rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between min-h-[160px] ${
            roundRevealed
              ? roundPick === "A"
                ? roundOutcome === "green"
                  ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                : currentRound.winner === "A"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-200 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-950/10 opacity-70"
              : "border-zinc-200 dark:border-zinc-850 hover:border-amber-500/50 bg-white dark:bg-zinc-950/40 hover:shadow-lg hover:scale-98 cursor-pointer"
          }`}
        >
          <div className="space-y-4">
            <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 group-hover/card:text-amber-500 transition-colors uppercase block">
              Passage A
            </span>
            <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
              {currentRound.passageA}
            </p>
          </div>

          {roundRevealed && (
            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-900 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Score weight</p>
                <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                  {currentRound.scoreA}
                </p>
              </div>
              {currentRound.winner === "A" && (
                <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase">
                  ranks higher
                </span>
              )}
            </div>
          )}
        </button>

        {/* Passage B Card */}
        <button
          onClick={() => handlePick("B")}
          disabled={roundRevealed}
          className={`group/card text-left border rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between min-h-[160px] ${
            roundRevealed
              ? roundPick === "B"
                ? roundOutcome === "green"
                  ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                : currentRound.winner === "B"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-200 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-950/10 opacity-70"
              : "border-zinc-200 dark:border-zinc-850 hover:border-amber-500/50 bg-white dark:bg-zinc-950/40 hover:shadow-lg hover:scale-98 cursor-pointer"
          }`}
        >
          <div className="space-y-4">
            <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 group-hover/card:text-amber-500 transition-colors uppercase block">
              Passage B
            </span>
            <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
              {currentRound.passageB}
            </p>
          </div>

          {roundRevealed && (
            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-900 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Score weight</p>
                <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                  {currentRound.scoreB}
                </p>
              </div>
              {currentRound.winner === "B" && (
                <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase">
                  ranks higher
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Reveal explanations block */}
      {roundRevealed && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/10 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {roundOutcome === "green" && "🟩"}
              {roundOutcome === "yellow" && "🟨"}
              {roundOutcome === "black" && "⬛"}
            </span>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide font-mono">
                {roundOutcome === "green" && "Agreed"}
                {roundOutcome === "yellow" && "Close Call"}
                {roundOutcome === "black" && "Decisive Miss"}
              </h4>
              <p className="text-xs text-zinc-500">
                {currentRound.winner === "tie"
                  ? "This round ended in an exact tie."
                  : roundOutcome === "green"
                  ? "Your pick matched the algorithm's highest-ranking document."
                  : roundOutcome === "yellow"
                  ? "You disagreed, but the weight margin was close (<15% difference)."
                  : "You disagreed, and the algorithm scored the other passage significantly higher."}
              </p>
            </div>
          </div>

          {/* Contribution Weights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-150 dark:border-zinc-900/60">
            {/* Terms A */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold font-mono text-zinc-450 uppercase tracking-wide">
                Key weights: Passage A
              </h5>
              <div className="space-y-1.5">
                {currentRound.termsA.length > 0 ? (
                  currentRound.termsA.map((t, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 font-medium font-mono text-blue-600 dark:text-sky-400">
                        {t.term}
                      </span>
                      <span className="font-mono text-zinc-400">{t.weight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-650 italic">
                    No matching search query terms found.
                  </p>
                )}
              </div>
            </div>

            {/* Terms B */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold font-mono text-zinc-450 uppercase tracking-wide">
                Key weights: Passage B
              </h5>
              <div className="space-y-1.5">
                {currentRound.termsB.length > 0 ? (
                  currentRound.termsB.map((t, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/10 font-medium font-mono text-blue-600 dark:text-sky-400">
                        {t.term}
                      </span>
                      <span className="font-mono text-zinc-400">{t.weight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-650 italic">
                    No matching search query terms found.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900/60 flex justify-end">
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span>{currentRoundIdx < 4 ? "Next Round" : "Finish Arena"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
