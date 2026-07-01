"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import { Layers, Play, AlertTriangle, RefreshCw, GripVertical, CheckCircle2, XCircle, ArrowRight, RotateCcw, ArrowDown } from "lucide-react";

interface Round {
  id: number;
  title: string;
  inputText: string;
  targetText: string;
  desc: string;
  minSteps: number;
}

const CONVEYOR_ROUNDS: Round[] = [
  {
    id: 1,
    title: "Round 1: Spell Normalization",
    inputText: "ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ሄደ።",
    targetText: "ሃኪሙ ሃይሉ ትላንትና ሰላምታ ሰጥቶን ሄደ።",
    desc: "Convert all homophone variations to their canonical baseline forms.",
    minSteps: 1,
  },
  {
    id: 2,
    title: "Round 2: Cleansing Abbreviations",
    inputText: "ሐኪም ኀይሉ በልቶ ወደ ት/ቤት ሄደ።",
    targetText: "ሃኪም ሃይሉ በልቶ ወደ ትምህርት ቤት ሄደ",
    desc: "Normalize spelling variants and expand abbreviations, removing punctuation.",
    minSteps: 2,
  },
  {
    id: 3,
    title: "Round 3: Stopword Extract",
    inputText: "ት/ቤት እና መስሪያ ቤት",
    targetText: "ትምህርት ቤት መስሪያ ቤት",
    desc: "Expand the elided contraction and extract signal words by removing grammar stopwords.",
    minSteps: 3,
  },
  {
    id: 4,
    title: "Round 4: English Cipher",
    inputText: "ሐኪሙ ት/ቤት ሄደ።",
    targetText: "hakim temhert bEt hEd",
    desc: "Normalize, expand contractions, remove stopwords, stem and transcribe into Latin SERA.",
    minSteps: 5,
  },
];

const STAGE_LABELS: Record<string, { title: string; desc: string; color: string }> = {
  normalize: { title: "Normalize Shape", desc: "Maps character homophones", color: "bg-cyan-100 dark:bg-cyan-900/60" },
  lexAnalyze: { title: "Expand Abbreviations", desc: "Replaces contractions", color: "bg-yellow-100 dark:bg-yellow-900/60" },
  removeStopwords: { title: "Sweep Stopwords", desc: "Filters grammar noise", color: "bg-red-100 dark:bg-red-950/60" },
  stem: { title: "Stem Morpheme", desc: "Strips prefixes & suffixes", color: "bg-purple-100 dark:bg-purple-900/60" },
  transliterate: { title: "SERA Transliterate", desc: "Transcribes Ge'ez to ASCII", color: "bg-emerald-100 dark:bg-emerald-950/60" },
};

const PRESETS = [
  {
    label: "Government Bill (Mixed)",
    text: "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
  },
  {
    label: "Linguistic Homophones",
    text: "ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ሄደ።",
  },
  {
    label: "Contractions & Abbreviations",
    text: "ሐኪም ኀይሉ በልቶ ወደ ት/ቤት ሄደ። መስሪያ ቤት እና ት/ቤት",
  },
];

export default function PipelinePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState(
    "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት"
  );
  const [stages, setStages] = useState<string[]>([
    "normalize",
    "lexAnalyze",
    "removeStopwords",
    "stem",
    "transliterate",
  ]);
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Arcade Game States
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [conveyorBelt, setConveyorBelt] = useState<string[]>([]);
  const [mutatedOutputs, setMutatedOutputs] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [gameWin, setGameWin] = useState(false);
  const [hasTested, setHasTested] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const currentRound = CONVEYOR_ROUNDS[currentRoundIdx];

  const handlePresetSelect = (presetText: string) => {
    setText(presetText);
  };

  const runPipeline = async (inputText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, steps: stages }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTrace(data.trace);
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact pipeline API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "academic") {
      runPipeline(text);
    }
  }, [mode, text]);

  // Live mutations update based on conveyor belt state
  const updateConveyorMutations = async (belt: string[]) => {
    if (belt.length === 0) {
      setMutatedOutputs({});
      setGameWin(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentRound.inputText,
          steps: belt,
        }),
      });
      const data = await response.json();
      setMutatedOutputs(data.trace || {});
      
      const finalResult = data.final || "";
      const isMatch = finalResult.trim() === currentRound.targetText.trim();
      
      if (isMatch) {
        const stepDiff = belt.length - currentRound.minSteps;
        const calcScore = Math.max(0, 100 - stepDiff * 15);
        setScore(calcScore);
        setGameWin(true);
      } else {
        setScore(0);
        setGameWin(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced conveyor update
  useEffect(() => {
    if (mode === "fun") {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        updateConveyorMutations(conveyorBelt);
      }, 300);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [conveyorBelt, currentRoundIdx, mode]);

  const handleStageClick = (stage: string) => {
    if (conveyorBelt.includes(stage)) {
      setConveyorBelt((prev) => prev.filter((s) => s !== stage));
    } else {
      setConveyorBelt((prev) => [...prev, stage]);
    }
    setHasTested(true);
  };

  const handleResetConveyor = () => {
    setConveyorBelt([]);
    setMutatedOutputs({});
    setScore(0);
    setGameWin(false);
    setHasTested(false);
  };

  const handleNextRound = () => {
    if (currentRoundIdx < CONVEYOR_ROUNDS.length - 1) {
      setCurrentRoundIdx((prev) => prev + 1);
      handleResetConveyor();
    }
  };

  const handleDragStart = (stage: string) => {
    setDraggedItem(stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnConveyor = () => {
    if (draggedItem && !conveyorBelt.includes(draggedItem)) {
      setConveyorBelt((prev) => [...prev, draggedItem]);
      setHasTested(true);
    }
    setDraggedItem(null);
  };

  if (mode === "fun") {
    // ── 10/10 FUN MODE: CONVEYOR FACTORY ───────────────────────────────────
    return (
      <div className="font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-[#fdfcfa] bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] text-zinc-900 dark:bg-[#121110] dark:bg-[radial-gradient(#292524_1.5px,transparent_1.5px)] dark:text-amber-100 animate-in fade-in duration-300">
        <style dangerouslySetInnerHTML={{
          __html: `
            .cartoon-border {
              border: 3.5px solid #000;
              box-shadow: 6px 6px 0px 0px #000;
            }
            .dark .cartoon-border {
              border: 3.5px solid #f59e0b;
              box-shadow: 6px 6px 0px 0px #f59e0b;
            }
            .roller-conveyor {
              background-image: radial-gradient(circle, #000 22%, transparent 22%);
              background-size: 16px 16px;
              height: 14px;
            }
            .dark .roller-conveyor {
              background-image: radial-gradient(circle, #f59e0b 22%, transparent 22%);
            }
            .steam-cloud {
              animation: steam-float 1.5s ease-out infinite;
            }
            @keyframes steam-float {
              0% { transform: translateY(0) scale(0.8); opacity: 0.8; }
              100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
            }
          `
        }} />

        {/* Header HUD */}
        <div className="text-center space-y-2 mb-10 w-full max-w-4xl border-b-4 border-black dark:border-amber-500 pb-6">
          <div className="flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
            <span>🏭 LEVEL 2: CONVEYOR MUTATIONS 🏭</span>
          </div>
          <h2 className="text-5xl font-black tracking-wider text-black dark:text-amber-500">
            CONVEYOR FACTORY
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-black uppercase tracking-widest">
            Drag stage compilation blocks to align the conveyor text mutations!
          </p>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
          
          {/* Column 1: Rounds and Crate list */}
          <div className="lg:col-span-1 space-y-6">
            {/* Round target detail */}
            <div className="cartoon-border rounded-2xl p-6 bg-cyan-50 dark:bg-[#1c1a19] dark:border-amber-500 space-y-4">
              <span className="inline-block py-1 px-2 border-2 border-black bg-amber-400 text-black text-[9px] font-black tracking-widest uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                {currentRound.title}
              </span>
              
              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-500 block uppercase">INPUT SOURCE</span>
                <p className="p-3 bg-white dark:bg-black border-2 border-black text-xs font-bold rounded">
                  {currentRound.inputText}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-500 block uppercase">TARGET OUTPUT</span>
                <p className="p-3 bg-white dark:bg-black border-2 border-black text-xs font-black text-green-600 dark:text-amber-400 rounded">
                  {currentRound.targetText}
                </p>
              </div>
            </div>

            {/* Stage crates */}
            <div className="cartoon-border rounded-2xl p-6 bg-white dark:bg-[#1a1c1d] dark:border-amber-500 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-amber-400">
                DRAG STAGES (OR CLICK)
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(STAGE_LABELS).map(([key, item]) => {
                  const onBelt = conveyorBelt.includes(key);
                  return (
                    <div
                      key={key}
                      draggable={!onBelt}
                      onDragStart={() => handleDragStart(key)}
                      onClick={() => handleStageClick(key)}
                      className={`cartoon-border p-3 rounded-xl flex items-center justify-between transition-all select-none ${
                        onBelt
                          ? "opacity-30 bg-zinc-150 border-zinc-400 cursor-not-allowed text-zinc-400"
                          : `${item.color} border-black dark:border-amber-500 cursor-grab hover:translate-x-[1px] hover:translate-y-[1px]`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-zinc-500" />
                        <div>
                          <p className="text-xs font-black uppercase text-black dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black border-2 border-black px-1.5 py-0.5 rounded-lg bg-white text-black shadow-[1px_1px_0px_0px_#000]">
                        {onBelt ? "BELT" : "ADD"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Conveyor Line and Mutations */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            {/* The Conveyor Belt Rig */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnConveyor}
              className="cartoon-border rounded-2xl p-8 bg-[#f3f4f6] dark:bg-[#1c1a19] dark:border-amber-500 space-y-6 relative overflow-hidden flex-grow"
            >
              {/* Gears and smoke decorations */}
              <div className="absolute top-2 right-4 flex gap-2 select-none z-10">
                <span className="animate-spin duration-3000 text-xs">⚙️</span>
                <span className="animate-spin duration-5000 text-xs">⚙️</span>
              </div>
              <div className="absolute -top-3.5 left-6 px-3 py-0.5 border-2 border-black bg-amber-400 text-black text-[9px] font-black tracking-widest uppercase rounded shadow-[2px_2px_0px_0px_#000]">
                CONVEYOR ASSEMBLY LINE
              </div>

              {/* Belt Slots */}
              <div className="flex flex-col gap-6 pt-4">
                {conveyorBelt.length === 0 ? (
                  <div className="border-[3px] border-dashed border-zinc-400 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-650 font-black text-xs gap-3">
                    <span className="text-3xl select-none">🏭</span>
                    <span>CONVEYOR BELT IS READY FOR CARGO</span>
                    <span className="text-[9px] font-bold text-center uppercase max-w-sm">
                      Drag crates onto the conveyor belt or click them to sequence pipeline transformations!
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conveyorBelt.map((stage, i) => {
                      const label = STAGE_LABELS[stage];
                      const intermediateOut = mutatedOutputs[stage] || "...";

                      return (
                        <div key={stage} className="relative animate-in slide-in-from-left-4 duration-300">
                          {/* Crates card */}
                          <div className={`cartoon-border p-4 rounded-xl ${label.color} border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4 relative`}>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="w-7 h-7 rounded-full border-2 border-black bg-white text-black font-black flex items-center justify-center text-xs shadow-[1px_1px_0px_0px_#000]">
                                #{i + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase text-black dark:text-white">
                                  {label.title}
                                </h4>
                                <p className="text-[8px] font-bold text-zinc-550 uppercase">
                                  {label.desc}
                                </p>
                              </div>
                            </div>

                            {/* Mutated state */}
                            <div className="flex-grow">
                              <span className="text-[8px] font-black uppercase text-zinc-500 block mb-0.5">INTERMEDIATE STATE</span>
                              <p className="p-2 bg-white dark:bg-black border-2 border-black text-[11px] font-bold rounded truncate select-all dark:border-amber-500">
                                {intermediateOut}
                              </p>
                            </div>
                          </div>

                          {/* Connecting arrow */}
                          {i < conveyorBelt.length - 1 && (
                            <div className="flex justify-center my-1 select-none">
                              <ArrowDown className="w-5 h-5 text-black dark:text-amber-500 animate-bounce" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Physical roller wheels */}
              <div className="pt-4">
                <div className="roller-conveyor rounded-full border-2 border-black dark:border-amber-500 bg-white dark:bg-black" />
              </div>

              {/* Reset button */}
              <div className="flex gap-4 justify-end pt-3">
                <button
                  onClick={handleResetConveyor}
                  className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-150 text-black text-xs font-black rounded-lg active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer dark:bg-zinc-900 dark:text-white dark:border-amber-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Steam success puff */}
              {gameWin && !loading && (
                <div className="absolute bottom-8 left-8 flex flex-col items-center select-none z-20 pointer-events-none">
                  <span className="steam-cloud text-3xl">💨</span>
                  <span className="steam-cloud text-2xl" style={{ animationDelay: "0.2s" }}>💨</span>
                </div>
              )}
            </div>

            {/* Score HUD / Victory banner */}
            {hasTested && (
              <div className="cartoon-border rounded-xl p-5 bg-white dark:bg-[#1a1c1d] dark:border-amber-500 flex items-center justify-between shadow-inner">
                <div className="space-y-1">
                  <span className="text-zinc-550 text-[9px] font-black uppercase tracking-wider block">CONVEYOR EFFICIENCY</span>
                  {loading ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>COMPILING CONVEYOR...</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-black dark:text-amber-500 tracking-wider">
                      {score} / 100 PTS
                    </span>
                  )}
                </div>

                {gameWin && !loading ? (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2 border-[3.5px] border-black bg-green-200 dark:border-amber-500 dark:bg-amber-500/10 p-2.5 rounded-xl text-green-700 dark:text-amber-400 text-xs font-black tracking-wider uppercase animate-bounce shadow-[3px_3px_0px_0px_#000]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMPILE PERFECT!</span>
                    </div>
                    {currentRoundIdx < CONVEYOR_ROUNDS.length - 1 && (
                      <button
                        onClick={handleNextRound}
                        className="px-4 py-2 bg-amber-400 text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-[10px] font-black uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_#000] flex items-center gap-1 cursor-pointer dark:border-amber-550"
                      >
                        <span>NEXT ROUND</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  !loading && (
                    <div className="flex items-center gap-2 border-2 border-black bg-red-100 p-2.5 rounded-lg text-red-750 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_#000]">
                      <XCircle className="w-4 h-4" />
                      <span>MUTATION MISMATCH</span>
                    </div>
                  )
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ── ACADEMIC MODE: CONSOLE RUNNER ──────────────────────────────────────
  const codeSnippet = `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const text = "${text.replace(/"/g, '\\"').slice(0, 50)}...";
const result = nlp.run(text, {
  stages: ["normalize", "tokenize", "stopwords", "stem"]
});`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Multi-Stage Execution Pipeline
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Trace custom sequences of normalization, contractions expansion, stopwords removal, stemming, and transliteration in a single request.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        {/* Preset Selector */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">
            Select Sample Presets
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(p.text)}
                className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-medium hover:border-blue-500 hover:bg-blue-500/5 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs & Snippets */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                API Endpoint Specifications
              </h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400">POST</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">/api/v1/nlp/pipeline</span>
                </div>
                <p className="text-zinc-500 leading-relaxed font-medium">
                  Sequences steps internally inside Hono. Returns sequential trace map alongside the final compiled output.
                </p>
              </div>
            </div>

            <CodeSnippet title="Node.js Pipeline Integration" code={codeSnippet} />
          </div>

          {/* Core Interactive Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0 font-mono text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">
                <span>Interactive Pipeline Tracer</span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold font-mono text-zinc-405 uppercase tracking-wider">Input Corpus</label>
                  <textarea
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:border-blue-500 text-zinc-850 dark:text-white"
                    placeholder="Enter Amharic text to route..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => runPipeline(text)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Pipeline</span>
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <PipelineVisualizer inputText={text} trace={trace} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
