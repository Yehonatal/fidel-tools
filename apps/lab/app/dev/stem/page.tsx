"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { Compass, Gamepad, Play, CheckCircle2, XCircle, RefreshCw, Heart, AlertTriangle } from "lucide-react";

interface StemCluster {
  id: number;
  root: string;
  meaning: string;
  inflections: string[];
}

const CLUSTERS_DATA: StemCluster[] = [
  {
    id: 1,
    root: "ልጅ",
    meaning: "child",
    inflections: ["ልጆች", "ልጆቻችን", "ልጅነቴ", "ልጅቷ"],
  },
  {
    id: 2,
    root: "ቤት",
    meaning: "house",
    inflections: ["ቤቶች", "ቤቶቻችን", "ቤታቸው", "ቤትዎ"],
  },
  {
    id: 3,
    root: "ትምህርት",
    meaning: "education",
    inflections: ["ትምህርቶች", "በትምህርት", "ትምህርታችን", "ትምህርቷ"],
  },
  {
    id: 4,
    root: "ነገር",
    meaning: "thing/matter",
    inflections: ["ነገሮች", "በነገራችን", "ነገሩ", "ነገራቸው"],
  },
];

export default function StemPage() {
  const { mode } = useLabMode();
  const [inputText, setInputText] = useState("ልጆች ቤቶቻቸውን ትምህርታቸውን እና ነገሮችን ይወዳሉ።");
  const [stemmedList, setStemmedList] = useState<Array<{ word: string; stem: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Root Cluster Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordY, setWordY] = useState(0); // 0 to 100
  const [typedStem, setTypedStem] = useState("");
  const [answerState, setAnswerState] = useState<"correct" | "incorrect" | null>(null);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentCluster = CLUSTERS_DATA[currentIdx];

  const runStem = async (textToStem: string) => {
    if (!textToStem.trim()) return;
    setLoading(true);
    try {
      const wordsArray = textToStem.split(/\s+/).filter(Boolean);
      const response = await fetch("/api/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: wordsArray }),
      });
      const data = await response.json();
      if (!data.error && data.stems) {
        const mapped = wordsArray.map((w, idx) => ({
          word: w,
          stem: data.stems[idx] || w,
        }));
        setStemmedList(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runStem(inputText);
    }
  }, [mode]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setLives(3);
    setWordY(0);
    setTypedStem("");
    setAnswerState(null);
    startClusterRound(0);
  };

  const startClusterRound = (idx: number) => {
    setWordY(0);
    setTypedStem("");
    setAnswerState(null);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);

    gameTimerRef.current = setInterval(() => {
      setWordY((prev) => {
        if (prev >= 85) {
          clearInterval(gameTimerRef.current!);
          handleMiss();
          return 85;
        }
        return prev + 2.5; // Slide down gradually
      });
    }, 120);
  };

  const handleMiss = () => {
    setAnswerState("incorrect");
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setIsPlaying(false);
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      } else {
        triggerNextCluster();
      }
      return nextLives;
    });
  };

  const handleZapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answerState !== null || !isPlaying) return;

    setLoading(true);
    try {
      // API call to verify the typed stem actually matches the expected base stem
      const response = await fetch("/api/stem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: [typedStem] }),
      });
      const data = await response.json();
      const verifiedStem = data.stems?.[0] || typedStem;
      const isCorrect = verifiedStem.trim() === currentCluster.root.trim();

      if (isCorrect) {
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        setAnswerState("correct");
        // Clear bonus scales with size of cluster: size 4 clears give 120 pts
        const bonus = currentCluster.inflections.length * 30;
        setScore((prev) => prev + bonus);
        triggerNextCluster();
      } else {
        setTypedStem("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerNextCluster = () => {
    setTimeout(() => {
      if (lives > 0) {
        const nextIdx = (currentIdx + 1) % CLUSTERS_DATA.length;
        setCurrentIdx(nextIdx);
        startClusterRound(nextIdx);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  if (mode === "fun") {
    // ── FUN MODE: CARTOON ROOT CLUSTER ─────────────────────────────────────
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
            .cloud-bubble {
              border: 3px solid #000;
              box-shadow: 5px 5px 0px 0px #000;
              border-radius: 40px;
            }
            .dark .cloud-bubble {
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
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                    ROOT CLUSTER
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                    Level 6
                  </span>
                </div>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                  Identify the single shared base root of the falling inflected word cloud and zap it!
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
                <div className="text-5xl">☁️</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-black dark:text-amber-400 uppercase tracking-wider">
                    Enter Root Arena?
                  </h3>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                    Clouds containing multiple inflected words sharing a stem (e.g. ቤቶች, ቤቶቻችን) will fall. Type the base root (e.g. ቤት) to pop the whole cluster!
                  </p>
                </div>
                {score > 0 && (
                  <div className="text-sm font-black text-black border-2 border-black bg-amber-100 py-2 rounded dark:bg-amber-950/20 dark:border-amber-500">
                    SCORE: {score} PTS
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
              <div className="cartoon-border rounded-2xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 max-w-md w-full flex flex-col justify-between min-h-[460px] relative overflow-hidden">
                {/* HUD */}
                <div className="w-full flex items-center justify-between border-b-2 border-dashed border-black dark:border-amber-500 pb-3 text-xs font-black">
                  <span>SCORE: {score} PTS</span>
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-4.5 h-4.5 ${i < lives ? "text-red-500 fill-red-500" : "text-zinc-200 dark:text-zinc-800"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Falling track container */}
                <div className="relative flex-grow w-full border-[3px] border-black bg-amber-50/30 dark:bg-black/40 rounded-xl my-4 overflow-hidden min-h-[260px] dark:border-amber-500">
                  {/* Falling Word Cloud */}
                  <div
                    className="absolute left-0 right-0 flex flex-wrap gap-2 justify-center transition-all duration-150 ease-linear"
                    style={{ top: `${wordY}%`, transform: "translateY(-50%)" }}
                  >
                    {answerState === "correct" ? (
                      <span className="inline-block py-2 px-4 border-[3px] border-black bg-green-400 text-black text-xl font-black rotate-12 rounded shadow-[3px_3px_0px_0px_#000] uppercase">
                        POOF! ZAPPED
                      </span>
                    ) : answerState === "incorrect" ? (
                      <span className="inline-block py-2 px-4 border-[3px] border-black bg-red-400 text-white text-xl font-black -rotate-12 rounded shadow-[3px_3px_0px_0px_#000] uppercase">
                        CRASHED!
                      </span>
                    ) : (
                      <div className="cloud-bubble p-4 bg-cyan-155 dark:bg-cyan-900/60 dark:border-amber-500 text-black flex flex-wrap gap-2 justify-center max-w-[280px]">
                        {currentCluster.inflections.map((word, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 border-2 border-black bg-white text-black text-xs font-black font-sans dark:bg-zinc-900 dark:text-white dark:border-amber-500 shadow-[1px_1px_0px_0px_#000]"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floor boundary warning */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-dashed bg-red-500/40" />
                </div>

                {/* Typing form input */}
                <form onSubmit={handleZapSubmit} className="w-full space-y-4">
                  <input
                    type="text"
                    autoFocus
                    disabled={answerState !== null}
                    value={typedStem}
                    onChange={(e) => setTypedStem(e.target.value)}
                    placeholder="Type root stem (e.g. ልጅ) & Enter..."
                    className="w-full bg-white border-[3px] border-black focus:bg-amber-55 dark:bg-black dark:border-amber-500 dark:focus:border-amber-500 outline-none text-center py-3 text-sm rounded-xl text-black dark:text-amber-100 font-sans font-black shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-[1px_1px_0px_0px_#000] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={answerState !== null || loading}
                    className="w-full py-3 bg-amber-400 border-[3px] border-black text-black font-black text-xs uppercase rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                  >
                    {loading ? "VERIFYING..." : "ZAP CLUSTER!"}
                  </button>
                </form>
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
                  <p className="text-2xl font-black text-amber-550 leading-none">❤️ {lives}</p>
                  <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">LIVES LEFT</p>
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
                  Morphological Suffix & Prefix Stripping
                </h4>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                Ethiopic morphology is highly inflective, appending gender, number, and prepositions to nouns/verbs. Stemming strips these affixes, grouping variations (ቤቶች, ቤታችን) around a shared root (ቤት).
              </p>
              <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h5>
                <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                  <li>Watch inflected words descend inside wobbly cloud bubbles.</li>
                  <li>Spot the common underlying root shared by all words in the cluster.</li>
                  <li>Type the base root in Ge'ez characters, then press enter or click "ZAP" to pop the clouds!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
