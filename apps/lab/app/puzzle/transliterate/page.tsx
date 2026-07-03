"use client";

import React, { useState, useEffect, useRef } from "react";
import GeezCharMap from "@/components/GeezCharMap";
import { Keyboard, Heart, Star } from "lucide-react";

interface TransWord {
  geez: string;
  sera: string;
}

const GAME_WORDS: TransWord[] = [
  { geez: "ሰላም", sera: "selam" },
  { geez: "ጤና", sera: "tEna" },
  { geez: "አዲስ", sera: "addis" },
  { geez: "ትምህርት", sera: "temhert" },
  { geez: "ከተማ", sera: "katamA" },
  { geez: "ፍቅር", sera: "feqer" },
  { geez: "ወንድም", sera: "wandem" },
  { geez: "ደስታ", sera: "dastA" },
];

function getEditDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 1; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

export default function TransliteratePuzzlePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEndless, setIsEndless] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userTyped, setUserTyped] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "near-miss" | "incorrect" | "timeout" | null>(null);
  const [roundDirection, setRoundDirection] = useState<"to-sera" | "to-geez">("to-sera");

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveTransliterateRef = useRef<NodeJS.Timeout | null>(null);

  const handleLiveTransliterate = (rawAscii: string) => {
    setUserTyped(rawAscii);
    if (roundDirection === "to-sera") return; // No live mapping needed when writing English SERA

    if (liveTransliterateRef.current) clearTimeout(liveTransliterateRef.current);
    liveTransliterateRef.current = setTimeout(async () => {
      if (!rawAscii.trim()) return;
      try {
        const response = await fetch("/api/transliterate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawAscii, direction: "to-geez" }),
        });
        const data = await response.json();
        if (data.result) {
          setUserTyped(data.result);
        }
      } catch (err) {
        console.error(err);
      }
    }, 150);
  };

  const startGame = () => {
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setLives(3);
    setUserTyped("");
    setFeedback(null);
    startRound(0);
  };

  const startRound = (roundNum: number) => {
    setTimeLeft(10);
    setUserTyped("");
    setFeedback(null);
    setRoundDirection(roundNum % 2 === 0 ? "to-sera" : "to-geez");

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current!);
          checkAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkAnswer = (timedOut = false) => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    const activeWord = GAME_WORDS[round % GAME_WORDS.length];
    const target = roundDirection === "to-sera" ? activeWord.sera : activeWord.geez;
    const cleanUser = userTyped.trim();

    if (timedOut) {
      setFeedback("timeout");
      if (!isEndless) {
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            handleGameOver();
          } else {
            triggerNext();
          }
          return nextL;
        });
      } else {
        setScore((s) => Math.max(0, s - 10));
        triggerNext();
      }
      return;
    }

    const isExact = cleanUser.toLowerCase() === target.toLowerCase();
    const distance = getEditDistance(cleanUser.toLowerCase(), target.toLowerCase());
    const isNearMiss = !isExact && distance <= 1;

    if (isExact) {
      setFeedback("correct");
      setScore((s) => {
        const nextS = s + 20;
        if (nextS > sessionHighScore) setSessionHighScore(nextS);
        return nextS;
      });
      triggerNext();
    } else if (isNearMiss) {
      setFeedback("near-miss");
      setScore((s) => {
        const nextS = s + 10;
        if (nextS > sessionHighScore) setSessionHighScore(nextS);
        return nextS;
      });
      triggerNext();
    } else {
      setFeedback("incorrect");
      if (!isEndless) {
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            handleGameOver();
          } else {
            triggerNext();
          }
          return nextL;
        });
      } else {
        setScore((s) => Math.max(0, s - 10));
        triggerNext();
      }
    }
  };

  const handleGameOver = () => {
    setTimeout(() => {
      setIsPlaying(false);
    }, 1600);
  };

  const triggerNext = () => {
    setTimeout(() => {
      if (lives > 0 || isEndless) {
        setRound((prev) => prev + 1);
        startRound(round + 1);
      }
    }, 1600);
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const activeWord = GAME_WORDS[round % GAME_WORDS.length];

  return (
    <div className="font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#faf8f5] text-zinc-900 dark:bg-[#121110] dark:text-amber-100 animate-in fade-in duration-300">
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
          .arcade-card {
            border: 3.5px solid #000;
            box-shadow: 6px 6px 0px 0px #000;
          }
          .dark .arcade-card {
            border: 3.5px solid #f59e0b;
            box-shadow: 6px 6px 0px 0px #f59e0b;
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  TRANSLITERATION RUSH
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 7
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Race against the countdown clock to map back and forth between Latin SERA phonetics and Ge&apos;ez script!
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
              <div className="text-5xl">⚡</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Enter TransArena?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  You will have 10 seconds to convert words. Direction alternates! In SERA mode: type the phonetic representation (e.g. selam). In Ge&apos;ez mode: type the SERA and we will map it live!
                </p>
              </div>
              
              {/* Option: Endless Mode */}
              <div className="flex items-center justify-center gap-2 pt-2 text-xs font-bold font-mono">
                <input
                  type="checkbox"
                  id="endless-checkbox"
                  checked={isEndless}
                  onChange={(e) => setIsEndless(e.target.checked)}
                  className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="endless-checkbox" className="cursor-pointer select-none">
                  Enable Endless Sandbox (no lives limit, penalties only)
                </label>
              </div>

              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                  SESSION HIGHSCORE: {sessionHighScore} PTS
                </div>
              )}
              <button
                onClick={startGame}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000]"
              >
                Start Rush
              </button>
            </div>
          ) : (
            <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 max-w-md w-full flex flex-col justify-between min-h-[460px] relative overflow-hidden">
              {/* HUD */}
              <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black select-none">
                <span className="text-red-500 animate-pulse">⏰ TIME: {timeLeft}S</span>
                <span className="text-amber-600 dark:text-amber-500">SCORE: {score} PTS</span>
                {!isEndless ? (
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-4 h-4 ${i < lives ? "text-red-500 fill-red-500" : "text-zinc-200 dark:text-zinc-800"}`}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-400">∞ ENDLESS</span>
                )}
              </div>

              {/* Challenge word display */}
              <div className="my-8 text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-450 block">
                  {roundDirection === "to-sera" ? "TRANSLITERATE TO LATIN SERA" : "TRANSLITERATE TO GE'EZ"}
                </span>

                <div className="text-4xl font-extrabold text-black dark:text-white font-sans">
                  {roundDirection === "to-sera" ? activeWord.geez : activeWord.sera}
                </div>

                <div className="h-6 flex items-center justify-center">
                  {feedback === "correct" && (
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-bounce">
                      ✨ PERFECT MATCH! (+20 PTS)
                    </span>
                  )}
                  {feedback === "near-miss" && (
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest animate-shake">
                      ⚠️ NEAR MISS! (+10 PTS)
                    </span>
                  )}
                  {feedback === "incorrect" && (
                    <span className="text-xs font-black text-red-500 uppercase tracking-widest animate-shake">
                      ❌ INCORRECT MAP!
                    </span>
                  )}
                  {feedback === "timeout" && (
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                      ⌛ TIMEOUT OVER!
                    </span>
                  )}
                </div>
              </div>

              {/* Input console */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-black dark:border-amber-500">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userTyped}
                    onChange={(e) => handleLiveTransliterate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") checkAnswer(false);
                    }}
                    disabled={feedback !== null}
                    autoFocus
                    placeholder={
                      roundDirection === "to-sera" ? "Type SERA romanization (selam)..." : "Type SERA keys (selam)..."
                    }
                    className="flex-grow bg-zinc-50 border-2 border-black rounded-lg py-2.5 px-3 text-xs font-black text-black placeholder-zinc-450 focus:outline-hidden dark:bg-zinc-900 dark:text-white dark:border-amber-500"
                  />
                  <button
                    onClick={() => checkAnswer(false)}
                    disabled={feedback !== null}
                    className="px-5 bg-amber-400 border-[3px] border-black text-black text-xs font-black uppercase rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 shadow-[2px_2px_0px_0px_#000] cursor-pointer dark:border-amber-500"
                  >
                    Send
                  </button>
                </div>

                {/* Show correct answer during feedback */}
                {feedback !== null && (
                  <div className="p-3 bg-zinc-50 border-2 border-black rounded-lg text-center dark:bg-zinc-950 dark:border-amber-500 animate-in fade-in duration-200">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">EXPECTED COMPILER OUTPUT</p>
                    <p className="text-sm font-black mt-1 font-sans">
                      {roundDirection === "to-sera" ? activeWord.sera : activeWord.geez}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Character reference Map sheet (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <div className="border-b-2 border-dashed border-zinc-205 dark:border-zinc-800 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                📖 SERA REFERENCE
              </span>
              <h4 className="text-xs font-black text-black dark:text-white uppercase mt-1">
                System for Ethiopic Representation (SERA)
              </h4>
            </div>
            
            {/* Embed lightweight mapping matrix for study help */}
            <div className="text-[9.5px] leading-relaxed text-zinc-650 dark:text-zinc-400 font-semibold space-y-1">
              <p>• ሰ → se | ሱ → su | ሲ → si | ሳ → sa</p>
              <p>• ጤ → tE | ጦ → to | ጥ → t</p>
              <p>• ጵ → p&apos; | ጵያ → p&apos;ya</p>
              <p>• ቃ → qA | ቆ → qo | ቅ → q</p>
            </div>

            {/* Render full Ge'ez interactive matrix */}
            <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
              <GeezCharMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
