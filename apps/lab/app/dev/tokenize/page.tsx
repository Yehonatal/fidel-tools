"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
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

export default function TokenizePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ። የአዲስ አበባ ከተማ እጅግ ትልቅ ነው።");
  const [sentences, setSentences] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const performTokenization = async (textToTokenize: string) => {
    if (!textToTokenize.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTokenize }),
      });
      const data = await response.json();
      if (!data.error) {
        setSentences(data.sentences || []);
        setWords(data.words || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      performTokenization(text);
    }
  }, [text, mode]);

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

  if (mode === "fun") {
    const segmentedPreview = getSegmentedWords();

    // ── 10/10 FUN MODE: SCISSOR SNIPPER ────────────────────────────────────
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
            .scissor-cut-btn:hover .scissor-icon {
              transform: rotate(-10deg) scale(1.2);
            }
          `
        }} />

        {/* Header HUD */}
        <div className="text-center space-y-2 mb-10 w-full max-w-4xl border-b-4 border-black dark:border-amber-500 pb-6">
          <div className="flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
            <span>✂️ LEVEL 4: BOUNDARY SLICER ✂️</span>
          </div>
          <h2 className="text-5xl font-black tracking-wider text-black dark:text-amber-500">
            SCISSOR SNIPPER
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-black uppercase tracking-widest">
            Click in between characters to physically snip the paper tape into word tokens!
          </p>
        </div>

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
              className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
            >
              Start Snipping
            </button>
          </div>
        ) : (
          <div className="max-w-4xl w-full flex flex-col items-center gap-8">
            {/* HUD */}
            <div className="w-full cartoon-border rounded-lg bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-3.5 flex justify-between items-center text-xs font-black">
              <span className="text-zinc-500 dark:text-zinc-400 uppercase">
                LEVEL {round + 1} / {GAME_SENTENCES.length}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
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
                          className="scissor-cut-btn w-6 h-12 -mx-2 flex items-center justify-center relative cursor-pointer group disabled:cursor-not-allowed z-10"
                        >
                          <div className={`w-[4px] h-9 rounded-full transition-all ${
                            hasCutAfter
                              ? "bg-red-500 border-l border-r border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] w-[6px]"
                              : "bg-transparent group-hover:bg-zinc-400/60"
                          }`} />
                          
                          {/* Hover Scissor Icon */}
                          {!hasCutAfter && !hasSubmitted && (
                            <span className="scissor-icon absolute opacity-0 group-hover:opacity-100 text-sm -top-3 transition-transform pointer-events-none select-none">
                              ✂️
                            </span>
                          )}

                          {/* Placed Cut Scissor */}
                          {hasCutAfter && (
                            <span className="absolute -top-3.5 text-sm select-none animate-bounce">
                              ✂️
                            </span>
                          )}
                        </button>

                        {/* Physical split gap when cut is present */}
                        {hasCutAfter && (
                          <div className="w-3 border-r-2 border-dashed border-red-500" />
                        )}

                        {/* Snip splash effect text */}
                        {snipEffect === idx + 1 && (
                          <span className="snip-bubble absolute -top-8 px-2 py-0.5 border border-black bg-yellow-200 text-[8px] font-black uppercase rounded shadow z-30 pointer-events-none">
                            SNIP!
                          </span>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Live Segmented Preview Display */}
            <div className="w-full cartoon-border rounded-xl p-6 bg-white dark:bg-[#1c1a19] dark:border-amber-500 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-550 block">LIVE RECONSTRUCTED TOKENS</span>
              <div className="flex flex-wrap gap-3 items-center justify-center min-h-[46px]">
                {segmentedPreview.length > 0 ? (
                  segmentedPreview.map((word, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 border-[3px] border-black bg-cyan-155 text-black text-xs font-black rounded-xl shadow-[3px_3px_0px_0px_#000] dark:bg-cyan-900/40 dark:text-amber-250 dark:border-amber-500 animate-in zoom-in-50 duration-200"
                    >
                      {word}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-450 text-xs font-black uppercase tracking-widest">TAPE UNRESOLVED</span>
                )}
              </div>
            </div>

            {/* Submission dashboard */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
              <div>
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitCuts}
                    className="px-6 py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all cursor-pointer font-mono dark:border-amber-500"
                  >
                    Submit Cuts
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="cartoon-border px-4 py-3 bg-white dark:bg-[#1c1a19] dark:border-amber-500 flex flex-col justify-center">
                      <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block font-black">ACCURACY SCORE</span>
                      <span className="text-xl font-black text-black dark:text-amber-400">{score}% F1 BOUNDARY</span>
                    </div>

                    <button
                      onClick={handleNextRound}
                      className="px-5 py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer font-mono dark:border-amber-500"
                    >
                      <span>{round < GAME_SENTENCES.length - 1 ? "Next Level" : "Finish Arcade"}</span>
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                )}
              </div>

              {hasSubmitted && (
                <div className="cartoon-border p-4 bg-cyan-100 dark:bg-cyan-950/20 text-xs font-bold rounded-lg border-2 border-black max-w-sm dark:border-amber-500">
                  <p className="uppercase text-[9px] font-black text-cyan-600 dark:text-amber-500 mb-1">
                    GROUND TRUTH WORD SEGMENTS
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {currentSentence.tokens.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 border-2 border-black bg-white text-black text-xs font-black rounded-lg dark:bg-zinc-900 dark:text-white dark:border-amber-500 shadow-[1px_1px_0px_0px_#000]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: TOKEN VIEWER ──────────────────────────────────────────
  const codeSnippet = `// Segment Words Functional API
import { sentenceTokenize } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const sentences = sentenceTokenize(text, amPack);
console.log(sentences); // Outputs array of sentence strings`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Sentence Boundary segmenter & Word Tokenizer
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Analyze how the pipeline tokenizes text into distinct sentences using Ethiopic sentence boundaries.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Corpus Text
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Type paragraph content..."
                />
              </div>
            </div>

            <CodeSnippet title="Functional API usage" code={codeSnippet} />
          </div>

          {/* Results Visualizer Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Sentence Boundary Segments
                </span>
              </div>
              <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                {sentences.length > 0 ? (
                  sentences.map((sent, i) => (
                    <div
                      key={i}
                      className="p-3 border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/60 rounded-lg text-xs leading-relaxed font-sans text-zinc-800 dark:text-zinc-250 flex items-start gap-3"
                    >
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0 font-mono">
                        SENT {i + 1}
                      </span>
                      <span>{sent}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-10 text-zinc-400 text-xs font-mono">
                    No sentence boundaries detected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
