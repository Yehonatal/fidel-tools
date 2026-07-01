"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BarChart3, Gamepad, Play, Award, CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react";

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

export default function LexicalAnalyzePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ት/ቤት መሄድ ግዴታ ነው። አ.አ 2015 ዓ.ም ተመሰረተ። መ/ቤት ተዘጋ።");
  const [resultText, setResultText] = useState("");
  const [loading, setLoading] = useState(false);

  // Expand or Explode Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStep, setGameStep] = useState<1 | 2>(1); // 1 = Spot Abbreviation, 2 = Type Expansion
  const [clickedWord, setClickedWord] = useState<string | null>(null);
  const [typedExpansion, setTypedExpansion] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "spotted" | "exploded" | null>(null);

  const currentRound = EXP_ROUNDS[roundIdx];

  const runLexicalAnalyze = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/lexical-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setResultText(data.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runLexicalAnalyze(text);
    }
  }, [mode]);

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

  if (mode === "fun") {
    // ── FUN MODE: EXPAND OR EXPLODE GAME ────────────────────────────────────
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
              transition: all 0.1s ease-out;
            }
            .dark .cartoon-card {
              border: 3px solid #f59e0b;
              box-shadow: 5px 5px 0px 0px #f59e0b;
            }
            .cartoon-card:hover:not(:disabled) {
              transform: translate(1px, 1px);
              box-shadow: 3px 3px 0px 0px #000;
            }
            .dark .cartoon-card:hover:not(:disabled) {
              box-shadow: 3px 3px 0px 0px #f59e0b;
            }
          `
        }} />

        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-4xl border-b-4 border-black dark:border-amber-500 pb-6">
          <div className="flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
            <span>💥 LEVEL 8: EXPAND OR EXPLODE 💥</span>
          </div>
          <h2 className="text-4xl font-black tracking-wider text-black dark:text-amber-500">
            EXPAND OR EXPLODE
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Spot the abbreviation contraction in the sentence first, then type its full expanded form!
          </p>
        </div>

        {!isPlaying ? (
          <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-md w-full text-center space-y-6">
            <div className="text-5xl">💥</div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                Enter Expander Arena?
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Two steps per round: first tap the elided abbreviation within the sentence layout. Then type the expanded canonical words. Spotting gives 40 pts, expanding gives 60 pts!
              </p>
            </div>
            {score > 0 && (
              <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-[#25201c] dark:border-amber-500 dark:text-amber-350">
                PREVIOUS SCORE: {score} PTS
              </div>
            )}
            <button
              onClick={startGame}
              className="w-full py-3.5 bg-amber-400 border-[3px] border-black text-black font-black uppercase tracking-widest text-xs rounded-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono dark:border-amber-500"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-8 max-w-xl w-full flex flex-col justify-between min-h-[420px] relative space-y-6">
            
            {/* Top stats HUD */}
            <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black">
              <span>ROUND {roundIdx + 1} / {EXP_ROUNDS.length}</span>
              <span>SCORE: {score} PTS</span>
            </div>

            {/* Instruction Bubble */}
            <div className="w-full cartoon-border p-4 bg-cyan-100 dark:bg-cyan-950/20 text-xs font-black text-center text-zinc-800 dark:text-amber-200">
              {gameStep === 1 ? (
                <span>STEP 1: TAP THE ABBREVIATION IN THE SENTENCE</span>
              ) : (
                <span>STEP 2: TYPE THE CORRECT FULL EXPANSION</span>
              )}
            </div>

            {/* Step 1: Clickable Sentence Layout */}
            {gameStep === 1 && (
              <div className="flex flex-wrap gap-3 items-center justify-center py-6 min-h-[120px]">
                {currentRound.words.map((w, idx) => {
                  const isClicked = clickedWord === w;
                  const isSpotted = isClicked && feedback === "spotted";
                  const isExploded = isClicked && feedback === "exploded";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleWordClick(w)}
                      disabled={feedback !== null}
                      className={`cartoon-card px-4 py-2 text-sm font-black rounded-lg transition-all font-sans cursor-pointer ${
                        isSpotted
                          ? "bg-green-400 border-black text-black"
                          : isExploded
                          ? "bg-red-400 border-black text-white"
                          : "bg-white border-black text-black dark:bg-zinc-905 dark:text-white dark:border-amber-500"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Typing Expansion Form */}
            {gameStep === 2 && (
              <div className="space-y-6 flex-grow flex flex-col justify-center items-center">
                <span className="text-[10px] text-zinc-550 dark:text-zinc-400 uppercase tracking-widest font-black">
                  EXPAND: {currentRound.abbrevWord}
                </span>

                <form onSubmit={handleExpansionSubmit} className="w-full max-w-sm space-y-4">
                  <input
                    type="text"
                    autoFocus
                    disabled={feedback !== null}
                    value={typedExpansion}
                    onChange={(e) => setTypedExpansion(e.target.value)}
                    placeholder="Type full expansion (e.g. ትምህርት ቤት)..."
                    className="w-full bg-white border-[3px] border-black focus:bg-amber-50 dark:bg-black dark:border-amber-500 dark:focus:border-amber-500 outline-none text-center py-3 text-sm rounded-xl text-black dark:text-amber-100 font-sans font-black shadow-[3px_3px_0px_0px_#000] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-[1px_1px_0px_0px_#000] transition-all"
                  />

                  {feedback && (
                    <div className="cartoon-border p-3 bg-cyan-100 dark:bg-cyan-950/20 text-[10px] font-black text-center text-zinc-700 dark:text-amber-300 rounded-lg">
                      {feedback === "correct" ? "EXACT EXPANSION!" : `INCORRECT! Correct is: "${currentRound.correctExpansion}"`}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={feedback !== null || loading}
                    className="w-full py-3 bg-amber-400 border-[3px] border-black text-black font-black text-xs uppercase rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                  >
                    {loading ? "NORMALIZING..." : "SUBMIT EXPANSION"}
                  </button>
                </form>
              </div>
            )}

            {/* Bottom State Messages */}
            <div className="min-h-[24px] text-center">
              {feedback === "spotted" && (
                <span className="text-xs font-black text-green-700 dark:text-amber-400 uppercase tracking-wider animate-bounce">
                  🎯 SPOTTED! Moving to expansion...
                </span>
              )}
              {feedback === "exploded" && (
                <span className="text-xs font-black text-red-550 uppercase tracking-wider">
                  💥 EXPLODED! That is not an abbreviation.
                </span>
              )}
            </div>

          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: CONSOLE VIEW ──────────────────────────────────────────
  const codeSnippet = `// Contraction Expansion Endpoint
const res = await fetch('/api/lexical-analyze', {
  method: 'POST',
  body: JSON.stringify({ 
    text: "ት/ቤት መሄድ ግዴታ ነው።" 
  })
});
const { result } = await res.json();
console.log(result); // "ትምህርት ቤት መሄድ ግዴታ ነው።"`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Contractions & Lexical Analyzer reference Console
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Resolve dialectal contractions, abbreviations, and orthographic expansions according to grammatical context mapping.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between font-mono text-[9px] font-bold text-zinc-405 uppercase tracking-wider">
                <span>Contraction Input Testbed</span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[160px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={() => runLexicalAnalyze(text)}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer font-mono"
                >
                  Expand Contractions
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Expander Integration" code={codeSnippet} />
          </div>

          {/* Results Comparison Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between font-mono text-[9px] font-bold text-zinc-405 uppercase tracking-wider">
                <span>Expanded Output Results</span>
              </div>
              <div className="p-6 space-y-6 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider mb-1">Source Text</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950 rounded-lg text-zinc-800 dark:text-zinc-300 font-medium select-all leading-relaxed">
                    {text}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 dark:text-zinc-655 block text-[9px] uppercase tracking-wider mb-1">Expanded Text Output</span>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-950 rounded-lg text-blue-600 dark:text-emerald-400 font-bold select-all leading-relaxed">
                    {resultText || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
