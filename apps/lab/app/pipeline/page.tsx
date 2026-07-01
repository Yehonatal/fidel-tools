"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import CodeSnippet from "@/components/CodeSnippet";
import { Layers, Play, AlertTriangle, RefreshCw, Gamepad, Award, GripVertical, CheckCircle2 } from "lucide-react";

const PRESETS = [
  { label: "Homophone Groups", text: "ሀ ሃ ሐ ኀ ኃ ሰ ሠ አ ዐ" },
  { label: "Abbreviations Expansion", text: "ት/ቤት አ.አ ዓ.ም" },
  { label: "Mixed Script & Numbers", text: "አዲስ አበባ 2015 ዓ.ም ።" },
  { label: "Punctuation Heavy", text: "ኢትዮጵያ፣ ኤርትራ፣ ሶማሊያ፡ ሁሉም አፍሪካ ናቸው።" },
  { label: "Suffix Gemination", text: "ሰማይ ሰማያያ ሰማያያያያ" },
  { label: "Word Self-Stemming", text: "ሰው ልጅ mouse-pad" },
];

export default function PipelinePage() {
  const { mode } = useLabMode();
  const [text, setText] = useState(
    "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [gameOrder, setGameOrder] = useState<string[]>([
    "removeStopwords",
    "transliterate",
    "normalize",
    "stem",
    "lexAnalyze",
  ]);
  const [gameResult, setGameResult] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameWin, setGameWin] = useState(false);

  const runPipeline = async (inputText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, stages }),
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
    runPipeline(text);
  }, []);

  const handlePresetSelect = (presetText: string) => {
    setText(presetText);
    runPipeline(presetText);
  };

  // Drag and drop mechanics
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const copy = [...gameOrder];
    const draggedItem = copy[draggedIndex];
    copy.splice(draggedIndex, 1);
    copy.splice(index, 0, draggedItem);
    setGameOrder(copy);
    setDraggedIndex(null);
  };

  // Check Game Solution
  const handlePlayGame = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: "ሐኪሙ ት/ቤት ሄደ።", 
          stages: gameOrder 
        }),
      });
      const data = await response.json();
      
      const correctOrder = ["normalize", "lexAnalyze", "removeStopwords", "stem", "transliterate"];
      const isCorrect = JSON.stringify(gameOrder) === JSON.stringify(correctOrder);
      
      setGameResult(data.final || "");
      if (isCorrect) {
        setScore(100);
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

  if (mode === "fun") {
    // ── FUN MODE: PIPELINE DRAG GAME ───────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-2xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-650 dark:text-orange-500">
            <Gamepad className="w-4 h-4" />
            <span>LEVEL 2: PIPELINE BUILDER</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            PIPELINE PLAYGROUND
          </h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">
            Reorder the compilation steps to compile the source text into its final stem-transliteration shape!
          </p>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Draggable Blocks */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-6 shadow-inner">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-amber-400 mb-4">
              Linguistic Stages (Drag to Reorder)
            </h3>
            
            <div className="space-y-3">
              {gameOrder.map((stage, i) => (
                <div
                  key={stage}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  className="flex items-center justify-between border-2 border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/60 p-4 rounded-lg hover:border-blue-500 hover:bg-blue-50/10 dark:hover:border-amber-500/50 dark:hover:bg-zinc-900/40 active:scale-[0.99] transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-amber-300">
                        {stage === "normalize" && "1. Normalize Shape"}
                        {stage === "lexAnalyze" && "2. Expand Abbreviations"}
                        {stage === "removeStopwords" && "3. Sweep Stopwords"}
                        {stage === "stem" && "4. Stem Morpheme"}
                        {stage === "transliterate" && "5. SERA Transliterate"}
                      </p>
                      <p className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold uppercase mt-0.5">
                        {stage === "normalize" && "Collapses spelling homophones"}
                        {stage === "lexAnalyze" && "Replaces contractions"}
                        {stage === "removeStopwords" && "Filters syntax connectors"}
                        {stage === "stem" && "Strips prefixes & suffixes"}
                        {stage === "transliterate" && "Bidirectional transcription"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 font-mono">
                    INDEX {i + 1}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlayGame}
              disabled={loading}
              className="w-full mt-6 py-3 border-2 border-blue-500 hover:bg-blue-50 dark:border-amber-500 dark:hover:bg-amber-500/10 active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-amber-500 bg-transparent cursor-pointer rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <span>Test Execution</span>
              )}
            </button>
          </div>

          {/* Result Console */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-6 shadow-inner space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-amber-400">
                Execution Sandbox
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-650 block text-[9px] uppercase tracking-wider">Input Text</span>
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold select-all">
                    ሐኪሙ ት/ቤት ሄደ።
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 dark:text-zinc-655 block text-[9px] uppercase tracking-wider">Target Output</span>
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-900 text-blue-600 dark:text-emerald-400 font-bold select-all">
                    hakim temhert bEt hEd
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 dark:text-zinc-655 block text-[9px] uppercase tracking-wider">Your Output</span>
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-900 text-blue-600 dark:text-amber-300 font-bold select-all min-h-[42px]">
                    {gameResult || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scorecard */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#120f0d] p-6 flex items-center justify-between shadow-inner">
              <div className="space-y-1">
                <span className="text-zinc-400 dark:text-zinc-550 text-[10px] font-bold uppercase tracking-wider block">SCORECARD</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-amber-400 tracking-wider">
                  {score} / 100 PTS
                </span>
              </div>

              {gameWin ? (
                <div className="flex items-center gap-2 border border-blue-500/20 bg-blue-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-2.5 rounded-lg text-blue-600 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PERFECT PIPELINE!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 p-2.5 rounded-lg text-zinc-405 dark:text-zinc-500 text-[10px] font-bold tracking-wider uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>INCORRECT ORDER</span>
                </div>
              )}
            </div>
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

// 1. Collapse homophones
const normalized = nlp.normalize(text);

// 2. Expand abbreviations
const lexed = nlp.lexAnalyze(normalized);

// 3. Remove stopwords
const cleaned = nlp.removeStopwords(lexed);

// 4. Light stem (per word)
const stems = cleaned.split(' ').map(w => nlp.stem(w));

// 5. SERA Transliterate
const sera = nlp.feligTransliterate(cleaned, 'am');`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Core Pipeline Stage Runner
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Trace how Amharic text parses through each layer of the NLP compilation system sequentially.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        {/* Presets */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
            Edge Case Regression Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset.text)}
                className="px-3.5 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-350 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Test Corpus Editor
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[200px] lg:h-[260px] bg-transparent border-0 outline-hidden focus:outline-hidden ring-0 focus:ring-0 text-sm font-sans font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed placeholder-zinc-400 resize-none overflow-y-auto"
                  placeholder="Paste or type Amharic text..."
                />
                <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3.5 mt-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold">
                    {text.length} characters
                  </span>
                  <button
                    onClick={() => runPipeline(text)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold font-sans transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{loading ? "Running..." : "Compile Text"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <CodeSnippet title="Pipeline Execution Code" code={codeSnippet} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-md flex gap-3 text-red-500 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="border border-dashed border-zinc-200 dark:border-zinc-900 rounded-md p-16 flex flex-col items-center justify-center text-zinc-450 font-mono text-xs gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing stage transitions...</span>
              </div>
            ) : (
              <PipelineVisualizer inputText={text} trace={trace} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
