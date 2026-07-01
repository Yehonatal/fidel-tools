"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLabMode } from "@/components/mode-context";
import { Terminal, Gamepad, ArrowRight, Cpu, HelpCircle, Layers, Award } from "lucide-react";

export default function LabLandingPage() {
  const router = useRouter();
  const { setMode } = useLabMode();

  const handleSelectMode = (selectedMode: "academic" | "fun") => {
    setMode(selectedMode);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Info */}
      <div className="text-center max-w-2xl space-y-4 mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 dark:border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-sky-450 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Fidel NLP Lab v0.2.0</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight flex flex-wrap items-center justify-center gap-x-3">
          <span className="font-loga font-light tracking-tight text-5xl sm:text-6xl text-zinc-950 dark:text-zinc-50">ፊደል</span>
          <span>Tools Interactive Lab</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto">
          Explore Ethiopic Natural Language Processing. Reframer engine toggles all nine endpoints from a professional developer console to an interactive game arcade.
        </p>
      </div>

      {/* Split Selection Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Card 1: Academic Mode */}
        <div 
          onClick={() => handleSelectMode("academic")}
          className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40 backdrop-blur-md p-8 flex flex-col justify-between cursor-pointer hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 active:scale-[0.99] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-300" />
          <div className="space-y-6">
            <div className="inline-flex p-3.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-all duration-300">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Developer Console
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                Academic API environment built for builders. Analyze live HTTP request/response shapes, schema bindings, headers, and code integrations.
              </p>
            </div>
            <ul className="space-y-2 text-left pt-2">
              {[
                "Live request/response JSON viewers",
                "Full-featured pipeline tracers",
                "Executable code snippets (JS / CLI)",
                "API reference documentation framework",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-500 font-mono">mode: academic</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white group-hover:translate-x-1.5 transition-transform">
              <span>Show me the API</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            </span>
          </div>
        </div>

        {/* Card 2: Daily Puzzles Mode */}
        <div 
          onClick={() => handleSelectMode("fun")}
          className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40 backdrop-blur-md p-8 flex flex-col justify-between cursor-pointer hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 active:scale-[0.99] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="space-y-6">
            <div className="inline-flex p-3.5 rounded-xl bg-amber-500/10 text-amber-550 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-all duration-300">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                Daily Puzzles
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                Solve elegant, Wordle-style etymological and logical daily challenges. Compare your judgment against live NLP indexes and trace morphological compilation runs.
              </p>
            </div>
            <ul className="space-y-2 text-left pt-2">
              {[
                "Relevance Arena (TF-IDF Connoisseur)",
                "Pipeline Trace (Logic Deduction)",
                "Wordle-style shareable daily results",
                "Daily streaks & etymological guides",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-550">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 font-mono">mode: puzzle</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white group-hover:translate-x-1.5 transition-transform">
              <span>Start Puzzles</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-12 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 flex items-center gap-4 animate-in fade-in duration-1000">
        <span>Click either card to set your workspace preference.</span>
        <span>•</span>
        <span>Toggle anytime from the top-right console button.</span>
      </div>
    </div>
  );
}
