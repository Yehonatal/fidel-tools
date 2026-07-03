"use client";

import React, { useState, useEffect, useRef } from "react";
import { Type, Gamepad, Play, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react";

interface NormalizationWord {
  displayWord: string;
  canonicalWord: string;
  variantWord: string;
  isCanonical: boolean;
  rule: string;
  meaning: string;
}

const GAME_PAIRS: NormalizationWord[] = [
  { displayWord: "ሠላም", canonicalWord: "ሰላም", variantWord: "ሠላም", isCanonical: false, rule: "ሠ → ሰ", meaning: "peace" },
  { displayWord: "ሰላም", canonicalWord: "ሰላም", variantWord: "ሠላም", isCanonical: true, rule: "ሠ → ሰ", meaning: "peace" },
  { displayWord: "ሐኪም", canonicalWord: "ሀኪም", variantWord: "ሐኪም", isCanonical: false, rule: "ሐ → ሀ", meaning: "doctor" },
  { displayWord: "ሀኪም", canonicalWord: "ሀኪም", variantWord: "ሐኪም", isCanonical: true, rule: "ሐ → ሀ", meaning: "doctor" },
  { displayWord: "ዓለም", canonicalWord: "አለም", variantWord: "ዓለም", isCanonical: false, rule: "ዓ → አ", meaning: "world" },
  { displayWord: "አለም", canonicalWord: "አለም", variantWord: "ዓለም", isCanonical: true, rule: "ዓ → አ", meaning: "world" },
  { displayWord: "ንጉሥ", canonicalWord: "ንጉስ", variantWord: "ንጉሥ", isCanonical: false, rule: "ሥ → ስ", meaning: "king" },
  { displayWord: "ንጉስ", canonicalWord: "ንጉስ", variantWord: "ንጉሥ", isCanonical: true, rule: "ሥ → ስ", meaning: "king" },
  { displayWord: "ኀይል", canonicalWord: "ሀይል", variantWord: "ኀይል", isCanonical: false, rule: "ኀ → ሀ", meaning: "power" },
  { displayWord: "ሀይል", canonicalWord: "ሀይል", variantWord: "ኀይል", isCanonical: true, rule: "ኀ → ሀ", meaning: "power" },
  { displayWord: "ጸሀይ", canonicalWord: "ጸሀይ", variantWord: "ጸሐይ", isCanonical: true, rule: "ሐ → ሀ", meaning: "sun" },
  { displayWord: "ጸሐይ", canonicalWord: "ጸሀይ", variantWord: "ጸሐይ", isCanonical: false, rule: "ሐ → ሀ", meaning: "sun" },
  { displayWord: "ጽሁፍ", canonicalWord: "ጽሁፍ", variantWord: "ፅሁፍ", isCanonical: true, rule: "ፅ → ጽ", meaning: "writing" },
  { displayWord: "ፅሁፍ", canonicalWord: "ጽሁፍ", variantWord: "ፅሁፍ", isCanonical: false, rule: "ፅ → ጽ", meaning: "writing" },
];

export default function NormalizePuzzlePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  
  // Feedback and Reveal state
  const [answerState, setAnswerState] = useState<"correct" | "incorrect" | "timeout" | null>(null);
  const [revealRule, setRevealRule] = useState<NormalizationWord | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswerState(null);
    setRevealRule(null);
    startRound(0);
  };

  const startRound = (idx: number) => {
    setTimeLeft(3);
    setAnswerState(null);
    setRevealRule(null);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSort(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSort = (userGuessedCanonical: boolean | null, isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const currentWordObj = GAME_PAIRS[currentIndex];
    
    if (isTimeout) {
      setAnswerState("timeout");
      setStreak(0);
    } else {
      const isCorrect = userGuessedCanonical === currentWordObj.isCanonical;
      if (isCorrect) {
        setAnswerState("correct");
        setStreak((prev) => prev + 1);
        const currentMultiplier = Math.min(5, Math.floor(streak / 3) + 1);
        setScore((prev) => prev + 10 * currentMultiplier);
      } else {
        setAnswerState("incorrect");
        setStreak(0);
      }
    }

    setRevealRule(currentWordObj);

    setTimeout(() => {
      if (currentIndex < GAME_PAIRS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        startRound(currentIndex + 1);
      } else {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentWordObj = GAME_PAIRS[currentIndex];
  const currentMultiplier = Math.min(5, Math.floor(streak / 3) + 1);

  return (
    <div className="font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#fdfcfa] bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] text-zinc-900 dark:bg-[#121110] dark:bg-[radial-gradient(#292524_1.5px,transparent_1.5px)] dark:text-amber-100 animate-in fade-in duration-300">
      <style dangerouslySetInnerHTML={{
        __html: `
          .cartoon-border {
            border: 3.5px solid #000;
            box-shadow: 6px 6px 0px 0px #000;
          }
          .dark .cartoon-border {
            border: 3.5px solid #f59e0b;
            box-shadow: 6px 6px 0px 0px #f59e0b;
          }
          .paper-sheet {
            background: linear-gradient(135deg, #fff 85%, #fef08a 100%);
            border: 3.5px solid #000;
            box-shadow: 6px 6px 0px 0px #000;
            animation: paper-wobble 2.5s ease-in-out infinite alternate;
          }
          .dark .paper-sheet {
            background: linear-gradient(135deg, #1c1a19 85%, #25201c 100%);
            border: 3.5px solid #f59e0b;
            box-shadow: 6px 6px 0px 0px #f59e0b;
          }
          @keyframes paper-wobble {
            0% { transform: rotate(-2deg) translateY(0px); }
            100% { transform: rotate(2deg) translateY(-8px); }
          }
          .bin-hover:hover {
            transform: scale(1.03) rotate(-1deg);
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  VARIANT SORT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 3
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Quickly sort spelling variants into canonical (normalized) bins or variant (raw) bins before the countdown expires!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Column Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Column: Interactive Game Area (Col span 8) */}
        <div className="lg:col-span-8 w-full bg-white/40 dark:bg-zinc-900/10 p-4 md:p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[460px]">
          {!isPlaying ? (
            <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-md w-full text-center space-y-6">
              <div className="text-5xl">⚖️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Enter Variant Arena?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Test your Ethiopic orthographic instincts. You must categorize words under 3 seconds as standard canonical keys or alternative spelling forms.
                </p>
              </div>
              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                  FINAL SCORE: {score} PTS
                </div>
              )}
              <button
                onClick={startGame}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b]"
              >
                Start Sorting
              </button>
            </div>
          ) : (
            <div className="w-full space-y-8 flex flex-col items-center">
              {/* Paper word displaying */}
              <div className="paper-sheet rounded-xl max-w-sm w-full py-8 px-6 text-center relative min-h-[160px] flex flex-col justify-center items-center">
                {/* Timer bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-200 dark:bg-zinc-800 overflow-hidden rounded-t-lg">
                  <div
                    style={{ width: `${(timeLeft / 3) * 100}%` }}
                    className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                  />
                </div>

                <span className="text-4xl font-extrabold tracking-wide font-sans text-zinc-950 dark:text-white select-none">
                  {currentWordObj.displayWord}
                </span>

                {/* Score Multiplier indicator */}
                <span className="absolute bottom-2 right-3 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                  multiplier: {currentMultiplier}x
                </span>
              </div>

              {/* Feedback reveal banner */}
              <div className="h-10 flex items-center justify-center">
                {answerState === "correct" && (
                  <div className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CORRECT! +{10 * currentMultiplier} PTS</span>
                  </div>
                )}
                {answerState === "incorrect" && (
                  <div className="flex items-center gap-1 text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest animate-shake">
                    <XCircle className="w-4 h-4" />
                    <span>INCORRECT BIN!</span>
                  </div>
                )}
                {answerState === "timeout" && (
                  <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    <span>TIME EXPIRED!</span>
                  </div>
                )}
              </div>

              {/* Sorting Bins */}
              <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
                {/* Bin Left: Variant/Raw */}
                <button
                  onClick={() => handleSort(false)}
                  disabled={answerState !== null}
                  className="bin-hover cartoon-border p-6 rounded-2xl bg-rose-100 text-rose-900 border-black text-center font-black cursor-pointer select-none active:scale-95 disabled:opacity-40 transition-all dark:bg-rose-950/20 dark:text-rose-300 dark:border-amber-500"
                >
                  <p className="text-lg">VARIANT</p>
                  <p className="text-[9px] font-bold opacity-70 mt-1 uppercase tracking-wider">Alternative Spelling</p>
                </button>

                {/* Bin Right: Canonical/Normalized */}
                <button
                  onClick={() => handleSort(true)}
                  disabled={answerState !== null}
                  className="bin-hover cartoon-border p-6 rounded-2xl bg-emerald-100 text-emerald-900 border-black text-center font-black cursor-pointer select-none active:scale-95 disabled:opacity-40 transition-all dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-amber-500"
                >
                  <p className="text-lg">CANONICAL</p>
                  <p className="text-[9px] font-bold opacity-70 mt-1 uppercase tracking-wider">Normalized Form</p>
                </button>
              </div>

              {/* Lexical explanation metadata */}
              {revealRule && (
                <div className="cartoon-border rounded-xl p-4 bg-yellow-50 dark:bg-zinc-900/40 max-w-md w-full animate-in zoom-in-95 duration-200 dark:border-amber-500">
                  <div className="flex justify-between items-center border-b border-dashed border-black/10 dark:border-amber-500/10 pb-1.5 mb-2">
                    <span className="text-[8px] font-black uppercase text-amber-800 dark:text-amber-400">NORMALIZER ANALYSIS</span>
                    <span className="text-[8px] font-black border border-black bg-white dark:bg-zinc-850 px-1 rounded">
                      {revealRule.rule}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold leading-relaxed">
                    Word: <span className="font-bold font-sans">&quot;{revealRule.displayWord}&quot;</span> standardizes to{" "}
                    <span className="font-black text-blue-600 dark:text-sky-400 font-sans">&quot;{revealRule.canonicalWord}&quot;</span>. 
                    (Meaning: <span className="italic">{revealRule.meaning}</span>)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Study Guide & Performance HUD (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          {/* Performance HUD */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🎮 LAB MONITORS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">SCORE</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-500 leading-none">{streak}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">STREAK</p>
              </div>
            </div>
          </div>

          {/* Educational Concept Card */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <div className="border-b-2 border-dashed border-zinc-205 dark:border-zinc-800 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                📖 NLP LAB REPORT
              </span>
              <h4 className="text-sm font-black text-black dark:text-white uppercase mt-1">
                Orthographic Spelling Variants
              </h4>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              Ge&apos;ez homophones (e.g. ሠ/ሰ, ሐ/ሀ, ኀ/ሀ, ፀ/ጸ) occurred due to phonetic mergers over centuries. In modern search indexes, the system merges all grapheme clusters onto a single canonical token key.
            </p>
            <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1 font-semibold">
                <li>Identify if the displayed word uses the standard normal form (Canonical) or the variant.</li>
                <li>Dodge timeouts by choosing a bin within 3 seconds!</li>
                <li>Build streaks of 3 or more correct sorts to double or triple points!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
