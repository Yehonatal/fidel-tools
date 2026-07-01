"use client";

import React, { useState, useEffect } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BookOpen, Shield, Award, RefreshCw, Sparkles } from "lucide-react";

export default function LanguagesPage() {
  const { mode } = useLabMode();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [chosenChar, setChosenChar] = useState<string | null>(null);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/languages");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const characters = [
    {
      id: "am",
      name: "Amharic Warrior",
      description: "Guardian of the Semitic highlands. Master of homophone collapsing and prefix zapping.",
      specialAbility: "Homophone Collapse Shield",
      stats: { power: 90, defense: 75, agility: 60, vocabulary: 85 },
      element: "Fire",
      avatar: "🛡️",
    },
    {
      id: "ti",
      name: "Tigrinya Ranger",
      description: "Swift scout of the northern ridges. Specializes in advanced suffix parsing and stem pruning.",
      specialAbility: "Suffix Pruning Blade",
      stats: { power: 75, defense: 60, agility: 95, vocabulary: 80 },
      element: "Air",
      avatar: "🏹",
    },
    {
      id: "om",
      name: "Oromo Mystic",
      description: "Ancient sage of the fertile plains. Harmonizes phonetic structures and filters stopwords effortlessly.",
      specialAbility: "Stopword Cleansing Wave",
      stats: { power: 65, defense: 85, agility: 70, vocabulary: 95 },
      element: "Earth",
      avatar: "✨",
    },
  ];

  if (mode === "fun") {
    // ── FUN MODE: CHARACTER SELECT ─────────────────────────────────────────
    return (
      <div className="animate-in fade-in duration-300 font-mono min-h-screen p-6 md:p-12 flex flex-col items-center bg-zinc-50 text-zinc-800 dark:bg-[#0c0a09] dark:text-amber-500">
        {/* Title */}
        <div className="text-center space-y-2 mb-10 w-full max-w-4xl border-b-2 border-dashed border-zinc-250 dark:border-amber-550/30 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-600 dark:text-orange-500">
            <Award className="w-4 h-4 animate-bounce" />
            <span>SELECT HERO CLASS</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-widest text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-amber-400 dark:to-orange-500 bg-clip-text">
            CHOOSE YOUR LINGUIST
          </h2>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {characters.map((char) => {
            const isSelected = chosenChar === char.id;
            return (
              <div
                key={char.id}
                onClick={() => setChosenChar(char.id)}
                className={`relative rounded-xl border-2 p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:border-amber-500 dark:bg-amber-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "border-zinc-200 bg-white hover:border-blue-500/30 hover:bg-blue-50/20 dark:border-zinc-800 dark:bg-[#120f0d] dark:hover:border-amber-500/50 dark:hover:bg-amber-500/5"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-md bg-blue-500 dark:bg-amber-500 text-white dark:text-black text-[9px] font-bold tracking-wider uppercase animate-bounce">
                    CHOSEN
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Avatar bubble */}
                  <div className="text-4xl w-14 h-14 rounded-lg border border-zinc-200 dark:border-amber-500/30 bg-zinc-50 dark:bg-black flex items-center justify-center select-none shadow-inner">
                    {char.avatar}
                  </div>
                  
                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-blue-600 dark:text-amber-400">
                      {char.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-orange-500 font-bold uppercase tracking-widest">
                      CLASS: {char.element}
                    </p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 font-semibold leading-relaxed">
                    {char.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-3 mt-6 pt-4 border-t border-dashed border-zinc-250 dark:border-zinc-800/80">
                  <div className="text-[10px] text-blue-500 dark:text-amber-500/80 font-bold uppercase tracking-wider">
                    ABILITY: <span className="text-blue-600 dark:text-amber-300">{char.specialAbility}</span>
                  </div>
                  
                  {/* Stat bars */}
                  <div className="space-y-1.5">
                    {Object.entries(char.stats).map(([stat, val]) => (
                      <div key={stat} className="flex items-center justify-between text-[9px] uppercase font-bold">
                        <span className="text-zinc-400 dark:text-zinc-500">{stat}</span>
                        <div className="flex gap-0.5 items-center">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`w-1.5 h-2 ${i < val / 10 ? "bg-blue-500 dark:bg-amber-500" : "bg-zinc-200 dark:bg-zinc-800"}`} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected character details */}
        {chosenChar && (
          <div className="mt-10 p-6 rounded-xl border border-dashed border-blue-500/30 dark:border-amber-500/40 bg-blue-500/5 dark:bg-amber-500/5 max-w-md text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="text-sm font-bold text-blue-600 dark:text-amber-400 tracking-widest uppercase">
              READY FOR COMBAT!
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              You selected the <span className="font-bold text-blue-600 dark:text-amber-300">{characters.find(c => c.id === chosenChar)?.name}</span>. Click another sidebar route to unleash your linguistics special ability in the games!
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC MODE: DOCUMENTATION & SETTINGS ─────────────────────────────
  const codeSnippet = `// Get Supported Languages Endpoint
const res = await fetch('http://localhost:3001/api/v1/nlp/languages', {
  headers: {
    'x-api-key': 'your_api_key_here'
  }
});
const { supported, default: def } = await res.json();
console.log(supported); // Output: ["am"]`;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Title block */}
      <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            Supported Languages & Metadata Reference
          </h2>
        </div>
        <p className="text-xs font-medium text-zinc-550 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
          Retrieve operational linguistic registry models, default language parameters, and exception rules loaded on startup.
        </p>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Documentation / Snippets */}
          <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                API Endpoint Specifications
              </h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-green-500/10 text-green-600 dark:text-emerald-400">GET</span>
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">/api/v1/nlp/languages</span>
                </div>
                <p className="text-zinc-500 leading-relaxed font-medium">
                  Fetches active language configurations, rules count, and normalizer exception mappings. Authenticated via raw headers.
                </p>
              </div>
            </div>

            <CodeSnippet title="Node.js Integration Code" code={codeSnippet} />
          </div>

          {/* Interactive JSON Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card flex flex-col overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Live Response Visualizer
                </span>
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />}
              </div>
              <div className="p-6">
                {data ? (
                  <pre className="text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-blue-600 dark:text-sky-400 max-h-[480px]">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                ) : (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-900 rounded-md p-16 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs gap-3">
                    <span>No data fetched from API backend.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
