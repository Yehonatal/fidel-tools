"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import DiffHighlighter from "@/components/DiffHighlighter";
import { Type, Gamepad, Play, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const GAME_WORDS = [
  { word: "ሰላም", normalized: true, reason: "Canonical form for 'peace'" },
  { word: "ሠላም", normalized: false, reason: "Alternative spelling (uses character ሠ instead of ሰ)" },
  { word: "ሀኪም", normalized: true, reason: "Canonical form for 'doctor'" },
  { word: "ሐኪም", normalized: false, reason: "Alternative spelling (uses character ሐ instead of ሀ)" },
  { word: "አለም", normalized: true, reason: "Canonical form for 'world'" },
  { word: "ዓለም", normalized: false, reason: "Alternative spelling (uses character ዓ instead of አ)" },
  { word: "ፀሐይ", normalized: false, reason: "Alternative spelling (uses characters ፀ and ሐ)" },
  { word: "ጸሀይ", normalized: true, reason: "Canonical form for 'sun'" },
  { word: "ንጉስ", normalized: true, reason: "Canonical form for 'king'" },
  { word: "ንጉሥ", normalized: false, reason: "Alternative spelling (uses character ሥ instead of ስ)" },
];

export default function NormalizePage() {
  const { mode } = useLabMode();
  const [rawText, setRawText] = useState("ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ወደ ት/ቤት ሄደ።");
  const [normalizedText, setNormalizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "incorrect" | "timeout" | null>(null);
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performNormalization(rawText);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawText]);

  // Start Game
  const startGame = () => {
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setAnswerFeedback(null);
    startRound(0);
  };

  const startRound = (roundNum: number) => {
    setTimeLeft(3);
    setAnswerFeedback(null);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(false, true); // Timeout counts as incorrect/skip
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (userGuessedCanonical: boolean, isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isTimeout) {
      setAnswerFeedback("timeout");
    } else {
      const isCorrect = userGuessedCanonical === GAME_WORDS[round].normalized;
      if (isCorrect) {
        setScore((prev) => prev + 10);
        setAnswerFeedback("correct");
      } else {
        setAnswerFeedback("incorrect");
      }
    }

    setTimeout(() => {
      if (round < GAME_WORDS.length - 1) {
        setRound((prev) => prev + 1);
        startRound(round + 1);
      } else {
        setIsPlaying(false);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (mode === "fun") {
    // ── FUN MODE: NORMALIZE OR NOT GAME ────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-600 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 3: ORTHOGRAPHY GUESSER</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            NORMALIZE OR NOT
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
            Is the word in its canonical normalized form, or an alternative spelling homophone?
          </p>
        </div>

        {!isPlaying ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full text-center space-y-6 shadow-inner">
            <div className="text-5xl">🎯</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-amber-400 uppercase tracking-wider">
                Ready to guess?
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                You have 3 seconds per word. Choose whether the word represents the canonical base form used in Fidel indexing or not.
              </p>
            </div>
            {score > 0 && (
              <div className="text-sm font-bold text-blue-600 dark:text-amber-400 border border-blue-500/20 dark:border-amber-500/20 bg-blue-500/5 dark:bg-amber-500/5 py-2 rounded">
                PREVIOUS SCORE: {score} / 100 PTS
              </div>
            )}
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg active:scale-98 transition-all cursor-pointer font-mono"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full flex flex-col items-center justify-between shadow-inner min-h-[360px] relative overflow-hidden">
            {/* Round info & timer */}
            <div className="w-full flex items-center justify-between border-b border-dashed border-zinc-250 dark:border-zinc-800/80 pb-3">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">
                ROUND {round + 1} / {GAME_WORDS.length}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-orange-500">
                TIMER: {timeLeft}S
              </span>
            </div>

            {/* Main Word Card */}
            <div className="my-8 text-center space-y-4">
              <span className="text-5xl font-bold tracking-tight text-zinc-800 dark:text-white block font-sans">
                {GAME_WORDS[round].word}
              </span>

              {/* Feedback overlay */}
              <div className="min-h-[20px]">
                {answerFeedback === "correct" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                  </span>
                )}
                {answerFeedback === "incorrect" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect!
                  </span>
                )}
                {answerFeedback === "timeout" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-orange-500 animate-pulse">
                    ⏱️ TIME OUT!
                  </span>
                )}
              </div>
            </div>

            {/* Answer choice buttons */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                disabled={answerFeedback !== null}
                onClick={() => handleAnswer(true)}
                className="py-3 border-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 font-bold uppercase tracking-wider text-xs rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                Canonical
              </button>
              <button
                disabled={answerFeedback !== null}
                onClick={() => handleAnswer(false)}
                className="py-3 border-2 border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-500 font-bold uppercase tracking-wider text-xs rounded-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                Alternative
              </button>
            </div>

            {/* Streak scorecard */}
            <div className="w-full mt-6 pt-3 border-t border-dashed border-zinc-250 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-bold text-zinc-450 dark:text-zinc-550">
              <span>SCORE: {score} PTS</span>
              <span>STREAK: {score / 10}</span>
            </div>
          </div>
        )}
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
