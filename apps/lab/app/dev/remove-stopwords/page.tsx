"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { X, Gamepad, Play, Award, RefreshCw, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

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

export default function RemoveStopwordsPage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("እሱ እና ጓደኞቹ በከተማው ውስጥ ወደሚገኘው ትልቅ ት/ቤት አብረው ሄዱ።");
  const [cleanText, setCleanText] = useState("");
  const [loading, setLoading] = useState(false);

  // Swipe Radar Game States
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

  const runStopwords = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/remove-stopwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setCleanText(data.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runStopwords(text);
    }
  }, [text, mode]);

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

  if (mode === "fun") {
    const currentWord = STREAM_WORDS[currentIndex];
    const mult = Math.min(5, Math.floor(streak / 3) + 1);

    // ── 10/10 FUN MODE: SWIPE RADAR & BUBBLING BEAKER ──────────────────────
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
                    SWIPE RADAR
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                    PREVIOUS SCORE: {score} PTS
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
                >
                  Start Swiping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch animate-in fade-in">
                
                {/* Left Column: Bubbling Noise Beaker */}
                <div className="md:col-span-1 flex flex-col items-center justify-between cartoon-border rounded-2xl p-6 bg-white dark:bg-[#1c1a19] dark:border-amber-500">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">NOISE LEVEL</span>
                  
                  {/* Beaker Container */}
                  <div className="relative w-24 h-56 border-[4px] border-black dark:border-amber-500 rounded-b-3xl overflow-hidden bg-zinc-55 dark:bg-black mt-4 flex flex-col justify-end shadow-inner">
                    {/* Tick marks */}
                    <div className="absolute inset-y-0 right-2 flex flex-col justify-between text-[7px] font-black py-4 text-zinc-400 select-none z-10">
                      <span>BOIL 💥</span>
                      <span>80%</span>
                      <span>60%</span>
                      <span>40%</span>
                      <span>20%</span>
                      <span>SAFE 🟢</span>
                    </div>

                    {/* Bubbling liquid */}
                    <div
                      style={{ height: `${noiseLevel}%` }}
                      className={`boiling-fluid w-full border-t-4 border-black transition-all duration-350 ${
                        noiseLevel >= 75
                          ? "bg-red-500 dark:bg-red-950"
                          : noiseLevel >= 50
                          ? "bg-yellow-400 dark:bg-yellow-950/50"
                          : "bg-emerald-400 dark:bg-emerald-950/50"
                      }`}
                    />
                  </div>

                  <div className="text-center mt-4">
                    <span className="text-2xl font-black block text-black dark:text-amber-400">{noiseLevel}%</span>
                    <span className="text-[9px] font-bold text-zinc-550 uppercase">NOISE VOLUME</span>
                  </div>
                </div>

                {/* Right Column: Streaming radar target & decision buttons */}
                <div className="md:col-span-2 flex flex-col justify-between gap-6">
                  
                  {/* Radar Area */}
                  <div className="cartoon-border rounded-2xl p-8 bg-zinc-100/50 dark:bg-black dark:border-amber-500 flex-grow flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
                    <span className="absolute top-2 left-3 text-[9px] font-black text-zinc-550 uppercase">
                      RADAR SIGNAL ({currentIndex + 1}/{STREAM_WORDS.length})
                    </span>

                    {/* The word bubble target */}
                    {!gameOver && !gameWin && (
                      <div className="radar-bubble px-8 py-5 rounded-3xl bg-white dark:bg-[#1c1a19] text-3xl font-black text-black dark:text-white tracking-wider z-10 border-2 border-black dark:border-amber-500 select-none">
                        {currentWord.text}
                      </div>
                    )}

                    {/* Feedback Splash Bubble */}
                    {feedback && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200 z-20">
                        <span className={`text-3xl font-black uppercase tracking-widest rotate-6 ${
                          feedback === "miss" ? "text-red-550" : "text-green-600"
                        }`}>
                          {feedback === "miss" ? "NOISE CLOG!" : feedback === "keep" ? "SAVED!" : "CLEANED!"}
                        </span>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-2">
                          Reason: {currentWord.reason}
                        </p>
                      </div>
                    )}

                    {/* Time Indicator bar */}
                    {!feedback && !gameOver && !gameWin && (
                      <div className="absolute bottom-0 inset-x-0 h-2 bg-zinc-200 dark:bg-zinc-800">
                        <div
                          style={{ width: `${(timeLeft / 2.5) * 100}%` }}
                          className="h-full bg-amber-500 transition-all duration-100"
                        />
                      </div>
                    )}

                    {/* Game over / Victory overlays */}
                    {gameOver && (
                      <div className="text-center space-y-4 animate-in zoom-in-75 duration-200">
                        <span className="text-5xl">💥</span>
                        <h3 className="text-2xl font-black text-red-555 uppercase">LAB OVERFLOW!</h3>
                        <p className="text-xs font-semibold text-zinc-550">The noise beaker boiled over and clogged the parser!</p>
                        <button
                          onClick={startGame}
                          className="px-5 py-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-xs font-black uppercase cursor-pointer dark:bg-zinc-900"
                        >
                          TRY AGAIN
                        </button>
                      </div>
                    )}

                    {gameWin && (
                      <div className="text-center space-y-4 animate-in zoom-in-75 duration-200">
                        <span className="text-5xl">🏆</span>
                        <h3 className="text-2xl font-black text-green-600 dark:text-amber-400 uppercase">SIGNAL CLEANSED!</h3>
                        <p className="text-xs font-semibold text-zinc-550 font-black">All stopwords filtered. Perfect linguistic signal!</p>
                        <button
                          onClick={startGame}
                          className="px-5 py-2.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-xs font-black uppercase cursor-pointer dark:bg-zinc-900"
                        >
                          REPLAY
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Swipe/Decision Buttons */}
                  {!gameOver && !gameWin && (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        disabled={feedback !== null}
                        onClick={() => handleDecision(false)}
                        className="cartoon-border py-4 bg-red-200 hover:bg-red-300 dark:bg-red-950/60 dark:hover:bg-red-955 text-black dark:text-white font-black uppercase text-xs rounded-xl active:translate-y-0.5 disabled:opacity-50 cursor-pointer text-center border-black"
                      >
                        🗑️ CUT STOPWORD
                      </button>
                      <button
                        disabled={feedback !== null}
                        onClick={() => handleDecision(true)}
                        className="cartoon-border py-4 bg-cyan-200 hover:bg-cyan-300 dark:bg-cyan-900/60 dark:hover:bg-cyan-900 text-black dark:text-white font-black uppercase text-xs rounded-xl active:translate-y-0.5 disabled:opacity-50 cursor-pointer text-center border-black"
                      >
                        💾 KEEP SIGNAL
                      </button>
                    </div>
                  )}
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
                  <p className="text-2xl font-black text-amber-500 leading-none">🔥 {streak}</p>
                  <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">{mult}X MULTIPLIER</p>
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
                  Semantic Noise Filtering
                </h4>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Common grammatical particles (conjunctions, prepositions, copulas) carry minimal keyword meaning in search indexing. Stripping them focuses compute on semantic nouns and verbs.
              </p>
              <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
                <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                  <li>Words will pop up on the radar sweep.</li>
                  <li>Swipe/Click left to discard grammatical stopwords, or swipe/click right to preserve high-signal terms.</li>
                  <li>Protect your beaker! Incorrect swiping pours noisy liquid into the beaker; letting it overflow triggers a system purge.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: BEFORE/AFTER FILTER ──────────────────────────────────
  const codeSnippet = `// Stopword Removal API Call
const res = await fetch('/api/remove-stopwords', {
  method: 'POST',
  body: JSON.stringify({ text: rawText })
});
const { result } = await res.json();
console.log(result); // Text string with grammatical stopwords filtered`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <X className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Stopword Extraction Console
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Strip highly frequent syntactic connectors (e.g. እና, በ, ከ) to isolate high-entropy keyword terms for retrieval indexing.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Stopword Filtering Testbed
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type Amharic text..."
                />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-955/60 border-t border-zinc-200 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={() => runStopwords(text)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer font-mono"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            <CodeSnippet title="Pipeline Step Node Example" code={codeSnippet} />
          </div>

          {/* Results Comparison Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Stopword Stripped Results
                </span>
              </div>
              <div className="p-6 space-y-6 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider mb-1">Before Filter</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-955 rounded-lg text-zinc-800 dark:text-zinc-300 font-medium select-all leading-relaxed">
                    {text}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider mb-1">After Filter</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-955 rounded-lg text-blue-600 dark:text-emerald-400 font-bold select-all leading-relaxed">
                    {cleanText || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
