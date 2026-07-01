"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { X, Gamepad, Play, Award, Heart, CheckCircle2, RefreshCw } from "lucide-react";

const GAME_LEVELS = [
  {
    sentence: "ሰውየው እና ልጆቹ ወደ ቤት ሄዱ።",
    words: [
      { text: "ሰውየው", isStopword: false },
      { text: "እና", isStopword: true },
      { text: "ልጆቹ", isStopword: false },
      { text: "ወደ", isStopword: true },
      { text: "ቤት", isStopword: false },
      { text: "ሄዱ።", isStopword: false },
    ],
  },
  {
    sentence: "በከተማው ውስጥ ብዙ ሰላም ነበር።",
    words: [
      { text: "በከተማው", isStopword: false },
      { text: "ውስጥ", isStopword: true },
      { text: "ብዙ", isStopword: true },
      { text: "ሰላም", isStopword: false },
      { text: "ነበር።", isStopword: false },
    ],
  },
];

export default function RemoveStopwordsPage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("እሱ እና ጓደኞቹ በከተማው ውስጥ ወደሚገኘው ትልቅ ት/ቤት አብረው ሄዱ።");
  const [cleanText, setCleanText] = useState("");
  const [loading, setLoading] = useState(false);

  // Game States
  const [level, setLevel] = useState(0);
  const [activeWords, setActiveWords] = useState<Array<{ text: string; isStopword: boolean; tapped?: boolean }>>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameWin, setGameWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const runStopwords = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/remove-stopwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setCleanText(data.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runStopwords(text);
  }, []);

  // Initialize Game level
  const initGameLevel = (lvlNum: number) => {
    setLevel(lvlNum);
    const wordsCopy = GAME_LEVELS[lvlNum].words.map(w => ({ ...w, tapped: false }));
    setActiveWords(wordsCopy);
    setLives(3);
    setGameWin(false);
    setGameOver(false);
  };

  useEffect(() => {
    initGameLevel(0);
  }, []);

  const handleWordTap = (index: number) => {
    if (gameOver || gameWin) return;
    const word = activeWords[index];
    if (word.tapped) return;

    const copy = [...activeWords];
    copy[index].tapped = true;
    setActiveWords(copy);

    if (word.isStopword) {
      setScore((prev) => prev + 15);
      // Check if all stopwords are swept
      const remainingStopwords = copy.filter(w => w.isStopword && !w.tapped);
      if (remainingStopwords.length === 0) {
        setGameWin(true);
      }
    } else {
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setGameOver(true);
        }
        return nextLives;
      });
    }
  };

  const resetGame = () => {
    initGameLevel(level);
  };

  const nextLevel = () => {
    const nextLvl = (level + 1) % GAME_LEVELS.length;
    initGameLevel(nextLvl);
  };

  if (mode === "fun") {
    // ── FUN MODE: STOPWORD SWEEP GAME ─────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 5: SEMANTIC CLEANSER</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            STOPWORD SWEEP
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
            Tap and sweep away only the grammatical stopwords to extract the core words!
          </p>
        </div>

        {/* Game Area */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-xl w-full flex flex-col items-center gap-8 shadow-inner">
          <div className="w-full flex items-center justify-between border-b border-zinc-250 dark:border-zinc-800/80 pb-3 text-xs font-bold text-zinc-450 dark:text-zinc-550">
            <span>LEVEL {level + 1} / {GAME_LEVELS.length}</span>
            <div className="flex gap-1 items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < lives ? "text-red-505 fill-current" : "text-zinc-200 dark:text-zinc-800"}`}
                />
              ))}
            </div>
          </div>

          {/* Word Bubble Grid */}
          <div className="flex flex-wrap gap-4 items-center justify-center min-h-[120px] p-6 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850">
            {activeWords.map((word, i) => (
              <button
                disabled={word.tapped || gameOver || gameWin}
                onClick={() => handleWordTap(i)}
                key={i}
                className={`px-4 py-3 rounded-full text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer border ${
                  word.tapped
                    ? word.isStopword
                      ? "border-emerald-500/20 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450/40 line-through cursor-not-allowed"
                      : "border-red-500/20 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 text-red-550 dark:text-red-500/40 cursor-not-allowed"
                    : "border-blue-500/30 bg-white dark:border-amber-500/40 dark:bg-zinc-900/60 text-blue-600 dark:text-amber-300 hover:border-blue-500 dark:hover:border-amber-500 hover:bg-blue-50/30 dark:hover:bg-amber-500/5"
                }`}
              >
                {word.text}
              </button>
            ))}
          </div>

          {/* End Level / Retry HUD */}
          <div className="w-full flex items-center justify-between border-t border-dashed border-zinc-250 dark:border-zinc-800/80 pt-4">
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550">SCORE: {score} PTS</span>

            {gameOver && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-red-550">GAME OVER</span>
                <button
                  onClick={resetGame}
                  className="px-4 py-1.5 bg-zinc-100 border border-zinc-250 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold rounded-lg hover:bg-zinc-200 cursor-pointer"
                >
                  RETRY
                </button>
              </div>
            )}

            {gameWin && (
              <div className="flex items-center gap-3 animate-bounce">
                <span className="text-xs font-bold text-blue-600 dark:text-emerald-405 flex items-center gap-1">
                  <CheckCircle2 className="w-4.5 h-4.5" /> CLEARED!
                </span>
                <button
                  onClick={nextLevel}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 text-white dark:text-black text-[10px] font-bold rounded-lg hover:bg-zinc-900 cursor-pointer uppercase"
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

  // ── ACADEMIC MODE: BEFORE/AFTER FILTER ──────────────────────────────────
  const codeSnippet = `// Stopword Removal API Call
const res = await fetch('/api/remove-stopwords', {
  method: 'POST',
  body: JSON.stringify({ text: rawText })
});
const { result } = await res.json();
console.log(result); // Text string with grammatical stopwords filtered`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <X className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Stopwords Removal Stage
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Strip highly recurrent function words (e.g. preposition markers, coordinating links) to focus query evaluation strictly on vocabulary nodes.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Input Corpus
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={() => runStopwords(text)}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  Filter Text
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Clean Output Comparison */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Before */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-405 uppercase tracking-wider font-mono">
                  Original Source Corpus
                </h3>
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-sm font-sans font-medium leading-relaxed text-zinc-800 dark:text-zinc-300">
                  {text}
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-405 uppercase tracking-wider font-mono">
                  Cleaned Index Target
                </h3>
                <div className="p-4 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-900/30 text-sm font-sans font-medium leading-relaxed text-blue-650 dark:text-sky-400">
                  {cleanText || "-"}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
