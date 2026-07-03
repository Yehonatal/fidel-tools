"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, Heart } from "lucide-react";

interface StemCluster {
  id: number;
  root: string;
  meaning: string;
  inflections: string[];
}

const CLUSTERS_DATA: StemCluster[] = [
  {
    id: 1,
    root: "ልጅ",
    meaning: "child",
    inflections: ["ልጆች", "ልጆቻችን", "ልጅነቴ", "ልጅቷ"],
  },
  {
    id: 2,
    root: "ቤት",
    meaning: "house",
    inflections: ["ቤቶች", "ቤቶቻችን", "ቤታቸው", "ቤትዎ"],
  },
  {
    id: 3,
    root: "ትምህርት",
    meaning: "education",
    inflections: ["ትምህርቶች", "በትምህርት", "ትምህርታችን", "ትምህርቷ"],
  },
  {
    id: 4,
    root: "ነገር",
    meaning: "thing/matter",
    inflections: ["ነገሮች", "በነገራችን", "ነገሩ", "ነገራቸው"],
  },
];

export default function StemPuzzlePage() {
  const [loading, setLoading] = useState(false);

  // Root Cluster Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordY, setWordY] = useState(0); // 0 to 100
  const [typedStem, setTypedStem] = useState("");
  const [answerState, setAnswerState] = useState<"correct" | "incorrect" | null>(null);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCluster = CLUSTERS_DATA[currentIdx];

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setLives(3);
    setWordY(0);
    setTypedStem("");
    setAnswerState(null);
    startClusterRound(0);
  };

  const startClusterRound = (idx: number) => {
    setWordY(0);
    setTypedStem("");
    setAnswerState(null);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);

    gameTimerRef.current = setInterval(() => {
      setWordY((prev) => {
        if (prev >= 85) {
          clearInterval(gameTimerRef.current!);
          handleMiss();
          return 85;
        }
        return prev + 2.5; // Slide down gradually
      });
    }, 120);
  };

  const handleMiss = () => {
    setAnswerState("incorrect");
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setIsPlaying(false);
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      } else {
        triggerNextCluster();
      }
      return nextLives;
    });
  };

  const handleZapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answerState !== null || !isPlaying) return;

    setLoading(true);
    try {
      // API call to verify the typed stem actually matches the expected base stem
      const response = await fetch("/api/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: [typedStem] }),
      });
      const data = await response.json();
      const verifiedStem = data.stems?.[0]?.stem || typedStem;
      const isCorrect = verifiedStem.trim() === currentCluster.root.trim();

      if (isCorrect) {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        setAnswerState("correct");
        // Clear bonus scales with size of cluster: size 4 clears give 120 pts
        const bonus = currentCluster.inflections.length * 30;
        setScore((prev) => prev + bonus);
        triggerNextCluster();
      } else {
        setTypedStem("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerNextCluster = () => {
    setTimeout(() => {
      if (lives > 0) {
        const nextIdx = (currentIdx + 1) % CLUSTERS_DATA.length;
        setCurrentIdx(nextIdx);
        startClusterRound(nextIdx);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  return (
    <div className="font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#faf8f5] text-zinc-900 dark:bg-[#121110] dark:text-amber-100 animate-in fade-in duration-300">
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
          .cloud-bubble {
            border: 3px solid #000;
            box-shadow: 5px 5px 0px 0px #000;
            border-radius: 40px;
          }
          .dark .cloud-bubble {
            border: 3px solid #f59e0b;
            box-shadow: 5px 5px 0px 0px #f59e0b;
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  ROOT CLUSTER
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 6
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Identify the single shared base root of the falling inflected word cloud and zap it!
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
              <div className="text-5xl">☁️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Enter Root Arena?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  Clouds containing multiple inflected words sharing a stem (e.g. ቤቶች, ቤቶቻችን) will fall. Type the base root (e.g. ቤት) to pop the whole cluster!
                </p>
              </div>
              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                  SCORE: {score} PTS
                </div>
              )}
              <button
                onClick={startGame}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000]"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 max-w-md w-full flex flex-col justify-between min-h-[460px] relative overflow-hidden">
              {/* HUD */}
              <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black select-none">
                <span>SCORE: {score} PTS</span>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4.5 h-4.5 ${i < lives ? "text-red-500 fill-red-500 animate-pulse" : "text-zinc-200 dark:text-zinc-800"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Falling track container */}
              <div className="relative flex-grow w-full border-[3px] border-black bg-amber-50/30 dark:bg-black/40 rounded-xl my-4 overflow-hidden min-h-[260px] dark:border-amber-500 select-none">
                {/* Falling Word Cloud */}
                <div
                  className="absolute left-0 right-0 flex flex-wrap gap-2 justify-center transition-all duration-150 ease-linear"
                  style={{ top: `${wordY}%`, transform: "translateY(-50%)" }}
                >
                  {answerState === "correct" ? (
                    <span className="inline-block py-2 px-4 border-[3px] border-black bg-green-400 text-black text-xl font-black rotate-12 rounded shadow-[3px_3px_0px_0px_#000] uppercase">
                      POOF! ZAPPED
                    </span>
                  ) : answerState === "incorrect" ? (
                    <span className="inline-block py-2 px-4 border-[3px] border-black bg-red-400 text-white text-xl font-black -rotate-12 rounded shadow-[3px_3px_0px_0px_#000] uppercase">
                      CRASHED!
                    </span>
                  ) : (
                    <div className="cloud-bubble p-4 bg-cyan-100 dark:bg-cyan-900/60 dark:border-amber-500 text-black flex flex-wrap gap-2 justify-center max-w-[280px]">
                      {currentCluster.inflections.map((word, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 border-2 border-black bg-white text-black text-xs font-black font-sans dark:bg-zinc-900 dark:text-white dark:border-amber-500 shadow-[1px_1px_0px_0px_#000]"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Typing input form */}
              <form onSubmit={handleZapSubmit} className="w-full pt-4 border-t-2 border-dashed border-black dark:border-amber-500 flex gap-4">
                <input
                  type="text"
                  value={typedStem}
                  onChange={(e) => setTypedStem(e.target.value)}
                  disabled={answerState !== null}
                  placeholder="Type base root..."
                  className="flex-grow bg-zinc-50 border-2 border-black rounded-lg py-2 pl-3 text-xs font-black text-black placeholder-zinc-400 focus:outline-hidden dark:bg-zinc-900 dark:text-white dark:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={answerState !== null || loading}
                  className="px-6 py-2 bg-amber-400 border-[3px] border-black text-black text-xs font-black uppercase rounded-lg hover:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] cursor-pointer dark:border-amber-500"
                >
                  ZAP!
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Study Guide & Performance HUD (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          {/* Performance HUD */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🎮 MONITORS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">SCORE</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-550 leading-none">⚙️ {lives}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-550 uppercase mt-1 leading-none">LIVES</p>
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
                Linguistic Stemming (Light)
              </h4>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              Stemming maps word inflections onto their primary base morpheme (e.g. ልጆቻችን ➡️ ልጅ) by stripping grammatical affixes. Collapsing words to stems reduces vocabulary space and links synonyms together in indexes.
            </p>
            <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1 font-semibold">
                <li>Watch the cloud of inflections falling from the top.</li>
                <li>Deduce the single shared base root (e.g. for ቤቶች, ቤታቸው type ቤት).</li>
                <li>Submit before the cloud hits the ground to zap it, scoring bonus points!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
