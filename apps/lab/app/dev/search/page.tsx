"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Search, Plus, RefreshCw, AlertTriangle, Trash2, Gamepad, CheckCircle2, XCircle, ChevronUp, ChevronDown, ArrowRight, Star } from "lucide-react";

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
      { id: "doc-3", content: "በአዲስ አበባ ውስጥ ትልቅ ት/ቤት ተከፈተ።" }, // matches ት/ቤት via expansion
      { id: "doc-4", content: "ዛሬ ፀሀይ በምስራቅ በኩል ወጣች።" }, // 0 relevance
    ],
  },
  {
    id: 2,
    query: "ሐኪም ሰላም",
    documents: [
      { id: "doc-1", content: "ሐኪሙ ሠላምታ ሰጥቶን ሄደ።" }, // double match
      { id: "doc-2", content: "በሀገራችን ሰላም ሰፈነ።" }, // single match
      { id: "doc-3", content: "ሀኪም ኀይሉ ወደ ከተማ መጣ።" }, // single match
      { id: "doc-4", content: "ዛሬ መጽሐፍ ማንበብ እፈልጋለሁ።" }, // 0 relevance
    ],
  },
  {
    id: 3,
    query: "ከተማ ሚኒስቴር",
    documents: [
      { id: "doc-1", content: "አ.አ ውስጥ የሚኖሩት ሰራተኞች አዲስ አበባ ከተማን ያደንቃሉ።" },
      { id: "doc-2", content: "የገንዘብ ሚኒስቴር አዲስ ረቂቅ አዋጅ አወጣ።" },
      { id: "doc-3", content: "የከተማው ከንቲባ ሚኒስቴሩን ጎበኙ።" }, // double match
      { id: "doc-4", content: "ልጅ ትምህርት ቤት መሄድ አለበት።" },
    ],
  },
];

export default function SearchPage() {
  const { mode } = useLabMode();
  const [query, setQuery] = useState("ሐኪም");
  const [docs, setDocs] = useState([
    { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ በሆስፒታሉ ውስጥ ይሰበሰባሉ።" },
    { id: "doc-2", content: "ሃኪሙ ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።" },
    { id: "doc-3", content: "ልጆች ትምህርት ቤት ሄደው አዲስ እውቀት ይማራሉ።" },
    { id: "doc-4", content: "የገንዘብ ሚኒስቴር ለት/ቤቶች ተጨማሪ በጀት ፈቀደ።" },
  ]);
  const [newDocText, setNewDocText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [queryStems, setQueryStems] = useState<string[]>([]);
  const [rawIndex, setRawIndex] = useState<any>(null);
  const [rawWeights, setRawWeights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "index" | "weights">("results");

  // Rank Royale States
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [playerRankings, setPlayerRankings] = useState<SearchDoc[]>([]);
  const [correctRankings, setCorrectRankings] = useState<any[]>([]); // Results returned from backend search scoring
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentChallenge = SEARCH_CHALLENGES[roundIdx];

  const performSearch = async (currentQuery: string) => {
    if (!currentQuery.trim() || docs.length === 0) {
      setResults([]);
      setQueryStems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery, documents: docs }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
        setQueryStems(data.queryStems || []);
        setRawIndex(data.rawIndex || null);
        setRawWeights(data.rawWeights || null);
      }
    } catch (err: any) {
      setError(err.message || "Search request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      performSearch(query);
    }
  }, [docs, mode]);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocText.trim()) return;
    const newDoc = {
      id: `doc-${docs.length + 1}`,
      content: newDocText.trim(),
    };
    setDocs([...docs, newDoc]);
    setNewDocText("");
  };

  const handleRemoveDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Game initialization
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

    // Shuffle the documents initially to avoid giving away any ranking
    const shuffled = [...SEARCH_CHALLENGES[idx].documents].sort(() => Math.random() - 0.5);
    setPlayerRankings(shuffled);

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current!);
          submitRankings(shuffled, true); // Auto-submit on timeout
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
      // POST the documents and query to /api/search to get TF-IDF relevance scores
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

      // Calculate Spearman correlation
      // trueRankedResults is sorted descending by relevance score.
      // Rank 1 = index 0, Rank 2 = index 1, etc.
      let squaredDiffSum = 0;
      currentOrder.forEach((doc, userIdx) => {
        const userRank = userIdx + 1;
        const trueIdx = trueRankedResults.findIndex((r: any) => r.id === doc.id);
        const trueRank = trueIdx !== -1 ? trueIdx + 1 : 4;
        const diff = userRank - trueRank;
        squaredDiffSum += diff * diff;
      });

      // Max D for N=4 is 20. Rho = 1 - (D / 10).
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

  if (mode === "fun") {
    // ── FUN MODE: CARTOON RANK ROYALE ──────────────────────────────────────
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
              box-shadow: 5px 5px 0px 0px #000;
            }
            .dark .cartoon-card {
              border: 3px solid #f59e0b;
              box-shadow: 5px 5px 0px 0px #f59e0b;
            }
            .cartoon-speech {
              border: 3px solid #000;
              position: relative;
            }
            .dark .cartoon-speech {
              border: 3px solid #f59e0b;
            }
          `
        }} />

        {/* Header Block */}
        <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                <Search className="w-5 h-5" />
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
                  Reorder the 4 document combat cards to match their true TF-IDF search relevance!
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
                    Start Rank Royale?
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold font-mono">
                    You will be given a search query and four documents. Rank the documents from most relevant to least relevant before the timer runs out. Scored via Spearman distance!
                  </p>
                </div>
                {score > 0 && (
                  <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-[#25201c] dark:border-amber-500 dark:text-amber-400">
                    PREVIOUS SCORE: {score} PTS
                  </div>
                )}
                <button
                  onClick={startShowdown}
                  className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
                >
                  Start Arena
                </button>
              </div>
            ) : (
              <div className="w-full space-y-6 flex flex-col items-center">
                
                {/* Top HUD */}
                <div className="w-full cartoon-border rounded-lg bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-3.5 flex justify-between items-center text-xs font-black">
                  <span>ROUND {roundIdx + 1} / {SEARCH_CHALLENGES.length}</span>
                  <span className="text-red-500 animate-pulse">⏰ TIMER: {timeLeft}S</span>
                </div>

                {/* Active search query speech bubble */}
                <div className="cartoon-border p-6 bg-cyan-100 dark:bg-[#1c1a19] dark:border-amber-500 rounded-xl text-center space-y-1 w-full max-w-md">
                  <span className="text-[10px] text-cyan-600 dark:text-amber-500 font-black uppercase tracking-wider block">ACTIVE SEARCH QUERY</span>
                  <span className="text-3xl font-black text-black dark:text-white block font-sans">
                    "{currentChallenge.query}"
                  </span>
                </div>

                {/* Reorderable Document List */}
                <div className="w-full space-y-4">
                  {playerRankings.map((doc, idx) => {
                    const trueData = correctRankings.find((r: any) => r.id === doc.id);
                    
                    return (
                      <div
                        key={doc.id}
                        className="cartoon-card p-4 bg-white dark:bg-[#1c1a19] rounded-xl flex items-center justify-between gap-4 border-2 border-black dark:border-amber-500 relative"
                      >
                        {/* Rank Badge */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="w-8 h-8 rounded-full border-2 border-black bg-amber-400 text-black font-black flex items-center justify-center text-sm shadow-[1px_1px_0px_0px_#000]">
                            #{idx + 1}
                          </span>
                          
                          {/* Arrow Controllers */}
                          {!hasSubmitted && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                className="p-1 border border-black bg-zinc-100 dark:bg-zinc-800 dark:border-amber-500 rounded disabled:opacity-40"
                              >
                                <ChevronUp className="w-3.5 h-3.5 text-black dark:text-white" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === playerRankings.length - 1}
                                className="p-1 border border-black bg-zinc-100 dark:bg-zinc-800 dark:border-amber-500 rounded disabled:opacity-40"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-black dark:text-white" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                          <span className="text-[8px] font-black uppercase text-zinc-550 block mb-1">DOCUMENT ({doc.id})</span>
                          <p className="text-xs font-bold leading-relaxed text-zinc-800 dark:text-zinc-205 font-sans">
                            {doc.content}
                          </p>
                        </div>

                        {/* Post-Round TF-IDF Reveal Stats */}
                        {hasSubmitted && trueData && (
                          <div className="shrink-0 p-3 bg-cyan-50 dark:bg-black border-2 border-black dark:border-amber-500 rounded-lg text-right text-[10px] font-black animate-in slide-in-from-right-4 duration-300">
                            <p className="text-cyan-600 dark:text-amber-500 uppercase tracking-widest text-[8px]">TF-IDF SCORE</p>
                            <p className="text-lg text-black dark:text-white font-black">{trueData.score.toFixed(3)}</p>
                            <div className="flex flex-wrap gap-1 justify-end mt-1">
                              {trueData.matchedStems.length > 0 ? (
                                trueData.matchedStems.map((stem: string) => (
                                  <span key={stem} className="px-1.5 py-0.2 bg-white text-black border border-black rounded text-[8px]">
                                    {stem}
                                  </span>
                                ))
                              ) : (
                                <span className="text-zinc-400 italic text-[8px]">no match</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submission HUD */}
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                  <div>
                    {!hasSubmitted ? (
                      <button
                        onClick={() => submitRankings()}
                        disabled={loading}
                        className="px-6 py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all cursor-pointer font-mono dark:border-amber-500"
                      >
                        {loading ? "CALCULATING..." : "Submit Rankings"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="cartoon-border px-4 py-3 bg-white dark:bg-[#1c1a19] dark:border-amber-500 flex flex-col justify-center">
                          <span className="text-[9px] font-black text-zinc-555 uppercase tracking-widest block">ROYALE SCORE</span>
                          <span className="text-xl font-black text-black dark:text-amber-400">{score} / 100 PTS</span>
                        </div>

                        <button
                          onClick={handleNextRound}
                          className="px-5 py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer font-mono dark:border-amber-500"
                        >
                          <span>{roundIdx < SEARCH_CHALLENGES.length - 1 ? "Next Level" : "Finish Arcade"}</span>
                          <ArrowRight className="w-4 h-4 animate-pulse" />
                        </button>
                      </div>
                    )}
                  </div>

                  {hasSubmitted && (
                    <div className="cartoon-border p-4 bg-cyan-150 dark:bg-cyan-950/20 text-[10px] font-black rounded-lg border-2 border-black max-w-sm">
                      <span className="text-cyan-600 dark:text-amber-550 uppercase tracking-widest block mb-1">SPEARMAN RANK DISTANCE</span>
                      <p className="text-zinc-655 dark:text-zinc-400 font-semibold leading-relaxed">
                        A distance close to the TF-IDF order (swapping adjacent items) yields high partial credit. Inverting the deck yields 0 points.
                      </p>
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
                  <p className="text-2xl font-black text-amber-500 leading-none">⚙️ {roundIdx + 1}</p>
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
                  Term Frequency-Inverse Document Frequency
                </h4>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Information Retrieval systems rank documents based on how unique a search word is in each file (TF-IDF). Words that appear frequently in one doc but rarely in others rank highest.
              </p>
              <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
                <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                  <li>Inspect the query term at the top.</li>
                  <li>Check which documents contain matching base roots (after stemming/normalization).</li>
                  <li>Reorder the document list using the up and down arrow controllers to rank by relevance.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: SEARCH CONSOLE ─────────────────────────────────────────
  const codeSnippet = `import { indexDocument, score } from './search'

const docStems = indexDocument(documentText)
const queryStems = indexDocument(searchQuery)

const relevanceScore = score(docStems, queryStems)`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Amharic Full-Text Search Engine
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Standard search engines fail on spelling variants or plural inflections. Running query and document text through normalizer and stemmer pipelines maps terms to their root.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Document builder */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
                Index Document Corpus
              </h3>
              
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-lg flex items-start justify-between gap-3 text-xs leading-relaxed">
                    <div>
                      <span className="font-mono text-[9px] font-bold text-blue-500 uppercase block">{doc.id}</span>
                      <p className="font-sans font-medium text-zinc-700 dark:text-zinc-350">{doc.content}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddDocument} className="flex gap-2">
                <input
                  type="text"
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Index new sentence..."
                  className="flex-grow bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 px-3 py-2 text-xs rounded-lg text-zinc-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="p-2 border border-zinc-250 dark:border-zinc-855 bg-white dark:bg-zinc-950 rounded-lg hover:border-blue-500 hover:text-blue-500 cursor-pointer flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Search Result Console */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                  {(["results", "index", "weights"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer capitalize ${
                        activeTab === tab
                          ? "bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          : "text-zinc-555 hover:text-zinc-350"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>

              <div className="p-6">
                {activeTab === "results" && (
                  <div className="space-y-6">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search corpus..."
                        className="flex-grow bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 px-4 py-2.5 text-xs rounded-lg text-zinc-805 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
                      >
                        Search
                      </button>
                    </form>

                    <div className="space-y-4">
                      {results.map((hit) => (
                        <div key={hit.id} className="p-4 border border-zinc-200 dark:border-zinc-900 rounded-lg flex items-center justify-between gap-4">
                          <div className="space-y-2">
                            <span className="font-mono text-[9px] font-bold text-zinc-500 block uppercase">{hit.id}</span>
                            <p className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300">{hit.content}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {hit.matchedStems.map((stem: string) => (
                                <span key={stem} className="px-2 py-0.5 rounded bg-blue-500/5 text-blue-600 dark:text-sky-400 text-[10px] font-bold font-sans">
                                  {stem}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-xs text-blue-600 dark:text-sky-400">
                            {hit.score.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "index" && (
                  <pre className="text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-blue-605 dark:text-sky-400 max-h-[380px]">
                    {JSON.stringify(rawIndex, null, 2) || "No index loaded."}
                  </pre>
                )}

                {activeTab === "weights" && (
                  <pre className="text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-blue-605 dark:text-sky-400 max-h-[380px]">
                    {JSON.stringify(rawWeights, null, 2) || "No weights loaded."}
                  </pre>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
