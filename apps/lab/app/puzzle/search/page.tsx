"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, ArrowRight, Heart } from "lucide-react";

interface SearchDoc {
  id: string;
  content: string;
}

interface SearchChallenge {
  id: number;
  query: string;
  documents: SearchDoc[];
}

const SEARCH_CHALLENGES: SearchChallenge[] = [
  {
    id: 1,
    query: "ትምህርት ቤት",
    documents: [
      { id: "doc-1", content: "ልጆቹ ትላንትና ወደ ትምህርት ቤት ሄዱ።" },
      { id: "doc-2", content: "ትምህርት ለሀገር እድገት እጅግ ጠቃሚ ነው።" },
      { id: "doc-3", content: "በአዲስ አበባ ውስጥ ትልቅ ት/ቤት ተከፈተ።" },
      { id: "doc-4", content: "ዛሬ ፀሀይ በምስራቅ በኩል ወጣች።" },
    ],
  },
  {
    id: 2,
    query: "ሐኪም ሰላም",
    documents: [
      { id: "doc-1", content: "ሐኪሙ ሠላምታ ሰጥቶን ሄደ።" },
      { id: "doc-2", content: "በሀገራችን ሰላም ሰፈነ።" },
      { id: "doc-3", content: "ሀኪም ኀይሉ ወደ ከተማ መጣ።" },
      { id: "doc-4", content: "ዛሬ መጽሐፍ ማንበብ እፈልጋለሁ።" },
    ],
  },
  {
    id: 3,
    query: "ከተማ ሚኒስቴር",
    documents: [
      { id: "doc-1", content: "አ.አ ውስጥ የሚኖሩት ሰራተኞች አዲስ አበባ ከተማን ያደንቃሉ።" },
      { id: "doc-2", content: "የገንዘብ ሚኒስቴር አዲስ ረቂቅ አዋጅ አወጣ።" },
      { id: "doc-3", content: "የከተማው ከንቲባ ሚኒስቴሩን ጎበኙ።" },
      { id: "doc-4", content: "ልጅ ትምህርት ቤት መሄድ አለበት።" },
    ],
  },
];

export default function SearchPuzzlePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [playerRankings, setPlayerRankings] = useState<SearchDoc[]>([]);
  const [correctRankings, setCorrectRankings] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentChallenge = SEARCH_CHALLENGES[roundIdx];

  const startShowdown = () => {
    setIsPlaying(true);
    setRoundIdx(0);
    setScore(0);
    setHasSubmitted(false);
    initRound(0);
  };

  const initRound = (idx: number) => {
    setTimeLeft(15);
    setHasSubmitted(false);
    setScore(0);
    setCorrectRankings([]);

    const shuffled = [...SEARCH_CHALLENGES[idx].documents].sort(() => Math.random() - 0.5);
    setPlayerRankings(shuffled);

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current!);
          submitRankings(shuffled, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0 || hasSubmitted) return;
    const copy = [...playerRankings];
    const temp = copy[idx];
    copy[idx] = copy[idx - 1];
    copy[idx - 1] = temp;
    setPlayerRankings(copy);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === playerRankings.length - 1 || hasSubmitted) return;
    const copy = [...playerRankings];
    const temp = copy[idx];
    copy[idx] = copy[idx + 1];
    copy[idx + 1] = temp;
    setPlayerRankings(copy);
  };

  const submitRankings = async (currentOrder = playerRankings, timedOut = false) => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setHasSubmitted(true);
    setLoading(true);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: currentChallenge.query,
          documents: currentChallenge.documents,
        }),
      });
      const data = await response.json();
      const trueRankedResults = data.results || [];
      setCorrectRankings(trueRankedResults);

      if (timedOut) {
        setScore(0);
        setLoading(false);
        return;
      }

      let squaredDiffSum = 0;
      currentOrder.forEach((doc, userIdx) => {
        const userRank = userIdx + 1;
        const trueIdx = trueRankedResults.findIndex((r: any) => r.id === doc.id);
        const trueRank = trueIdx !== -1 ? trueIdx + 1 : 4;
        const diff = userRank - trueRank;
        squaredDiffSum += diff * diff;
      });

      const rho = 1 - squaredDiffSum / 10;
      const finalScore = Math.max(0, Math.round(rho * 100));
      setScore(finalScore);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = () => {
    if (roundIdx < SEARCH_CHALLENGES.length - 1) {
      setRoundIdx((r) => r + 1);
      initRound(roundIdx + 1);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  return (
    <div className="font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#faf8f5] text-zinc-900 dark:bg-[#121110] dark:text-amber-100 animate-in fade-in duration-300 text-left">
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
          .rank-btn {
            border: 2px solid #000;
            box-shadow: 2px 2px 0px 0px #000;
          }
          .dark .rank-btn {
            border: 2px solid #f59e0b;
            box-shadow: 2px 2px 0px 0px #f59e0b;
          }
        `
      }} />

      {/* Header Block */}
      <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <span className="text-xl">👑</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  RANK ROYALE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 9
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Sort document search results by TF-IDF relevance against the target query!
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
              <div className="text-5xl">👑</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Enter Rank Arena?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  You are given a target search query and four documents. Move documents up and down to sort them by relevance. Your ranking is evaluated using Spearman correlation index comparison!
                </p>
              </div>
              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-[#25201c] dark:border-amber-500 dark:text-amber-300">
                  SCORE: {score} PTS
                </div>
              )}
              <button
                onClick={startShowdown}
                className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500 shadow-[3px_3px_0px_0px_#000]"
              >
                Start Ranking
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {/* HUD */}
              <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-4 flex justify-between items-center text-xs font-black select-none">
                <span>ROUND {roundIdx + 1} / {SEARCH_CHALLENGES.length}</span>
                <span className="text-red-500 animate-pulse">⏰ TIME LEFT: {timeLeft}S</span>
              </div>

              {/* Target Query display */}
              <div className="text-center py-4 bg-amber-100/50 dark:bg-amber-955/20 border-2 border-dashed border-amber-400 rounded-xl">
                <span className="text-[9px] font-black text-amber-600 block uppercase tracking-widest mb-1">TARGET QUERY</span>
                <span className="text-2xl font-black text-black dark:text-white font-sans">&ldquo;{currentChallenge.query}&rdquo;</span>
              </div>

              {/* Sortable Document List */}
              <div className="space-y-4">
                {playerRankings.map((doc, idx) => {
                  const correctIdx = correctRankings.findIndex((r) => r.id === doc.id);
                  const isCorrectRank = hasSubmitted && correctIdx === idx;
                  const trueRank = correctIdx !== -1 ? correctIdx + 1 : idx + 1;

                  let borderClass = "border-black dark:border-amber-500";
                  if (hasSubmitted) {
                    borderClass = isCorrectRank 
                      ? "border-green-500 dark:border-green-550 shadow-green-500/25" 
                      : "border-red-400 dark:border-red-500 shadow-red-500/25";
                  }

                  return (
                    <div
                      key={doc.id}
                      className={`cartoon-border rounded-xl p-4 bg-white dark:bg-zinc-900/60 flex items-center justify-between gap-4 transition-all ${borderClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full border-2 border-black dark:border-amber-500 flex items-center justify-center text-xs font-black bg-zinc-50 dark:bg-black/30 shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                          {doc.content}
                        </p>
                      </div>

                      {/* Rank Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {hasSubmitted && (
                          <div className="text-[9px] font-black px-2 py-1 bg-zinc-100 dark:bg-zinc-950 rounded border border-black dark:border-amber-500">
                            TRUE RANK: #{trueRank}
                          </div>
                        )}
                        
                        {!hasSubmitted && (
                          <>
                            <button
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="rank-btn p-1.5 bg-zinc-50 hover:bg-zinc-100 rounded active:translate-y-0.5 disabled:opacity-40 cursor-pointer text-zinc-700"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === playerRankings.length - 1}
                              className="rank-btn p-1.5 bg-zinc-50 hover:bg-zinc-100 rounded active:translate-y-0.5 disabled:opacity-40 cursor-pointer text-zinc-700"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action submission bar */}
              <div className="flex justify-end gap-4 pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
                {!hasSubmitted ? (
                  <button
                    onClick={() => submitRankings()}
                    disabled={loading}
                    className="px-6 py-3 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-wider text-xs rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 shadow-[3px_3px_0px_0px_#000] cursor-pointer dark:border-amber-500"
                  >
                    Evaluate Ranking
                  </button>
                ) : (
                  <div className="flex items-center gap-4 animate-in fade-in duration-300">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-500">
                      SPEARMAN SCORE: {score}%
                    </span>
                    <button
                      onClick={handleNextRound}
                      className="px-5 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
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

        {/* Right Column: Educational Concept Card (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono text-left">
          {/* Performance HUD */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🎮 STATUS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}%</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">SPEARMAN</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-550 leading-none">⚙️ {roundIdx + 1}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-550 uppercase mt-1 leading-none">ROUND</p>
              </div>
            </div>
          </div>

          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <div className="border-b-2 border-dashed border-zinc-205 dark:border-zinc-800 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                📖 NLP LAB REPORT
              </span>
              <h4 className="text-sm font-black text-black dark:text-white uppercase mt-1">
                TF-IDF Search Relevance
              </h4>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              Information Retrieval models score document relevance using TF-IDF weights: Term Frequency (how often query terms appear inside a document) multiplied by Inverse Document Frequency (how unique those terms are across the entire index corpus).
            </p>
            <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1 font-semibold">
                <li>Study the target query at the top.</li>
                <li>Analyze the four documents and determine term matching density (counting normalized stems/variants too!).</li>
                <li>Sort the list by relevance. Submit to score!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
