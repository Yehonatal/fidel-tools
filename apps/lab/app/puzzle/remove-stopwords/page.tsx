"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Award, RefreshCw, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

interface WordItem {
  text: string;
  isStopword: boolean;
  reason: string;
}

const STREAM_WORDS: WordItem[] = [
  { text: "እና", isStopword: true, reason: "Conjunction ('and')" },
  { text: "ልጆች", isStopword: false, reason: "Noun ('children')" },
  { text: "ወደ", isStopword: true, reason: "Preposition ('to')" },
  { text: "ቤት", isStopword: false, reason: "Noun ('house')" },
  { text: "በመሆኑም", isStopword: true, reason: "Conjunction ('therefore')" },
  { text: "ከተማ", isStopword: false, reason: "Noun ('city')" },
  { text: "ስለዚህ", isStopword: true, reason: "Conjunction ('so')" },
  { text: "ትምህርት", isStopword: false, reason: "Noun ('education')" },
  { text: "ከ", isStopword: true, reason: "Preposition ('from')" },
  { text: "ምግብ", isStopword: false, reason: "Noun ('food')" },
  { text: "ወይም", isStopword: true, reason: "Conjunction ('or')" },
  { text: "ጸሀይ", isStopword: false, reason: "Noun ('sun')" },
  { text: "ጋር", isStopword: true, reason: "Preposition ('with')" },
  { text: "መጽሐፍ", isStopword: false, reason: "Noun ('book')" },
  { text: "በ", isStopword: true, reason: "Preposition ('by/in')" },
  { text: "እናት", isStopword: false, reason: "Noun ('mother')" },
];

export default function RemoveStopwordsPuzzlePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2.5);
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [feedback, setFeedback] = useState<"keep" | "cut" | "miss" | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setNoiseLevel(0);
    setGameOver(false);
    setGameWin(false);
    setFeedback(null);
    startWordRound(0);
  };

  const startWordRound = (idx: number) => {
    setTimeLeft(2.5);
    setFeedback(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    progressRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(progressRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const handleTimeout = () => {
    setFeedback("miss");
    setStreak(0);
    setNoiseLevel((prev) => {
      const nextNoise = prev + 25;
      if (nextNoise >= 100) {
        setGameOver(true);
        if (progressRef.current) clearInterval(progressRef.current);
      }
      return Math.min(100, nextNoise);
    });

    triggerNextStep();
  };

  const handleDecision = (userSelectedKeep: boolean) => {
    if (feedback !== null || gameOver || gameWin) return;
    if (progressRef.current) clearInterval(progressRef.current);

    const currentWord = STREAM_WORDS[currentIndex];
    const isCorrect = (userSelectedKeep && !currentWord.isStopword) || (!userSelectedKeep && currentWord.isStopword);

    if (isCorrect) {
      setFeedback(userSelectedKeep ? "keep" : "cut");
      setStreak((prev) => prev + 1);
      const mult = Math.min(5, Math.floor((streak + 1) / 3) + 1);
      setScore((prev) => prev + 10 * mult);
    } else {
      setFeedback("miss");
      setStreak(0);
      setNoiseLevel((prev) => {
        const nextNoise = prev + 25;
        if (nextNoise >= 100) {
          setGameOver(true);
        }
        return Math.min(100, nextNoise);
      });
    }

    triggerNextStep();
  };

  const triggerNextStep = () => {
    setTimeout(() => {
      if (noiseLevel >= 100) {
        setGameOver(true);
        return;
      }
      if (currentIndex < STREAM_WORDS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        startWordRound(currentIndex + 1);
      } else {
        setGameWin(true);
        if (progressRef.current) clearInterval(progressRef.current);
      }
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const currentWord = STREAM_WORDS[currentIndex];
  const mult = Math.min(5, Math.floor(streak / 3) + 1);

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
          .radar-bubble {
            border: 3.5px solid #000;
            box-shadow: 4px 4px 0px 0px #000;
            animation: radar-float 1.5s ease-in-out infinite alternate;
          }
          .dark .radar-bubble {
            border: 3.5px solid #f59e0b;
            box-shadow: 4px 4px 0px 0px #f59e0b;
          }
          @keyframes radar-float {
            0% { transform: scale(1) translateY(0); }
            100% { transform: scale(1.05) translateY(-5px); }
          }
          .boiling-fluid {
            background-image: radial-gradient(circle, rgba(16,185,129,0.3) 10%, transparent 10%);
            background-size: 14px 14px;
            transition: height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <X className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  SIGNAL EXTRACTOR
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 5
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Extract semantic signal words and sweep stopwords before the beaker overflows!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Column Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Column: Interactive Game Area (Col span 8) */}
        <div className="lg:col-span-8 w-full bg-white/40 dark:bg-zinc-900/10 p-4 md:p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[480px]">
          {!isPlaying ? (
            <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-md w-full text-center space-y-6">
              <div className="text-5xl">📡</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Start Swiping Signal?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold font-mono">
                  Nouns and verbs must be kept. Grammar stopwords (conjunctions/prepositions) must be cut. Unsorted or wrong decisions fill the Noise Beaker. Reach 100% noise and the lab explodes!
                </p>
              </div>
              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                  LAST SCORE: {score} PTS
                </div>
              )}
              <button
                onClick={startGame}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b]"
              >
                Start Game
              </button>
            </div>
          ) : gameOver ? (
            <div className="cartoon-border rounded-xl bg-red-100 text-red-900 border-black p-8 max-w-md w-full text-center space-y-6 dark:bg-red-950/20 dark:text-red-300 dark:border-amber-500">
              <div className="text-5xl">💥</div>
              <h3 className="text-lg font-black uppercase tracking-wider">LAB EXPLODED!</h3>
              <p className="text-xs font-semibold leading-relaxed">
                The beaker filled with grammatical noise because of too many misses and incorrect swipes. Try again!
              </p>
              <button
                onClick={startGame}
                className="w-full py-3 bg-red-650 text-white font-black border-2 border-black rounded-lg uppercase text-xs active:translate-y-0.5 cursor-pointer"
              >
                Re-initialize Beaker
              </button>
            </div>
          ) : gameWin ? (
            <div className="cartoon-border rounded-xl bg-emerald-100 text-emerald-950 border-black p-8 max-w-md w-full text-center space-y-6 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-amber-500">
              <div className="text-5xl">🏆</div>
              <h3 className="text-lg font-black uppercase tracking-wider">CLEANSING COMPLETE!</h3>
              <p className="text-xs font-semibold leading-relaxed">
                All words have been successfully processed. The noise index has been minimized!
              </p>
              <div className="text-sm font-black border-2 border-black py-2 rounded bg-white dark:bg-zinc-900 text-black dark:text-white dark:border-amber-500">
                SCORE: {score} PTS
              </div>
              <button
                onClick={startGame}
                className="w-full py-3 bg-emerald-500 text-white font-black border-2 border-black rounded-lg uppercase text-xs active:translate-y-0.5 cursor-pointer"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="w-full space-y-8 flex flex-col items-center select-none">
              
              {/* Radar Word display */}
              <div className="radar-bubble rounded-3xl bg-cyan-50 dark:bg-zinc-900 dark:border-amber-500 max-w-xs w-full py-10 px-6 text-center relative flex flex-col items-center justify-center min-h-[160px]">
                {/* Horizontal radar sweep line */}
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400 dark:bg-amber-500 opacity-30 top-1/2 -translate-y-1/2 animate-pulse" />

                <span className="text-4xl font-extrabold tracking-wide text-zinc-950 dark:text-white font-sans relative z-10">
                  {currentWord.text}
                </span>

                {/* Feedback banner */}
                <div className="absolute top-2 right-2 min-h-[22px]">
                  {feedback === "keep" && (
                    <span className="text-[8px] font-black border-2 border-black px-2 py-0.5 rounded-lg bg-green-400 text-black">
                      SIGNAL KEPT 👍
                    </span>
                  )}
                  {feedback === "cut" && (
                    <span className="text-[8px] font-black border-2 border-black px-2 py-0.5 rounded-lg bg-red-400 text-white">
                      NOISE SWEEPED 🧹
                    </span>
                  )}
                  {feedback === "miss" && (
                    <span className="text-[8px] font-black border-2 border-black px-2 py-0.5 rounded-lg bg-yellow-400 text-black">
                      MISSED / OUT ❌
                    </span>
                  )}
                </div>

                <span className="absolute bottom-2 left-3 text-[8px] font-black text-zinc-400 uppercase tracking-wider">
                  timer: {timeLeft.toFixed(1)}s
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                <button
                  onClick={() => handleDecision(false)}
                  disabled={feedback !== null}
                  className="cartoon-border p-5 rounded-2xl bg-red-200 text-red-900 border-black font-black cursor-pointer active:scale-95 disabled:opacity-40 transition-all text-center dark:bg-red-950/20 dark:text-red-300 dark:border-amber-500"
                >
                  <p className="text-lg">SWEEP / CUT</p>
                  <p className="text-[9px] font-bold opacity-75 mt-1 uppercase tracking-wider">Stopword (Noise)</p>
                </button>

                <button
                  onClick={() => handleDecision(true)}
                  disabled={feedback !== null}
                  className="cartoon-border p-5 rounded-2xl bg-emerald-200 text-emerald-900 border-black font-black cursor-pointer active:scale-95 disabled:opacity-40 transition-all text-center dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-amber-500"
                >
                  <p className="text-lg">KEEP / EXTRACT</p>
                  <p className="text-[9px] font-bold opacity-75 mt-1 uppercase tracking-wider">Signal Word</p>
                </button>
              </div>

              {/* Graphetic analysis metadata */}
              {feedback !== null && (
                <div className="cartoon-border rounded-xl p-4 bg-yellow-50 dark:bg-zinc-900/40 max-w-md w-full animate-in zoom-in-95 duration-200 dark:border-amber-500">
                  <span className="text-[8px] font-black uppercase text-amber-800 dark:text-amber-400 block mb-1">STOPWORDS VERDICT</span>
                  <p className="text-[11px] font-semibold leading-relaxed">
                    Word <span className="font-bold font-sans">&quot;{currentWord.text}&quot;</span> is categorized as{" "}
                    <span className="font-black text-blue-600 dark:text-sky-400">{currentWord.isStopword ? "Stopword" : "Signal Word"}</span>. 
                    ({currentWord.reason})
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Column: Noise Beaker & HUD (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          {/* Noise Beaker */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🧪 NOISE INDEX BEAKER
            </h3>
            
            {/* Visual Beaker Glass container */}
            <div className="relative w-28 h-40 border-4 border-t-0 border-black dark:border-amber-500 rounded-b-xl mx-auto overflow-hidden bg-zinc-100/50 dark:bg-zinc-950 flex flex-col justify-end">
              {/* Boiling fluid height linked to noise level */}
              <div
                style={{ height: `${noiseLevel}%` }}
                className="w-full bg-emerald-500 dark:bg-amber-500/30 boiling-fluid"
              />
              
              {/* Overlay lines */}
              <div className="absolute inset-y-0 left-2 w-0.5 bg-black/10 dark:bg-amber-500/10 flex flex-col justify-between py-2 text-[8px] font-bold text-zinc-400">
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
              </div>

              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black select-none z-10">
                {noiseLevel}%
              </span>
            </div>
          </div>

          {/* HUD Monitor */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-550 tracking-wider">
              🎮 MONITORS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}</p>
                <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">SCORE</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-500 leading-none">{streak}</p>
                <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">STREAK</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
