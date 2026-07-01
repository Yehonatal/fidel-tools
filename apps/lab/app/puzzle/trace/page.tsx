"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Flame, Share2, ArrowRight, Play, RefreshCw, X, Check, HelpCircle, GripVertical, ChevronRight } from "lucide-react";
import { getTracePuzzle, checkTraceGuess } from "@/lib/puzzle/api-client";
import { addPuzzleResult, loadPuzzleHistory, PuzzleResult } from "@/lib/puzzle/store";
import { renderShareGrid, copyToClipboard } from "@/lib/puzzle/share";
import { getTodayDateStringUTC } from "@/lib/puzzle/seed";
import FidelLoader from "@/components/FidelLoader";

interface GuessAttempt {
  steps: string[];
  feedback: ("green" | "yellow" | "black")[];
  output: string;
}

export default function TracePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Daily Puzzle Data
  const [inputSentence, setInputSentence] = useState("");
  const [targetOutput, setTargetOutput] = useState("");
  const [targetSteps, setTargetSteps] = useState<string[]>([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [dateStr, setDateStr] = useState("");

  // Game States
  const [guesses, setGuesses] = useState<GuessAttempt[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [submitting, setSubmitting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = getTodayDateStringUTC();
    setDateStr(today);

    async function init() {
      try {
        setLoading(true);
        const data = await getTracePuzzle(today);
        setInputSentence(data.payload.input);
        setTargetOutput(data.payload.targetOutput);
        setTargetSteps(data.payload.steps || []);
        setDayNumber(data.day_number || 1);

        // Load existing game state if played today
        const history = loadPuzzleHistory("trace");
        const existing = history.results.find((r) => r.dateStr === today);
        if (existing) {
          // Re-inflate guesses if stored
          if (existing.guesses) {
            // Re-verify guesses to retrieve outputs
            const verifiedGuesses: GuessAttempt[] = [];
            for (const g of existing.guesses) {
              const check = await checkTraceGuess(data.payload.input, g, today);
              verifiedGuesses.push({
                steps: g,
                feedback: check.feedback,
                output: check.output,
              });
            }
            setGuesses(verifiedGuesses);
            
            const solved = verifiedGuesses.some((g) => g.steps.join(",") === data.payload.steps.join(","));
            if (solved) {
              setGameStatus("won");
            } else if (verifiedGuesses.length >= 6) {
              setGameStatus("lost");
            }
          } else {
            setGameStatus(existing.won ? "won" : "lost");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load Trace puzzle.");
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

  const stepsLength = targetSteps.length;
  const availableSteps = ["normalize", "tokenize", "stopwords", "stem"];

  const handleSelectStep = (step: string) => {
    if (currentGuess.includes(step) || currentGuess.length >= stepsLength || gameStatus !== "playing") return;
    setCurrentGuess((prev) => [...prev, step]);
  };

  const handleRemoveStep = (idx: number) => {
    if (gameStatus !== "playing") return;
    setCurrentGuess((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== stepsLength || submitting || gameStatus !== "playing") return;

    setSubmitting(true);
    try {
      const result = await checkTraceGuess(inputSentence, currentGuess, dateStr);
      
      const newAttempt: GuessAttempt = {
        steps: currentGuess,
        feedback: result.feedback,
        output: result.output,
      };

      const updatedGuesses = [...guesses, newAttempt];
      setGuesses(updatedGuesses);
      setCurrentGuess([]);

      const won = result.solved;
      const lost = !won && updatedGuesses.length >= 6;

      if (won || lost) {
        const nextStatus = won ? "won" : "lost";
        setGameStatus(nextStatus);

        // Save result
        // Map feedback colors to Wordle grids
        const feedbackGrid = updatedGuesses.map((g) => {
          return g.feedback.map((f) => {
            if (f === "green") return "green";
            if (f === "yellow") return "yellow";
            return "black";
          }) as ("green" | "yellow" | "black")[];
        });

        // Store outcomes as emojis
        const gridText = renderShareGrid(
          "Pipeline Trace",
          dayNumber,
          feedbackGrid,
          `Guesses: ${updatedGuesses.length}/6`
        ).split("\n").slice(1, -2).join("\n"); // Get just the grid lines

        const newResult: PuzzleResult = {
          puzzleId: "trace",
          dateStr,
          completed: true,
          won: won,
          attempts: updatedGuesses.length,
          grid: gridText,
          guesses: updatedGuesses.map((g) => g.steps),
        };

        addPuzzleResult("trace", newResult);
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit guess.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const feedbackGrid = guesses.map((g) => {
      return g.feedback.map((f) => {
        if (f === "green") return "green";
        if (f === "yellow") return "yellow";
        return "black";
      }) as ("green" | "yellow" | "black")[];
    });

    const shareText = renderShareGrid(
      "Pipeline Trace",
      dayNumber,
      feedbackGrid,
      `Guesses: ${guesses.length}/6`
    );

    copyToClipboard(shareText).then((success) => {
      if (success) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    });
  };

  const stepLabels: Record<string, string> = {
    normalize: "Normalize",
    tokenize: "Tokenize",
    stopwords: "Stopwords",
    stem: "Stem",
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-205 dark:border-zinc-900 pb-4">
        <span className="text-xs font-bold font-mono uppercase text-zinc-400">
          Trace Deduction
        </span>
        <span className="text-xs font-bold font-mono uppercase text-zinc-400">
          Fidel Trace #{dayNumber}
        </span>
      </div>

      {/* Target Output Panel */}
      <div className="space-y-4">
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 bg-white dark:bg-zinc-950/20 shadow-md space-y-4">
          <div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase block mb-1">
              Source Text
            </span>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
              {inputSentence}
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase block mb-1">
              Target Output
            </span>
            <p className="text-base font-bold text-amber-500 font-mono tracking-wide">
              {targetOutput}
            </p>
          </div>
        </div>
      </div>

      {/* Guess History Rows */}
      <div className="space-y-3.5">
        {guesses.map((attempt, rowIdx) => (
          <div
            key={rowIdx}
            className="border border-zinc-200 dark:border-zinc-900/60 rounded-xl p-4 bg-white dark:bg-zinc-950/10 space-y-2 animate-in slide-in-from-bottom-2 duration-300"
          >
            {/* Steps feedback row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {attempt.steps.map((step, stepIdx) => {
                  const f = attempt.feedback[stepIdx];
                  const colorClass =
                    f === "green"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : f === "yellow"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-zinc-700 text-zinc-300 border-zinc-750 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800";
                  return (
                    <span
                      key={stepIdx}
                      className={`px-2 py-0.5 border text-[10px] font-mono font-bold rounded-md ${colorClass}`}
                    >
                      {stepLabels[step]}
                    </span>
                  );
                })}
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                Attempt {rowIdx + 1}/6
              </span>
            </div>
            {/* Resulting output */}
            <div className="text-[11px] font-mono text-zinc-505 dark:text-zinc-400">
              Result: <span className="font-semibold">{attempt.output}</span>
            </div>
          </div>
        ))}
        
        {/* Fill remaining empty rows */}
        {guesses.length < 6 && gameStatus === "playing" && (
          Array.from({ length: 6 - guesses.length - 1 }).map((_, i) => (
            <div
              key={i}
              className="border border-zinc-150/40 dark:border-zinc-900/30 rounded-xl p-4 min-h-[56px] flex items-center justify-between text-[10px] font-mono text-zinc-350 dark:text-zinc-700"
            >
              <span>Attempt {guesses.length + i + 2}</span>
              <span>••••</span>
            </div>
          ))
        )}
      </div>

      {/* Active Guess Entry / Game End Panel */}
      {gameStatus === "playing" ? (
        <div className="border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6 bg-white dark:bg-zinc-950/20 shadow-xl space-y-6">
          <div className="space-y-3">
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase block">
              Deduce Step Order ({stepsLength} slots)
            </span>
            
            {/* Slot indicators */}
            <div className="flex gap-3 justify-center">
              {Array.from({ length: stepsLength }).map((_, idx) => {
                const step = currentGuess[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => handleRemoveStep(idx)}
                    className={`w-28 h-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-xs font-bold font-mono transition-all ${
                      step
                        ? "border-amber-500 text-amber-500 bg-amber-500/5 cursor-pointer hover:border-red-500 hover:text-red-500 hover:bg-red-500/5"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-350 dark:text-zinc-700"
                    }`}
                  >
                    {step ? stepLabels[step] : `Slot ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette of buttons */}
          <div className="space-y-4">
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase block text-center">
              Available Steps
            </span>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {availableSteps.map((step) => {
                const selected = currentGuess.includes(step);
                return (
                  <button
                    key={step}
                    disabled={selected}
                    onClick={() => handleSelectStep(step)}
                    className={`px-4 py-2 border text-xs font-bold font-mono rounded-xl transition-all cursor-pointer ${
                      selected
                        ? "border-zinc-150 bg-zinc-50 text-zinc-300 dark:border-zinc-900 dark:bg-zinc-950/20 dark:text-zinc-750 cursor-not-allowed"
                        : "border-zinc-250 hover:border-amber-500/50 text-zinc-700 dark:border-zinc-800 dark:hover:border-amber-500/30 dark:text-zinc-350"
                    }`}
                  >
                    {stepLabels[step]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
            <button
              onClick={handleSubmitGuess}
              disabled={currentGuess.length !== stepsLength || submitting}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-700 dark:disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Submit Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* End Game Cards */
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl p-8 bg-white dark:bg-zinc-950/20 shadow-xl space-y-6 text-center animate-in scale-in duration-300">
          <div className="text-5xl">{gameStatus === "won" ? "🎉" : "💡"}</div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold uppercase tracking-wider font-mono">
              {gameStatus === "won" ? "Trace Decoded!" : "Reveal Panel"}
            </h3>
            <p className="text-xs text-zinc-500">
              {gameStatus === "won"
                ? `You correctly deduced the pipeline trace in ${guesses.length} attempts!`
                : "You ran out of attempts. Let's see the canonical solution."}
            </p>
          </div>

          {/* Solution Steps */}
          <div className="space-y-3 pt-3 border-y border-dashed border-zinc-200 dark:border-zinc-800 py-4">
            <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-400 uppercase block">
              Canonical Pipeline Sequence
            </span>
            <div className="flex gap-2 justify-center">
              {targetSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 font-bold font-mono text-xs shadow-inner">
                    {stepLabels[step]}
                  </span>
                  {idx < targetSteps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogy explanation */}
          <div className="text-left bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-4 space-y-2">
            <div className="flex gap-2 items-center text-xs font-bold text-zinc-700 dark:text-zinc-350">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Why Order Matters</span>
            </div>
            <p className="text-[11px] text-zinc-555 dark:text-zinc-400 leading-relaxed font-medium">
              In this case, the sequence starts by normalising spelling variants (like ሐ $\to$ ሀ), then sweeps stopwords (like &quot;ወደ&quot;), followed by tokenizing sentences, and finally extracting morphological stems (like ሐኪሙ $\to$ ሐኪም). Changing this sequence — e.g. stemming before normalising — leads to unrecognised affixes because spelling variants aren&apos;t collapsed first.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleShare}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareCopied ? "Copied!" : "Share Results Grid"}</span>
            </button>

            <Link
              href="/puzzle"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:translate-x-0.5 transition-transform"
            >
              <span>Back to Puzzles Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
