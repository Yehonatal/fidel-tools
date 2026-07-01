"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import GeezCharMap from "@/components/GeezCharMap";
import { Keyboard, ArrowRightLeft, AlertTriangle, Gamepad, Award, RefreshCw, CheckCircle2, XCircle, Heart, Star } from "lucide-react";

interface TransWord {
  geez: string;
  sera: string;
}

const GAME_WORDS: TransWord[] = [
  { geez: "ሰላም", sera: "selam" },
  { geez: "ጤና", sera: "tEna" },
  { geez: "ኢትዮጵያ", sera: "ityop'ya" },
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

export default function TransliteratePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ሰላም ጤና ይስጥልኝ።");
  const [result, setResult] = useState("");
  const [direction, setDirection] = useState<"to-sera" | "to-geez">("to-sera");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Transliteration Rush v2 states
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
    if (mode === "academic") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runTransliteration(text, direction);
      }, 450);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, direction, mode]);

  const toggleDirection = () => {
    const newDir = direction === "to-sera" ? "to-geez" : "to-sera";
    setDirection(newDir);
    setText(result || "");
    setResult(text);
  };

  // Live transliterate-as-you-type helper when round direction is "to-geez"
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
    }, 150); // Fast live transform
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
    // Alternate directions
    setRoundDirection(roundNum % 2 === 0 ? "to-sera" : "to-geez");

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
    const activeWord = GAME_WORDS[round % GAME_WORDS.length];
    
    // Set targets depending on the direction
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
        setScore((s) => Math.max(0, s - 10)); // Endless penalty
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
        const nextS = s + 10; // Partial points
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
        setScore((s) => Math.max(0, s - 10)); // Endless penalty
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
      if (liveTransliterateRef.current) clearTimeout(liveTransliterateRef.current);
    };
  }, []);

  if (mode === "fun") {
    const activeWord = GAME_WORDS[round % GAME_WORDS.length];
    const sourceDisplay = roundDirection === "to-sera" ? activeWord.geez : activeWord.sera;
    const targetDisplay = roundDirection === "to-sera" ? activeWord.sera : activeWord.geez;

    // ── FUN MODE: CARTOON TRANSLITERATION RUSH V2 ──────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#faf8f5] text-zinc-900 dark:bg-[#121110] dark:text-amber-100">
        <style dangerouslySetInnerHTML={{
          __html: `
            .cartoon-border {
              border: 3px solid #000;
              box-shadow: 4px 4px 0px 0px #000;
            }
            .dark .cartoon-border {
              border: 3px solid #f59e0b;
              box-shadow: 4px 4px 0px 0px #f59e0b;
            }
            .cartoon-card {
              border: 3px solid #000;
              box-shadow: 6px 6px 0px 0px #000;
            }
            .dark .cartoon-card {
              border: 3px solid #f59e0b;
              box-shadow: 6px 6px 0px 0px #f59e0b;
            }
            .boom-stamp {
              animation: boom-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes boom-in {
              0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
              100% { transform: scale(1) rotate(-5deg); opacity: 1; }
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
                  Match characters in both directions under fire. Typos get partial credit!
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
                <div className="text-5xl">🚀</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                    Start Transliteration?
                  </h3>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold font-mono">
                    Alternate between Ge'ez-to-ASCII and ASCII-to-Ge'ez typing. Classic Mode gives 3 lives. Endless Mode tracks session high scores!
                  </p>
                </div>

                {/* Mode selection buttons */}
                <div className="grid grid-cols-2 gap-4 border-2 border-black p-2 rounded-xl dark:border-amber-500 bg-zinc-550/5">
                  <button
                    onClick={() => setIsEndless(false)}
                    className={`py-2 text-[10px] font-black uppercase rounded-lg border-2 ${
                      !isEndless ? "bg-amber-400 border-black text-black" : "bg-transparent border-transparent text-zinc-500"
                    }`}
                  >
                    CLASSIC
                  </button>
                  <button
                    onClick={() => setIsEndless(true)}
                    className={`py-2 text-[10px] font-black uppercase rounded-lg border-2 ${
                      isEndless ? "bg-amber-400 border-black text-black" : "bg-transparent border-transparent text-zinc-500"
                    }`}
                  >
                    ENDLESS
                  </button>
                </div>

                {sessionHighScore > 0 && (
                  <div className="text-xs font-black text-black border-2 border-black bg-cyan-150 py-2 rounded dark:bg-cyan-950/20 dark:border-amber-500 dark:text-amber-400 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>SESSION BEST: {sessionHighScore} PTS</span>
                  </div>
                )}

                <button
                  onClick={startGame}
                  className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
                >
                  Start Arena
                </button>
              </div>
            ) : (
              <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-md w-full flex flex-col justify-between min-h-[440px] relative space-y-6">
                
                {/* Top stats HUD */}
                <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black">
                  <span>SCORE: {score} PTS</span>
                  {isEndless ? (
                    <span className="flex items-center gap-1 text-[9px] uppercase font-black text-amber-550 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current animate-pulse" /> ENDLESS MODE
                    </span>
                  ) : (
                    <div className="flex gap-1 items-center">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-4 h-4 ${i < lives ? "text-red-500 fill-red-500" : "text-zinc-200 dark:text-zinc-800"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Core word challenge box */}
                <div className="text-center space-y-4 flex-grow flex flex-col items-center justify-center relative">
                  <span className="text-[10px] text-zinc-550 dark:text-zinc-400 uppercase tracking-widest block font-black">
                    {roundDirection === "to-sera" ? "💻 CONVERT GE'EZ TO SERA" : "💻 CONVERT SERA TO GE'EZ"}
                  </span>

                  {/* Time progress bar */}
                  <div className="w-full max-w-[120px] h-3 bg-zinc-200 border-2 border-black rounded-full overflow-hidden relative dark:border-amber-500 bg-white dark:bg-black">
                    <div
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                      className="h-full bg-red-500 transition-all duration-300"
                    />
                  </div>

                  <span className="text-4xl font-black text-black dark:text-white block font-sans tracking-wide">
                    {sourceDisplay}
                  </span>

                  {/* Stamp feedback */}
                  <div className="absolute top-2 right-2 min-h-[28px]">
                    {feedback === "correct" && (
                      <span className="boom-stamp inline-block py-1.5 px-3 border-2 border-black bg-green-400 text-black text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                        EXACT MATCH!
                      </span>
                    )}
                    {feedback === "near-miss" && (
                      <span className="boom-stamp inline-block py-1.5 px-3 border-2 border-black bg-yellow-400 text-black text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                        NEAR-MISS!
                      </span>
                    )}
                    {feedback === "incorrect" && (
                      <span className="boom-stamp inline-block py-1.5 px-3 border-2 border-black bg-red-400 text-white text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                        WRONG!
                      </span>
                    )}
                    {feedback === "timeout" && (
                      <span className="boom-stamp inline-block py-1.5 px-3 border-2 border-black bg-zinc-400 text-black text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                        TIME OUT!
                      </span>
                    )}
                  </div>
                </div>

                {/* Input field */}
                <div className="w-full space-y-4">
                  <input
                    type="text"
                    autoFocus
                    disabled={feedback !== null}
                    value={userTyped}
                    onChange={(e) => handleLiveTransliterate(e.target.value)}
                    placeholder={roundDirection === "to-sera" ? "Type Latin ASCII..." : "Type keys (e.g. selam)..."}
                    className="w-full bg-white border-[3px] border-black focus:bg-amber-50 dark:bg-black dark:border-amber-500 dark:focus:border-amber-500 outline-none text-center py-3 text-sm rounded-xl text-black dark:text-amber-100 font-sans font-black shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-[1px_1px_0px_0px_#000] transition-all"
                  />

                  {feedback && (
                    <div className="cartoon-border p-3 bg-cyan-100 dark:bg-cyan-950/20 text-[10px] font-black text-center text-zinc-700 dark:text-amber-300 rounded-lg">
                      Target Answer: "{targetDisplay}"
                    </div>
                  )}

                  <button
                    disabled={feedback !== null}
                    onClick={() => checkAnswer(false)}
                    className="w-full py-3 bg-amber-400 border-[3px] border-black text-black font-black text-xs uppercase rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                  >
                    SUBMIT ANSWER
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
                  <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none font-black">SCORE</p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                  <p className="text-xl font-black text-amber-550 leading-none">⚙️ {isEndless ? "ENDLESS" : `LIVES: ${lives}`}</p>
                  <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none font-black">GAME STATUS</p>
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
                  ASCII Phonetic Transcription Maps
                </h4>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Inputting Ethiopic characters on standard hardware requires mapping keys phonetically. The System for Ethiopic Representation in ASCII (SERA) translates Unicode shapes to readable ASCII strings.
              </p>
              <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
                <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                  <li>A word is displayed in Ge'ez characters (or phonetic SERA transcription).</li>
                  <li>Type the exact corresponding transliteration translation.</li>
                  <li>Fast typing without spelling typos earns maximum bonus points!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: REF PANEL ─────────────────────────────────────────────
  const codeSnippet = `// API Transliteration call
const res = await fetch('/api/transliterate', {
  method: 'POST',
  body: JSON.stringify({ 
    text: "ሰላም", 
    direction: "to-sera" 
  })
});
const { result } = await res.json();
console.log(result); // "selam"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            SERA Bidirectional Phonetic Transliteration
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Convert Ethiopic Ge&apos;ez orthographic glyphs to phonetic Latin ASCII characters and vice versa.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Stream
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[120px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                />

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-900 pt-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    DIR: {direction === "to-sera" ? "Ge'ez → SERA" : "SERA → Ge'ez"}
                  </span>
                  <button
                    onClick={toggleDirection}
                    className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md hover:border-blue-500 hover:bg-blue-500/5 transition-all text-zinc-650 dark:text-zinc-350 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Transliterated Outputs
                </span>
              </div>
              <div className="p-6">
                {error && (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-xs font-semibold mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="p-5 bg-zinc-100/50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 text-blue-600 dark:text-emerald-400 font-sans font-bold leading-relaxed select-all">
                  {result || "-"}
                </div>
              </div>
            </div>

            {/* Character Reference Map */}
            <GeezCharMap />
          </div>
        </div>
      </div>
    </div>
  );
}
