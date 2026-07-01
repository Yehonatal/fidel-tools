"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { Compass, Gamepad, Play, RotateCcw, AlertTriangle, RefreshCw, Zap } from "lucide-react";

// Game Dictionary mapping complex words to their expected stems
const DICTIONARY = [
  { word: "ልጆቻችን", stem: "ልጅ" },
  { word: "ቤቶቻቸው", stem: "ቤት" },
  { word: "መጽሐፍቱ", stem: "መጽሐፍ" },
  { word: "ትምህርቶች", stem: "ትምህርት" },
  { word: "መምህራን", stem: "መምህር" },
  { word: "ሀገራችን", stem: "ሀገር" },
  { word: "ከተማዋ", stem: "ከተማ" },
  { word: "ቀኖቹ", stem: "ቀን" },
];

export default function StemPage() {
  const { mode } = useLabMode();
  const [inputText, setInputText] = useState("ልጆቻችን ቤቶቻቸው መጽሐፍቱ መምህራን");
  const [stemmedList, setStemmedList] = useState<Array<{ word: string; stem: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Stem Sprint states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedStem, setTypedStem] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordY, setWordY] = useState(0); // vertical position percentage
  const [gameOver, setGameOver] = useState(false);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const runStem = async (inputVal: string) => {
    const words = inputVal.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });
      const data = await response.json();
      setStemmedList(data.stems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runStem(inputText);
  }, []);

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWordY(0);
    setTypedStem("");
    pickRandomWord();
  };

  const pickRandomWord = () => {
    const rand = Math.floor(Math.random() * DICTIONARY.length);
    setCurrentIndex(rand);
    setWordY(0);
    
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    
    gameIntervalRef.current = setInterval(() => {
      setWordY((prev) => {
        if (prev >= 100) {
          clearInterval(gameIntervalRef.current!);
          handleMiss();
          return 0;
        }
        return prev + 5; // speed increment
      });
    }, 150);
  };

  const handleMiss = () => {
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      } else {
        pickRandomWord();
      }
      return nextLives;
    });
  };

  const handleZapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying || gameOver) return;

    const targetStem = DICTIONARY[currentIndex].stem;
    if (typedStem.trim() === targetStem) {
      setScore((prev) => prev + 25);
      setTypedStem("");
      pickRandomWord(); // zap & next
    } else {
      setTypedStem(""); // flash input error (could style it red)
    }
  };

  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  if (mode === "fun") {
    // ── FUN MODE: FALLING WORD SPRINT ─────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 6: MORPHOLOGY ZAPPER</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            STEM SPRINT
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">
            Type the base stem of the falling Amharic word to zap it before it hits the ground!
          </p>
        </div>

        {!isPlaying ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full text-center space-y-6 shadow-inner animate-in scale-in duration-300">
            <div className="text-5xl">⚡</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-650 dark:text-amber-400 uppercase tracking-wider">
                Stem Sprint Arena
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Type the canonical base stem (e.g. for &quot;ልጆቻችን&quot; type &quot;ልጅ&quot;). Zap as many as you can. 3 misses and it&apos;s game over!
              </p>
            </div>
            {score > 0 && (
              <div className="text-sm font-bold text-blue-600 dark:text-amber-400 border border-blue-500/20 dark:border-amber-500/20 bg-blue-500/5 dark:bg-amber-500/5 py-2 rounded">
                SCORE: {score} PTS
              </div>
            )}
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg active:scale-98 transition-all cursor-pointer font-mono"
            >
              Enter Arena
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full flex flex-col justify-between shadow-inner min-h-[420px] relative overflow-hidden">
            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-zinc-250 dark:border-zinc-800/80 pb-3 text-xs font-bold text-zinc-450 dark:text-zinc-555">
              <span>SCORE: {score}</span>
              <span>LIVES: {lives} / 3</span>
            </div>

            {/* Falling word track container */}
            <div className="relative flex-grow w-full border border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-black/40 rounded-lg my-4 overflow-hidden min-h-[220px]">
              {/* Falling Word */}
              <div
                className="absolute left-0 right-0 text-center transition-all duration-150 ease-linear"
                style={{ top: `${wordY}%`, transform: "translateY(-50%)" }}
              >
                <span className="px-3.5 py-1.5 rounded-lg border border-blue-500 bg-white dark:border-amber-500 dark:bg-zinc-950 font-bold text-lg text-blue-600 dark:text-white font-sans shadow-md animate-pulse">
                  {DICTIONARY[currentIndex].word}
                </span>
              </div>
            </div>

            {/* Typing form input */}
            <form onSubmit={handleZapSubmit} className="w-full space-y-4">
              <input
                type="text"
                autoFocus
                value={typedStem}
                onChange={(e) => setTypedStem(e.target.value)}
                placeholder="Type stem and press Enter..."
                className="w-full bg-white border-2 border-blue-500/50 focus:border-blue-600 dark:bg-zinc-950 dark:border-amber-500/55 dark:focus:border-amber-500 outline-none text-center py-3 text-sm rounded-lg text-zinc-800 dark:text-white font-sans font-bold"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 text-white dark:text-black font-bold text-xs uppercase rounded-lg cursor-pointer"
              >
                ZAP!
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: STEM TABLE ───────────────────────────────────────────
  const codeSnippet = `// Morphological Stemmer API Call
const res = await fetch('/api/stem', {
  method: 'POST',
  body: JSON.stringify({ 
    words: ["ልጆቻችን", "ቤቶቻቸው"] 
  })
});
const { stems } = await res.json();
console.log(stems); 
// Output: [{ word: "ልጆቻችን", stem: "ልጅ" }, ...]`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Morphological Light Stemmer Console
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Reduces inflected and derived Amharic word structures to their canonical dictionary stem form.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Stemmer Word Corpus
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={() => runStem(inputText)}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  Stem Words
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Stems Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card overflow-hidden">
              <table className="w-full border-collapse text-left font-sans text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider font-mono">
                    <th className="px-6 py-3">Inflected Source Word</th>
                    <th className="px-6 py-3">Canonical Base Stem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 font-medium">
                  {stemmedList.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300">
                      <td className="px-6 py-3.5 font-bold font-sans">{item.word}</td>
                      <td className="px-6 py-3.5 text-blue-600 dark:text-sky-400 font-bold font-sans">{item.stem}</td>
                    </tr>
                  ))}
                  {stemmedList.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-10 text-center text-zinc-400 font-mono">
                        No stems computed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
