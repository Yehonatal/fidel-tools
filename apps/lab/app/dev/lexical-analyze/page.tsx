"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BarChart3, Gamepad, Play, Award, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const GAME_QUESTIONS = [
  {
    abbreviation: "ት/ቤት",
    correct: "ትምህርት ቤት",
    options: ["ትምህርት ቤት", "ትንሽ ቤት", "ትልቅ ቤት", "ትናንት ቤት"],
  },
  {
    abbreviation: "ዓ.ም",
    correct: "ዓመተ ምሕረት",
    options: ["ዓመተ ምሕረት", "ዓመተ ማርያም", "ዓመተ ምድር", "ዓመተ ምሕንድስና"],
  },
  {
    abbreviation: "አ.አ",
    correct: "አዲስ አበባ",
    options: ["አዲስ አበባ", "አባይ አምባ", "አዋሽ አምባ", "አሰላ አርሲ"],
  },
  {
    abbreviation: "መ/ቤት",
    correct: "መስሪያ ቤት",
    options: ["መስሪያ ቤት", "መኝታ ቤት", "መጸዳጃ ቤት", "መጋዘን ቤት"],
  },
  {
    abbreviation: "ክ/ከተማ",
    correct: "ክፍለ ከተማ",
    options: ["ክፍለ ከተማ", "ክፍት ከተማ", "ክፉ ከተማ", "ክቡር ከተማ"],
  },
];

export default function LexicalAnalyzePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState("ት/ቤት መሄድ ግዴታ ነው። አ.አ 2015 ዓ.ም ተመሰረተ። መ/ቤት ተዘጋ።");
  const [resultText, setResultText] = useState("");
  const [loading, setLoading] = useState(false);

  // Abbreviation Buster states
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

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
    runLexicalAnalyze(text);
  }, []);

  const startTrivia = () => {
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setCombo(1);
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleOptionClick = (option: string) => {
    if (feedback !== null) return;
    setSelectedOption(option);
    
    const isCorrect = option === GAME_QUESTIONS[round].correct;
    if (isCorrect) {
      setScore((prev) => prev + 20 * combo);
      setCombo((prev) => prev + 1);
      setFeedback("correct");
    } else {
      setCombo(1);
      setFeedback("incorrect");
    }

    setTimeout(() => {
      if (round < GAME_QUESTIONS.length - 1) {
        setRound((prev) => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setIsPlaying(false);
      }
    }, 1500);
  };

  if (mode === "fun") {
    // ── FUN MODE: ABBREVIATION BUSTER TRIVIA ────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 8: ABBREVIATION BUSTER</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            ABBREVIATION BUSTER
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-455 uppercase tracking-wider">
            Choose the correct expansion for the given Amharic abbreviation contraction!
          </p>
        </div>

        {!isPlaying ? (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full text-center space-y-6 shadow-inner">
            <div className="text-5xl">💥</div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-amber-400 uppercase tracking-wider">
                Contraction Arena
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Expand abbreviations under fire! Get consecutive answers correct to build your Combo Multiplier and stack points!
              </p>
            </div>
            {score > 0 && (
              <div className="text-sm font-bold text-blue-600 dark:text-amber-400 border border-blue-500/20 dark:border-amber-500/20 bg-blue-500/5 dark:bg-amber-500/5 py-2 rounded">
                SCORE: {score} PTS (COMBO MAX: {combo})
              </div>
            )}
            <button
              onClick={startTrivia}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg active:scale-98 transition-all cursor-pointer"
            >
              Start Busting
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-8 max-w-md w-full flex flex-col items-center justify-between shadow-inner min-h-[380px] relative overflow-hidden">
            {/* Round info */}
            <div className="w-full flex items-center justify-between border-b border-dashed border-zinc-250 dark:border-zinc-800/80 pb-3 text-xs font-bold text-zinc-450 dark:text-zinc-550">
              <span>QUESTION {round + 1} / {GAME_QUESTIONS.length}</span>
              <span className="text-blue-650 dark:text-orange-500">COMBO: X{combo}</span>
            </div>

            {/* Target Abbreviation */}
            <div className="my-6 text-center space-y-4">
              <span className="text-[10px] text-zinc-450 dark:text-zinc-555 uppercase tracking-wider block">ABBREVIATION</span>
              <span className="text-4xl font-extrabold text-zinc-800 dark:text-white block font-sans">
                {GAME_QUESTIONS[round].abbreviation}
              </span>

              {/* Feedback */}
              <div className="min-h-[20px]">
                {feedback === "correct" && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" /> Combo Boost!
                  </span>
                )}
                {feedback === "incorrect" && (
                  <span className="text-xs font-bold text-red-550 dark:text-red-500 uppercase tracking-wider font-semibold">
                    Busted! Correct: {GAME_QUESTIONS[round].correct}
                  </span>
                )}
              </div>
            </div>

            {/* Multiple choices */}
            <div className="w-full space-y-3">
              {GAME_QUESTIONS[round].options.map((opt) => {
                const isChosen = selectedOption === opt;
                return (
                  <button
                    disabled={feedback !== null}
                    onClick={() => handleOptionClick(opt)}
                    key={opt}
                    className={`w-full py-3 px-4 border text-left text-xs font-bold rounded-lg transition-all font-sans active:scale-98 cursor-pointer ${
                      feedback !== null
                        ? opt === GAME_QUESTIONS[round].correct
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-450"
                          : isChosen
                            ? "border-red-500 bg-red-50 text-red-650 dark:border-red-500 dark:bg-red-500/10 dark:text-red-505"
                            : "border-zinc-200 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 text-zinc-400 dark:text-zinc-650"
                        : "border-blue-500/30 bg-white hover:border-blue-500 hover:bg-blue-50/20 dark:border-amber-500/40 dark:bg-zinc-900/40 dark:hover:border-amber-500 dark:hover:bg-amber-500/5 text-blue-650 dark:text-amber-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Scorecard */}
            <div className="w-full mt-6 pt-3 border-t border-dashed border-zinc-250 dark:border-zinc-800/80 text-[10px] font-bold text-zinc-450 dark:text-zinc-555 text-left">
              SCORE: {score} PTS
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: LEXICAL LIST CONSOLE ──────────────────────────────────
  const codeSnippet = `// Lexical Analyze API Call
const res = await fetch('/api/lexical-analyze', {
  method: 'POST',
  body: JSON.stringify({ text: rawText })
});
const { result } = await res.json();
console.log(result); // Expanded abbreviation string`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Lexical Analyzer & Abbreviation Expander
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Replaces inflected contractions and shorthand abbreviation blocks with their fully expanded grammatical tokens.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
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
                  onClick={() => runLexicalAnalyze(text)}
                  disabled={loading}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  Expand Shorthand
                </button>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Original */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-405 uppercase tracking-wider font-mono">
                  Source Text
                </h3>
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-sm font-sans font-medium leading-relaxed text-zinc-800 dark:text-zinc-300">
                  {text}
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-405 uppercase tracking-wider font-mono">
                  Expanded Result
                </h3>
                <div className="p-4 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-900/30 text-sm font-sans font-medium leading-relaxed text-blue-650 dark:text-sky-400">
                  {resultText || "-"}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
