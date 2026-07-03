"use client";

import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

interface ExpRound {
  id: number;
  sentence: string;
  abbrevWord: string;
  correctExpansion: string;
  words: string[];
}

const EXP_ROUNDS: ExpRound[] = [
  {
    id: 1,
    sentence: "ትላንትና ወደ ት/ቤት ሄዶ ነበረ።",
    abbrevWord: "ት/ቤት",
    correctExpansion: "ትምህርት ቤት",
    words: ["ትላንትና", "ወደ", "ት/ቤት", "ሄዶ", "ነበረ።"],
  },
  {
    id: 2,
    sentence: "ምክር ቤቱ በ 2015 ዓ.ም አዲስ ረቂቅ አወጣ።",
    abbrevWord: "ዓ.ም",
    correctExpansion: "ዓመተ ምሕረት",
    words: ["ምክር", "ቤቱ", "በ", "2015", "ዓ.ም", "አዲስ", "ረቂቅ", "አወጣ።"],
  },
  {
    id: 3,
    sentence: "ዋና ጽ/ቤት አዲስ አበባ ይገኛል።",
    abbrevWord: "ጽ/ቤት",
    correctExpansion: "ጽሕፈት ቤት",
    words: ["ዋና", "ጽ/ቤት", "አዲስ", "አበባ", "ይገኛል።"],
  },
  {
    id: 4,
    sentence: "እሱ በመስሪያ መ/ቤት ውስጥ ይሰራል ።",
    abbrevWord: "መ/ቤት",
    correctExpansion: "መስሪያ ቤት",
    words: ["እሱ", "በመስሪያ", "መ/ቤት", "ውስጥ", "ይሰራል", "።"],
  },
];

export default function LexicalAnalyzePuzzlePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStep, setGameStep] = useState<1 | 2>(1); // 1 = Spot Abbreviation, 2 = Type Expansion
  const [clickedWord, setClickedWord] = useState<string | null>(null);
  const [typedExpansion, setTypedExpansion] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "spotted" | "exploded" | null>(null);
  const [loading, setLoading] = useState(false);

  const currentRound = EXP_ROUNDS[roundIdx];

  const startGame = () => {
    setIsPlaying(true);
    setRoundIdx(0);
    setScore(0);
    setGameStep(1);
    setClickedWord(null);
    setTypedExpansion("");
    setFeedback(null);
  };

  const handleWordClick = (word: string) => {
    if (gameStep !== 1 || feedback !== null) return;
    setClickedWord(word);

    // Clean word from punctuation for comparison
    const cleanWord = word.replace(/[።፣፤፥፦]/g, "").trim();
    const cleanTarget = currentRound.abbrevWord.trim();

    if (cleanWord === cleanTarget) {
      setFeedback("spotted");
      setScore((s) => s + 40); // 40 points for spotting abbreviation
      setTimeout(() => {
        setGameStep(2);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback("exploded");
      setScore((s) => Math.max(0, s - 10)); // small penalty
      setTimeout(() => {
        setFeedback(null);
        setClickedWord(null);
      }, 1200);
    }
  };

  const handleExpansionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameStep !== 2 || feedback !== null) return;

    setLoading(true);
    try {
      // Call API to normalize expansion/compare
      const response = await fetch("/api/lexical-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: typedExpansion }),
      });
      const data = await response.json();
      const apiResult = data.result || typedExpansion;
      
      const cleanTarget = currentRound.correctExpansion.replace(/[።፣፤፥፦]/g, "").trim();
      const cleanApi = apiResult.replace(/[።፣፤፥፦]/g, "").trim();
      
      const isCorrect = cleanApi.toLowerCase() === cleanTarget.toLowerCase() || 
                        typedExpansion.trim().toLowerCase() === currentRound.correctExpansion.trim().toLowerCase();

      if (isCorrect) {
        setFeedback("correct");
        setScore((s) => s + 60); // 60 points for correct typing expansion (total 100)
      } else {
        setFeedback("incorrect");
      }

      setTimeout(() => {
        if (roundIdx < EXP_ROUNDS.length - 1) {
          setRoundIdx((r) => r + 1);
          setGameStep(1);
          setClickedWord(null);
          setTypedExpansion("");
          setFeedback(null);
        } else {
          setIsPlaying(false);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          .cartoon-card {
            border: 3px solid #000;
            box-shadow: 5px 5px 0px 0px #000;
            transition: all 0.1s ease-out;
          }
          .dark .cartoon-card {
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
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                  EXPAND OR EXPLODE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                  Level 8
                </span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                Spot the abbreviation contraction in the sentence first, then type its full expanded form!
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
              <div className="text-5xl">💥</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                  Enter Expander Arena?
                </h3>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold font-mono">
                  Two steps per round: first tap the elided abbreviation within the sentence layout. Then type the expanded canonical words. Spotting gives 40 pts, expanding gives 60 pts!
                </p>
              </div>
              {score > 0 && (
                <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-[#25201c] dark:border-amber-500 dark:text-amber-300">
                  LAST SCORE: {score} PTS
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
              {/* Top status HUD */}
              <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black select-none">
                <span className="text-zinc-500 dark:text-zinc-400">LEVEL {roundIdx + 1} / {EXP_ROUNDS.length}</span>
                <span className="text-amber-600 dark:text-amber-500">SCORE: {score} PTS</span>
              </div>

              {/* Step indicator */}
              <div className="my-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-450">
                  {gameStep === 1 ? "STEP 1: SPOT THE ABBREVIATION" : "STEP 2: TYPE FULL CANONICAL EXPANSION"}
                </span>
              </div>

              {/* Main sentence interface */}
              <div className="flex-grow flex items-center justify-center py-6 select-none">
                {gameStep === 1 ? (
                  <div className="flex flex-wrap gap-3 justify-center items-center">
                    {currentRound.words.map((word, i) => {
                      const isTarget = word.replace(/[።፣፤፥፦]/g, "").trim() === currentRound.abbrevWord;
                      const isClicked = clickedWord === word;
                      
                      let bgClass = "bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800";
                      if (isClicked) {
                        bgClass = isTarget ? "bg-green-400 text-black border-black" : "bg-red-400 text-white border-black";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleWordClick(word)}
                          disabled={feedback !== null}
                          className={`cartoon-card px-4 py-2 text-xs font-black uppercase rounded-lg transition-transform ${bgClass} cursor-pointer`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full space-y-4 text-center">
                    <span className="text-xs font-bold text-zinc-500 block">ABBREVIATION SPOTTED:</span>
                    <span className="text-3xl font-black text-blue-600 dark:text-amber-400 font-sans block animate-pulse">
                      {currentRound.abbrevWord}
                    </span>

                    {/* Feedback message */}
                    <div className="h-6 flex items-center justify-center">
                      {feedback === "correct" && (
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-bounce">
                          🎉 CORRECT EXPANSION! (+60 PTS)
                        </span>
                      )}
                      {feedback === "incorrect" && (
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest animate-shake">
                          💥 BOOM! INCORRECT EXPANSION!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback messages for Step 1 */}
              {feedback === "spotted" && (
                <div className="cartoon-border p-4 bg-green-50 text-xs font-bold rounded-lg text-center dark:bg-zinc-950 dark:border-amber-500 mb-4 animate-bounce">
                  🎯 Abbreviation Spotted! Prepare to expand it!
                </div>
              )}
              {feedback === "exploded" && (
                <div className="cartoon-border p-4 bg-red-50 text-xs font-bold rounded-lg text-center dark:bg-zinc-950 dark:border-amber-500 mb-4 animate-shake text-red-650">
                  💥 Mistake! That is a standard word, not a contraction! (-10 PTS)
                </div>
              )}

              {/* Input for Step 2 */}
              {gameStep === 2 && (
                <form onSubmit={handleExpansionSubmit} className="pt-4 border-t-2 border-dashed border-black dark:border-amber-500 flex gap-4">
                  <input
                    type="text"
                    value={typedExpansion}
                    onChange={(e) => setTypedExpansion(e.target.value)}
                    disabled={feedback !== null}
                    autoFocus
                    placeholder="Type full words (e.g. ትምህርት ቤት)..."
                    className="flex-grow bg-zinc-50 border-2 border-black rounded-lg py-2.5 px-3 text-xs font-black text-black placeholder-zinc-450 focus:outline-hidden dark:bg-zinc-900 dark:text-white dark:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={feedback !== null || loading}
                    className="px-6 bg-amber-400 border-[3px] border-black text-black text-xs font-black uppercase rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 shadow-[2px_2px_0px_0px_#000] cursor-pointer dark:border-amber-500"
                  >
                    Expand
                  </button>
                </form>
              )}

            </div>
          )}
        </div>

        {/* Right Column: Educational Concept Card (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 w-full font-mono">
          {/* Performance HUD */}
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
              🎮 STATUS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                <p className="text-2xl font-black text-black dark:text-white leading-none">{score}</p>
                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">SCORE</p>
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
                Lexical Expansion (Normalization)
              </h4>
            </div>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              Abbreviated words (e.g. ት/ቤት) confuse NLP parser models and lower index matching recall. Lexical normalizers translate these orthographic abbreviations back to their canonical multi-word tokens.
            </p>
            <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
              <ul className="list-disc pl-4 text-[10px] text-zinc-605 dark:text-zinc-400 space-y-1 font-semibold">
                <li>Study the sentence list buttons.</li>
                <li>Tap the button representing the contracted abbreviation word (e.g. ት/ቤት) to spot it.</li>
                <li>Type the true expanded canonical words (e.g. ትምህርት ቤት) to complete the round!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
