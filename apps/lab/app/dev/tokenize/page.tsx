"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { Activity, Gamepad, Play, RotateCcw, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

const GAME_SENTENCES = [
  { full: "ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።", tokens: ["ትላንትና", "ማታ", "ወደ", "መርካቶ", "ሄዶ", "ነበረ።"] },
  { full: "ከተማዋ በምሽት እጅግ በጣም ታምራለች።", tokens: ["ከተማዋ", "በምሽት", "እጅግ", "በጣም", "ታምራለች።"] },
  { full: "ልጆቹ በደስታ በሜዳው ላይ ይጫወታሉ።", tokens: ["ልጆቹ", "በደስታ", "በሜዳው", "ላይ", "ይጫወታሉ።"] },
];

export default function TokenizePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ። የአዲስ አበባ ከተማ እጅግ ትልቅ ነው።");
  const [sentences, setSentences] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Token Ninja states
  const [level, setLevel] = useState(0);
  const [shuffledTiles, setShuffledTiles] = useState<string[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [gameWin, setGameWin] = useState(false);
  const [score, setScore] = useState(0);

  const runTokenize = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setSentences(data.sentences || []);
      setWords(data.words || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTokenize(text);
  }, []);

  // Initialize Game level
  const initGameLevel = (lvlNum: number) => {
    setLevel(lvlNum);
    const sourceTokens = [...GAME_SENTENCES[lvlNum].tokens];
    // Shuffle tiles
    const shuffled = [...sourceTokens].sort(() => Math.random() - 0.5);
    setShuffledTiles(shuffled);
    setUserSelection([]);
    setGameWin(false);
  };

  useEffect(() => {
    initGameLevel(0);
  }, []);

  const handleTileClick = (tile: string, index: number) => {
    if (userSelection.includes(tile)) return;
    const nextSelection = [...userSelection, tile];
    setUserSelection(nextSelection);
    
    // Check if matching target full sentence tokens
    const targetTokens = GAME_SENTENCES[level].tokens;
    if (nextSelection.length === targetTokens.length) {
      const isCorrect = JSON.stringify(nextSelection) === JSON.stringify(targetTokens);
      if (isCorrect) {
        setScore((prev) => prev + 30);
        setGameWin(true);
      }
    }
  };

  const resetLevel = () => {
    initGameLevel(level);
  };

  const nextLevel = () => {
    const nextLvl = (level + 1) % GAME_SENTENCES.length;
    initGameLevel(nextLvl);
  };

  if (mode === "fun") {
    // ── FUN MODE: TOKEN NINJA TILE GAME ────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 4: TOKEN ORDERING</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            TOKEN NINJA
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
            Reconstruct the original sentence by tapping the token tiles in the correct order!
          </p>
        </div>

        {/* Game UI */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-xl w-full flex flex-col items-center gap-8 shadow-inner">
          <div className="w-full flex items-center justify-between border-b border-zinc-250 dark:border-zinc-800/80 pb-3 text-xs font-bold text-zinc-450 dark:text-zinc-550">
            <span>LEVEL {level + 1} / {GAME_SENTENCES.length}</span>
            <span>SCORE: {score} PTS</span>
          </div>

          {/* User Selection Display */}
          <div className="w-full min-h-[50px] p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex flex-wrap gap-2 items-center justify-center">
            {userSelection.length > 0 ? (
              userSelection.map((w, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded bg-blue-500/10 text-blue-600 dark:bg-amber-500/10 dark:text-amber-450 border border-blue-500/20 dark:border-amber-500/20 text-xs font-bold font-sans"
                >
                  {w}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                Tap tiles below in correct sequence
              </span>
            )}
          </div>

          {/* Shuffled Tiles to Click */}
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {shuffledTiles.map((tile, i) => {
              const isSelected = userSelection.includes(tile);
              return (
                <button
                  key={i}
                  disabled={isSelected || gameWin}
                  onClick={() => handleTileClick(tile, i)}
                  className={`px-4 py-2 border-2 text-xs font-bold rounded-lg transition-all font-sans active:scale-95 cursor-pointer ${
                    isSelected
                      ? "border-zinc-200/40 bg-zinc-100 text-zinc-400 dark:border-zinc-800/40 dark:bg-zinc-950/20 dark:text-zinc-650 cursor-not-allowed"
                      : "border-blue-500 hover:bg-blue-50 text-blue-600 dark:border-amber-500 dark:hover:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  {tile}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="w-full flex items-center justify-between border-t border-dashed border-zinc-250 dark:border-zinc-800/80 pt-4">
            <button
              onClick={resetLevel}
              className="px-4 py-2 text-[10px] font-bold border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900/50 text-zinc-550 dark:text-zinc-400 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            {gameWin && (
              <div className="flex items-center gap-4 animate-bounce">
                <span className="text-xs font-bold text-blue-600 dark:text-emerald-405 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> SUCCESS!
                </span>
                <button
                  onClick={nextLevel}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 text-white dark:text-black text-[10px] font-bold rounded-lg active:scale-95 transition-all cursor-pointer uppercase"
                >
                  NEXT LEVEL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: TOKEN VIEWER ──────────────────────────────────────────
  const codeSnippet = `// Tokenizer API Call
const res = await fetch('/api/tokenize', {
  method: 'POST',
  body: JSON.stringify({ text: rawText })
});
const { sentences, words } = await res.json();
console.log(sentences); // Array of sentence strings
console.log(words);     // Array of word token strings`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Sentence & Word Tokenizer Console
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Splits bulk Amharic corpus structures into discrete sentence layers and individual orthographic word units.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Text Input
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-805 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={() => runTokenize(text)}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  Tokenize
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Tokens Array Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card p-6 space-y-6">
              
              {/* Sentences */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono border-b border-zinc-200 dark:border-zinc-900 pb-2">
                  Sentence Boundary Array ({sentences.length})
                </h3>
                <div className="space-y-2">
                  {sentences.map((sent, i) => (
                    <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200/60 dark:border-zinc-900 font-sans text-xs font-semibold flex gap-3 text-zinc-700 dark:text-zinc-300">
                      <span className="text-blue-500 font-mono">[{i}]</span>
                      <span>{sent}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Word Tokens */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono border-b border-zinc-200 dark:border-zinc-900 pb-2">
                  Word Token Array ({words.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-1">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/10 dark:border-blue-900/20 text-xs font-bold font-sans"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
