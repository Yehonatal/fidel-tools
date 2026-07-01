"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import GeezCharMap from "@/components/GeezCharMap";
import { Keyboard, ArrowRightLeft, AlertTriangle, Gamepad, Award, RefreshCw, CheckCircle2 } from "lucide-react";

const GAME_WORDS = [
  { geez: "ሰላም", sera: "selam" },
  { geez: "ጤና", sera: "tEna" },
  { geez: "ኢትዮጵያ", sera: "ityop'ya" },
  { geez: "ትምህርት", sera: "temhert" },
  { geez: "ከተማ", sera: "katamA" },
];

export default function TransliteratePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ሰላም ጤና ይስጥልኝ።");
  const [result, setResult] = useState("");
  const [direction, setDirection] = useState<"to-sera" | "to-geez">("to-sera");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Transliteration Rush states
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userTyped, setUserTyped] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const runTransliteration = async (inputVal: string, dir: "to-sera" | "to-geez") => {
    if (!inputVal.trim()) {
      setResult("");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/transliterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputVal, direction: dir }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError(err.message || "Transliteration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runTransliteration(text, direction);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, direction]);

  const toggleDirection = () => {
    const newDir = direction === "to-sera" ? "to-geez" : "to-sera";
    setDirection(newDir);
    setText(result || "");
    setResult(text);
  };

  // Game functions
  const startGame = () => {
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setUserTyped("");
    setFeedback(null);
    startRound(0);
  };

  const startRound = (roundNum: number) => {
    setTimeLeft(10);
    setUserTyped("");
    setFeedback(null);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current!);
          checkAnswer(true); // timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkAnswer = (timedOut = false) => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    const target = GAME_WORDS[round].sera;
    const isCorrect = !timedOut && userTyped.trim().toLowerCase() === target.toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 20);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
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
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  if (mode === "fun") {
    // ── FUN MODE: TRANSLITERATION RUSH ─────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 7: PHONETIC TRANSLITERATOR</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            TRANSLITERATION RUSH
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
            Type the correct SERA (ASCII representation) of the given Ge&apos;ez word!
          </p>
        </div>

        {!isPlaying ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full text-center space-y-6 shadow-inner">
            <div className="text-5xl">⌨️</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-amber-400 uppercase tracking-wider">
                Ready for the Rush?
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Match Ge&apos;ez characters to their correct Latin keyboard keys (e.g. for &quot;ሰላም&quot; type &quot;selam&quot;). You have 10 seconds per round.
              </p>
            </div>
            {score > 0 && (
              <div className="text-sm font-bold text-blue-600 dark:text-amber-400 border border-blue-500/20 dark:border-amber-500/20 bg-blue-500/5 dark:bg-amber-500/5 py-2 rounded">
                SCORE: {score} / 100 PTS
              </div>
            )}
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg active:scale-98 transition-all cursor-pointer font-mono"
            >
              Start Typing
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full flex flex-col items-center justify-between shadow-inner min-h-[380px] relative overflow-hidden">
            {/* Round info & timer */}
            <div className="w-full flex items-center justify-between border-b border-dashed border-zinc-250 dark:border-zinc-800/80 pb-3 text-xs font-bold text-zinc-450 dark:text-zinc-555">
              <span>ROUND {round + 1} / {GAME_WORDS.length}</span>
              <span className="text-blue-600 dark:text-orange-500">TIME: {timeLeft}S</span>
            </div>

            {/* Word details */}
            <div className="my-8 text-center space-y-4">
              <span className="text-[10px] text-zinc-450 dark:text-zinc-555 uppercase tracking-wider block">GE&apos;EZ SOURCE</span>
              <span className="text-4xl font-extrabold text-zinc-800 dark:text-white block font-sans">
                {GAME_WORDS[round].geez}
              </span>

              {/* Feedback */}
              <div className="min-h-[20px] text-center">
                {feedback === "correct" && (
                  <span className="text-xs font-bold text-emerald-650 dark:text-emerald-450 uppercase tracking-wider inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" /> CORRECT!
                  </span>
                )}
                {feedback === "incorrect" && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider">
                    INCORRECT! Target: {GAME_WORDS[round].sera}
                  </span>
                )}
              </div>
            </div>

            {/* Typing input */}
            <div className="w-full space-y-4">
              <input
                type="text"
                autoFocus
                disabled={feedback !== null}
                value={userTyped}
                onChange={(e) => setUserTyped(e.target.value)}
                placeholder="Type Latin SERA conversion..."
                className="w-full bg-white border-2 border-blue-500/50 focus:border-blue-600 dark:bg-zinc-950 dark:border-amber-500/55 dark:focus:border-amber-500 outline-none text-center py-3 text-sm rounded-lg text-zinc-800 dark:text-white font-sans font-bold"
              />
              <button
                disabled={feedback !== null}
                onClick={() => checkAnswer(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 text-white dark:text-black font-bold text-xs uppercase rounded-lg cursor-pointer"
              >
                SUBMIT
              </button>
            </div>

            {/* score info */}
            <div className="w-full mt-6 pt-3 border-t border-dashed border-zinc-250 dark:border-zinc-800/80 text-[10px] font-bold text-zinc-450 dark:text-zinc-555 text-left">
              SCORE: {score} PTS
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: SIDE-BY-SIDE CONSOLE ──────────────────────────────────
  const codeSnippet = `import { Pipeline } from '@fidel-tools/core'
import amPack from '@fidel-tools/lang-am'

const nlp = new Pipeline(amPack)

// 1. Ge'ez unicode to SERA ASCII
const sera = nlp.feligTransliterate("ሰላም", "am") // -> "selam"

// 2. SERA ASCII to Ge'ez unicode
const geez = nlp.feligTransliterate("selam", "en") // -> "ሰላም"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Ge&apos;ez ↔ SERA Phonetic Transliteration
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Convert Ge&apos;ez Unicode characters into their phonetic ASCII equivalents (SERA) and vice versa.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main pane */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-3">
              <span className="text-[10px] font-mono font-bold text-zinc-405 dark:text-zinc-555 uppercase tracking-widest">
                Direction: {direction === "to-sera" ? "Ge'ez ➔ SERA ASCII" : "SERA ASCII ➔ Ge'ez"}
              </span>
              <button
                onClick={toggleDirection}
                className="inline-flex items-center gap-1 text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500 cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Reverse</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="premium-card flex flex-col overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Source Text
                  </span>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  />
                </div>
              </div>

              {/* Output Result */}
              <div className="premium-card flex flex-col overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Transliteration Result
                  </span>
                  {loading && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
                </div>
                <div className="p-4 flex-grow bg-blue-500/5 dark:bg-blue-500/10 flex flex-col justify-between">
                  <p className="text-sm font-sans font-bold text-blue-600 dark:text-sky-400 leading-relaxed select-all">
                    {result || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Character matrix */}
            <GeezCharMap />
          </div>

          {/* Documentation */}
          <div className="lg:col-span-1 space-y-6">
            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

        </div>
      </div>
    </div>
  );
}
