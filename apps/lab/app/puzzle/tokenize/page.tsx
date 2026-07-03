"use client";

import React, { useState, useEffect } from "react";
import { Activity, Play, RotateCcw, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";

interface GameSentence {
  id: number;
  full: string;
  tokens: string[];
}

const GAME_SENTENCES: GameSentence[] = [
  { id: 1, full: "ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።", tokens: ["ትላንትና", "ማታ", "ወደ", "መርካቶ", "ሄዶ", "ነበረ።"] },
  { id: 2, full: "ከተማዋ በምሽት እጅግ በጣም ታምራለች።", tokens: ["ከተማዋ", "በምሽት", "እጅግ", "በጣም", "ታምራለች።"] },
  { id: 3, full: "ልጆቹ በደስታ በሜዳው ላይ ይጫወታሉ።", tokens: ["ልጆቹ", "በደስታ", "በሜዳው", "ላይ", "ይጫወታሉ።"] },
];

export default function TokenizePuzzlePage() {
  // Scissor Snipper States
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [userCuts, setUserCuts] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [snipEffect, setSnipEffect] = useState<number | null>(null);

  const currentSentence = GAME_SENTENCES[round];
  const runOnText = currentSentence ? currentSentence.full.replace(/\s+/g, "") : "";
  const charArray = Array.from(runOnText);

  // Compute correct splits
  const getTrueCuts = (): number[] => {
    if (!currentSentence) return [];
    const cuts: number[] = [];
    let currentLength = 0;
    for (let i = 0; i < currentSentence.tokens.length - 1; i++) {
      currentLength += currentSentence.tokens[i].length;
      cuts.push(currentLength);
    }
    return cuts;
  };

  const trueCuts = getTrueCuts();

  const startGame = () => {
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setUserCuts([]);
    setHasSubmitted(false);
  };

  const toggleBoundary = (position: number) => {
    if (hasSubmitted) return;
    
    // Play a 10/10 snip splash animation effect
    setSnipEffect(position);
    setTimeout(() => setSnipEffect(null), 600);

    setUserCuts((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const getSegmentedWords = () => {
    const sortedCuts = [...userCuts].sort((a, b) => a - b);
    const segments: string[] = [];
    let lastIndex = 0;
    sortedCuts.forEach((cut) => {
      segments.push(runOnText.substring(lastIndex, cut));
      lastIndex = cut;
    });
    segments.push(runOnText.substring(lastIndex));
    return segments.filter(Boolean);
  };

  const handleSubmitCuts = () => {
    setHasSubmitted(true);
    const hits = userCuts.filter((c) => trueCuts.includes(c)).length;
    
    const precision = userCuts.length > 0 ? hits / userCuts.length : 0;
    const recall = trueCuts.length > 0 ? hits / trueCuts.length : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    setScore(Math.round(f1 * 100));
  };

  const handleNextRound = () => {
    if (round < GAME_SENTENCES.length - 1) {
      setRound((prev) => prev + 1);
      setUserCuts([]);
      setHasSubmitted(false);
      setScore(0);
    } else {
      setIsPlaying(false);
    }
  };

  const segmentedPreview = getSegmentedWords();

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
          .paper-tape {
            background-image: repeating-linear-gradient(90deg, #fff, #fff 10px, #e5e7eb 10px, #e5e7eb 11px);
            border: 3.5px solid #000;
            box-shadow: 5px 5px 0px 0px #000;
          }
          .dark .paper-tape {
            background-image: repeating-linear-gradient(90deg, #1c1a19, #1c1a19 10px, #292524 10px, #292524 11px);
            border: 3.5px solid #f59e0b;
            box-shadow: 5px 5px 0px 0px #f59e0b;
          }
          .snip-bubble {
            animation: snip-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes snip-pop {
            0% { transform: scale(0.4) rotate(-15deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0); opacity: 0; }
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  SEGMENT SPRINT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 4
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Click in between characters to physically snip the paper tape into word tokens!
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
              <div className="text-5xl">✂️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Begin Boundary Slicing?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  You have a continuous run-on paper tape of characters. Click between glyphs to insert cuts. Your final cuts are scored by F1 semantic boundary precision!
                </p>
              </div>
              <button
                onClick={startGame}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b]"
              >
                Start Snipping
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-8">
              {/* HUD */}
              <div className="w-full cartoon-border rounded-lg bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-3.5 flex justify-between items-center text-xs font-black">
                <span className="text-zinc-550 dark:text-zinc-400 uppercase">
                  LEVEL {round + 1} / {GAME_SENTENCES.length}
                </span>
                <span className="text-zinc-555 dark:text-zinc-400">
                  ACTIVE CUTS: {userCuts.length}
                </span>
              </div>

              {/* Clickable Character Paper Tape */}
              <div className="paper-tape p-8 rounded-2xl w-full flex flex-wrap gap-y-6 gap-x-2 items-center justify-center relative overflow-hidden select-none">
                {charArray.map((char, idx) => {
                  const hasCutAfter = userCuts.includes(idx + 1);

                  return (
                    <React.Fragment key={idx}>
                      {/* Wobbly Letter Block */}
                      <span className="w-12 h-12 border-[3px] border-black bg-white dark:bg-[#222] dark:border-amber-500 font-sans text-2xl font-black flex items-center justify-center rounded-xl shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b]">
                        {char}
                      </span>
                      
                      {/* Splitting Gutter with Scissor Hover */}
                      {idx < charArray.length - 1 && (
                        <div className="relative flex items-center">
                          <button
                            disabled={hasSubmitted}
                            onClick={() => toggleBoundary(idx + 1)}
                            className={`w-6 h-10 -mx-2 hover:bg-red-400/20 active:bg-red-400/40 rounded transition-all cursor-pointer flex items-center justify-center relative z-25 group`}
                          >
                            <span className={`text-base scale-90 group-hover:scale-120 group-hover:rotate-12 transition-transform ${
                              hasCutAfter ? "text-red-500" : "opacity-0 group-hover:opacity-60 text-zinc-400"
                            }`}>
                              ✂️
                            </span>
                          </button>

                          {/* Line breakdown marker */}
                          {hasCutAfter && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-red-500 pointer-events-none border-dashed border border-red-600 animate-in fade-in" />
                          )}

                          {/* Snipping splash feedback */}
                          {snipEffect === idx + 1 && (
                            <span className="snip-bubble absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm z-30 select-none pointer-events-none">
                              💥
                            </span>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Segmented tokens preview */}
              {userCuts.length > 0 && (
                <div className="w-full cartoon-border rounded-xl p-5 bg-white dark:bg-[#1a1c1d] dark:border-amber-500 space-y-3">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">LIVE TOKEN SEGMENT PREVIEW</span>
                  <div className="flex flex-wrap gap-2">
                    {segmentedPreview.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 border-2 border-black bg-cyan-50 dark:bg-zinc-900 dark:text-white dark:border-amber-500 text-xs font-black rounded-lg shadow-[2px_2px_0px_0px_#000]"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action runner buttons */}
              <div className="flex gap-4 w-full justify-end pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitCuts}
                    className="px-6 py-3 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-wider text-xs rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-[3px] shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                  >
                    Compile Segments
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-green-600 uppercase">
                      Precision Score: {score}% F1
                    </span>
                    <button
                      onClick={handleNextRound}
                      className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                    >
                      <span>NEXT ROUND</span>
                      <ArrowRight className="w-4 h-4 text-amber-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Study Guide & Performance HUD (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          {/* Performance HUD */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🎮 LAB STATUS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}%</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">ROUND F1</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-500 leading-none">⚙️ {round + 1}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">ROUND</p>
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
                Tokenization & Boundary Models
              </h4>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              Ge&apos;ez text tokenization relies on space boundaries and Ethiopic word separators (ፊደል ነጥብ - ሁለት ነጥብ ፡). Tokenizers split sentences into semantic units, which form the base list keys for search weight indexing.
            </p>
            <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1 font-semibold">
                <li>Study the unified paper tape containing no spaces.</li>
                <li>Snip boundaries between characters by clicking the scissor icons.</li>
                <li>Click Compile to score your segments against true gold-standard token arrays!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
