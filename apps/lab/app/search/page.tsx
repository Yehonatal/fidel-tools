"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import TokenBadge from "@/components/TokenBadge";
import { Search, Plus, RefreshCw, AlertTriangle, Trash2, Gamepad, Sword, Heart, Shield, CheckCircle2 } from "lucide-react";

const INITIAL_DOCS = [
  { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ በሆስፒታሉ ውስጥ ይሰበሰባሉ።" },
  { id: "doc-2", content: "ሃኪሙ ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።" },
  { id: "doc-3", content: "ልጆች ትምህርት ቤት ሄደው አዲስ እውቀት ይማራሉ።" },
  { id: "doc-4", content: "የገንዘብ ሚኒስቴር ለት/ቤቶች ተጨማሪ በጀት ፈቀደ።" },
  { id: "doc-5", content: "አ.አ ውስጥ የሚኖሩት ሰራተኞች አዲስ አበባ ከተማን ያደንቃሉ።" },
];

const GAME_QUERIES = [
  { query: "ልጆች", correctDocId: "doc-3" },
  { query: "ሀኪም", correctDocId: "doc-2" }, // matches ሃኪሙ via stem
  { query: "ከተማ", correctDocId: "doc-5" }, // matches አዲስ አበባ ከተማን
  { query: "ት/ቤት", correctDocId: "doc-4" }, // matches ለት/ቤቶች
];

export default function SearchPage() {
  const { mode } = useLabMode();
  const [query, setQuery] = useState("ሐኪም");
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [newDocText, setNewDocText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [queryStems, setQueryStems] = useState<string[]>([]);
  const [rawIndex, setRawIndex] = useState<any>(null);
  const [rawWeights, setRawWeights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "index" | "weights">("results");

  // Search Showdown Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [combatLog, setCombatLog] = useState<string>("BATTLE COMMENCING! Select the highest matching document card!");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

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
    performSearch(query);
  }, [docs]);

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

  // Game Logic
  const startShowdown = () => {
    setIsPlaying(true);
    setRound(0);
    setPlayerHp(100);
    setEnemyHp(100);
    setCombatLog("BATTLE COMMENCING! Find the document matching: " + GAME_QUERIES[0].query);
    setSelectedCardId(null);
  };

  const handleCardSelect = (docId: string) => {
    if (playerHp <= 0 || enemyHp <= 0 || selectedCardId !== null) return;
    setSelectedCardId(docId);

    const correctId = GAME_QUERIES[round].correctDocId;
    const isCorrect = docId === correctId;

    if (isCorrect) {
      setEnemyHp((prev) => Math.max(prev - 25, 0));
      setCombatLog("DIRECT HIT! Your indexed document matched the term stems perfectly! dealt 25 DMG!");
    } else {
      setPlayerHp((prev) => Math.max(prev - 25, 0));
      setCombatLog("CRITICAL BLOCK! The query missed your selected document stems! You took 25 DMG!");
    }

    setTimeout(() => {
      if (round < GAME_QUERIES.length - 1 && playerHp > 25 && enemyHp > 25) {
        setRound((prev) => prev + 1);
        setSelectedCardId(null);
        setCombatLog("NEXT ROUND! Find the document matching: " + GAME_QUERIES[round + 1].query);
      } else {
        // Game Over evaluation
        if (enemyHp <= 25 && isCorrect) {
          setCombatLog("VICTORY! You routed the search query monster!");
        } else {
          setCombatLog("DEFEAT! The query monster bypassed your inverted index!");
        }
      }
    }, 2000);
  };

  if (mode === "fun") {
    // ── FUN MODE: BATTLE CARD SHOWDOWN ─────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-655 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 9: SEARCH SHOWDOWN</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            SEARCH SHOWDOWN
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">
            Defeat the index monster by picking the highest matching document card!
          </p>
        </div>

        {!isPlaying ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full text-center space-y-6 shadow-inner">
            <div className="text-5xl">⚔️</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-amber-400 uppercase tracking-wider">
                Index Arena
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Match incoming queries with the correct document card from your hand. High BM25 matching stems deal critical damage!
              </p>
            </div>
            <button
              onClick={startShowdown}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg active:scale-98 transition-all cursor-pointer font-mono"
            >
              Start Duel
            </button>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-6 flex flex-col items-center">
            {/* Health Bars HUD */}
            <div className="w-full grid grid-cols-2 gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>PLAYER HP</span>
                  <span>{playerHp}/100</span>
                </div>
                <div className="h-4 bg-zinc-150 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-0.5 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${playerHp}%` }} />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>ENEMY HP</span>
                  <span>{enemyHp}/100</span>
                </div>
                <div className="h-4 bg-zinc-150 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-0.5 rounded overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${enemyHp}%` }} />
                </div>
              </div>
            </div>

            {/* Combat Log Console */}
            <div className="w-full p-4 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-blue-500/25 dark:border-amber-500/25 text-center text-xs font-semibold text-blue-600 dark:text-amber-300 leading-normal animate-pulse min-h-[50px] flex items-center justify-center">
              {combatLog}
            </div>

            {/* Current Query Target Card */}
            {round < GAME_QUERIES.length && playerHp > 0 && enemyHp > 0 && (
              <div className="p-6 border-2 border-blue-500/40 bg-blue-50/5 dark:border-orange-500/40 dark:bg-orange-500/5 rounded-xl text-center space-y-2 max-w-sm animate-bounce">
                <span className="text-[10px] text-blue-600 dark:text-orange-550 font-bold uppercase tracking-wider block">ACTIVE SEARCH QUERY</span>
                <span className="text-3xl font-extrabold text-zinc-850 dark:text-white block font-sans">
                  {GAME_QUERIES[round].query}
                </span>
              </div>
            )}

            {/* Document Deck (Hand) */}
            <div className="w-full space-y-3">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase tracking-widest font-bold block text-center">YOUR DECK HAND (SELECT ONE)</span>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {INITIAL_DOCS.map((doc) => {
                  const isSelected = selectedCardId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleCardSelect(doc.id)}
                      className={`p-4 border-2 rounded-xl bg-white dark:bg-zinc-950/60 cursor-pointer transition-all duration-300 select-none flex flex-col justify-between text-left min-h-[140px] hover:border-blue-500 dark:hover:border-amber-500 hover:bg-blue-50/10 dark:hover:bg-amber-500/5 ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50/30 dark:border-amber-500 dark:bg-amber-500/5 scale-95 opacity-80" 
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                        {doc.id}
                      </span>
                      <p className="text-[10px] text-zinc-650 dark:text-zinc-305 font-semibold leading-relaxed my-2 font-sans">
                        {doc.content}
                      </p>
                      <div className="flex justify-end pt-1">
                        <Sword className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom retry */}
            {(playerHp <= 0 || enemyHp <= 0 || round >= GAME_QUERIES.length) && (
              <button
                onClick={startShowdown}
                className="px-6 py-3 border-2 border-blue-500 hover:bg-blue-50 dark:border-amber-500 dark:hover:bg-amber-500/10 text-blue-600 dark:text-amber-555 font-bold text-xs uppercase rounded-lg active:scale-95 transition-all cursor-pointer font-mono"
              >
                Rematch
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: CONSOLE & DATA REFERENCE ──────────────────────────────
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
                  className="p-2 border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 rounded-lg hover:border-blue-500 hover:text-blue-500 cursor-pointer flex items-center justify-center"
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
                        className="flex-grow bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 px-4 py-2.5 text-xs rounded-lg text-zinc-800 dark:text-white"
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
