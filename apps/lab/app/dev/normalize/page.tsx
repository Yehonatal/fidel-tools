"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import DiffHighlighter from "@/components/DiffHighlighter";
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

export default function NormalizePage() {
  const { mode } = useLabMode();
  const [rawText, setRawText] = useState("ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ወደ ት/ቤት ሄደ።");
  const [normalizedText, setNormalizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  
  // Feedback and Reveal state
  const [answerState, setAnswerState] = useState<"correct" | "incorrect" | "timeout" | null>(null);
  const [revealRule, setRevealRule] = useState<NormalizationWord | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performNormalization = async (textToNormalize: string) => {
    if (!textToNormalize.trim()) {
      setNormalizedText("");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToNormalize }),
      });
      const data = await response.json();
      if (!data.error) {
        setNormalizedText(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performNormalization(rawText);
      }, 450);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawText, mode]);

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

  if (mode === "fun") {
    const currentWordObj = GAME_PAIRS[currentIndex];
    const currentMultiplier = Math.min(5, Math.floor(streak / 3) + 1);

    // ── 10/10 FUN MODE: FALLING PAPER SORT ─────────────────────────────────
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
                    FALLING PAPER SORT
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                    Level 3
                  </span>
                </div>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                  Sort alternative spelling variants from canonical indexing baselines!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Column Layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Game Area (Col span 8) */}
          <div className="lg:col-span-8 w-full bg-white/40 dark:bg-zinc-900/10 p-4 md:p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[480px]">
            {!isPlaying ? (
              <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-md w-full text-center space-y-6">
                <div className="text-5xl">🎯</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                    Begin Orthographic sorting?
                  </h3>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold font-mono">
                    Papers will drop down. Decide if the spelling is the normalized index standard (Canonical) or an orthographic variant (Alternative).
                  </p>
                </div>
                {score > 0 && (
                  <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                    PREVIOUS SCORE: {score} PTS
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
                >
                  Start Game
                </button>
              </div>
            ) : (
              <div className="max-w-md w-full flex flex-col items-center justify-between min-h-[480px] relative space-y-6">
                
                {/* Top stats HUD */}
                <div className="w-full cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-3.5 flex justify-between items-center text-xs font-black">
                  <span className="text-zinc-500 dark:text-zinc-400 uppercase">
                    ROUND {currentIndex + 1} / {GAME_PAIRS.length}
                  </span>
                  <span className="text-red-500 animate-pulse">⏰ TIMER: {timeLeft}S</span>
                </div>

                {/* Falling notebook page sheet */}
                <div className="w-full flex-grow flex items-center justify-center py-6">
                  <div className="paper-sheet w-full max-w-[280px] p-8 rounded-2xl text-center space-y-4 relative">
                    
                    {/* Lined notebook decoration lines */}
                    <div className="absolute inset-x-0 top-6 h-[1.5px] bg-red-400/30" />
                    <div className="absolute inset-x-0 top-12 h-[1.5px] bg-blue-300/30" />
                    <div className="absolute inset-x-0 top-18 h-[1.5px] bg-blue-300/30" />

                    <span className="text-4xl font-black tracking-wider text-zinc-950 dark:text-white block font-sans select-none relative z-10 pt-4">
                      {currentWordObj.displayWord}
                    </span>

                    {/* Stamp Feedback banner */}
                    <div className="absolute top-2 right-2 min-h-[28px] z-20">
                      {answerState === "correct" && (
                        <span className="inline-block py-1 px-2 border-2 border-black bg-green-400 text-black text-[9px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                          CORRECT!
                        </span>
                      )}
                      {answerState === "incorrect" && (
                        <span className="inline-block py-1 px-2 border-2 border-black bg-red-400 text-white text-[9px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                          WRONG!
                        </span>
                      )}
                      {answerState === "timeout" && (
                        <span className="inline-block py-1 px-2 border-2 border-black bg-yellow-400 text-black text-[9px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                          TIME OUT!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Character Substitution Reveal block */}
                {revealRule && (
                  <div className="w-full cartoon-border p-4 bg-cyan-50 dark:bg-cyan-950/20 text-xs font-bold rounded-xl text-center animate-in fade-in zoom-in duration-200 dark:border-amber-500">
                    <p className="uppercase text-[8px] font-black text-cyan-600 dark:text-amber-500 mb-1">
                      SPELLING DIALECT RESOLVED
                    </p>
                    <p className="text-zinc-800 dark:text-amber-250 font-mono">
                      <span className="font-black text-base font-sans">{revealRule.variantWord}</span> (Alternative Variant) ↔ <span className="font-black text-base font-sans">{revealRule.canonicalWord}</span> (Canonical base)
                    </p>
                    <p className="text-[9px] text-zinc-555 dark:text-zinc-400 font-black uppercase mt-1">
                      Rule swap: {revealRule.rule} ({revealRule.meaning})
                    </p>
                  </div>
                )}

                {/* Sorting bins */}
                <div className="w-full grid grid-cols-2 gap-6">
                  {/* Bin 1: Canonical */}
                  <button
                    disabled={answerState !== null}
                    onClick={() => handleSort(true)}
                    className="cartoon-border bin-hover py-4 bg-cyan-200 hover:bg-cyan-300 dark:bg-cyan-900/65 dark:text-white font-black uppercase tracking-wider text-xs rounded-xl active:translate-y-0.5 disabled:opacity-50 cursor-pointer text-center transition-transform"
                  >
                    📥 CANONICAL FILING
                  </button>
                  {/* Bin 2: Variant */}
                  <button
                    disabled={answerState !== null}
                    onClick={() => handleSort(false)}
                    className="cartoon-border bin-hover py-4 bg-yellow-200 hover:bg-yellow-300 dark:bg-amber-500/20 dark:text-amber-300 font-black uppercase tracking-wider text-xs rounded-xl active:translate-y-0.5 disabled:opacity-50 cursor-pointer text-center transition-transform border-black dark:border-amber-500"
                  >
                    🗑️ VARIANT TRASH
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Study Guide & Performance HUD (Col span 4) */}
          <div className="lg:col-span-4 space-y-6 w-full font-mono">
            {/* Real-time stats card */}
            <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
                🎮 SESSION PERFORMANCE
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <p className="text-2xl font-black text-black dark:text-white leading-none">{score}</p>
                  <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">SCORE</p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <p className="text-xl font-black text-amber-500 leading-none">🔥 {streak}</p>
                  <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">{currentMultiplier}X MULTIPLIER</p>
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
                  Orthographic Variant Standardization
                </h4>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Amharic orthography allows multiple letters with the same pronunciation (homophones like ሀ, ሐ, ኃ, ኻ). Smart normalization maps these various shapes to a single canonical standard to maximize search recall.
              </p>
              <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
                <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                  <li>Keep an eye on the falling notebook sheet containing a target word.</li>
                  <li>Quickly decide if the spelling is a canonical base standard or an orthographic variant.</li>
                  <li>Sort into the correct bin (Left: Canonical, Right: Alternative) before time runs out!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: DIFF CONSOLE ─────────────────────────────────────────
  const codeSnippet = `// Live Input Handler Example
const handleInputChange = async (val: string) => {
  const res = await fetch('/api/normalize', {
    method: 'POST',
    body: JSON.stringify({ text: val })
  });
  const { result } = await res.json();
  
  // Save result to DB as standard normalized string
  saveToDatabase(result);
};`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Smart Amharic Text Input & Spell-check
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          This module acts as a live &quot;spellcheck compiler&quot; that collapses spelling inconsistencies as the user types.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Interactive Text Input
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type Amharic text here..."
                />
              </div>
            </div>

            <CodeSnippet title="Pipeline Execution Code" code={codeSnippet} />
          </div>

          {/* Diff Highlighter Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Normalizer Diff Highlighting
                </span>
              </div>
              <div className="p-6">
                <DiffHighlighter original={rawText} modified={normalizedText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
