"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import { BookOpen, RefreshCw, Star, HelpCircle } from "lucide-react";

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  proverb: string;
  gloss: string;
  glyphs: string[];
}

const LANGUAGES_DATA: LanguageInfo[] = [
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    script: "Ge'ez (ፊደል)",
    proverb: "ካላወቁበት ድመት ዝሆን ትሆናለች።",
    gloss: "If you don't know how to handle it, a cat can become an elephant.",
    glyphs: ["ሀ", "ለ", "ሐ", "መ", "ረ", "ሰ", "ሸ", "ቀ", "በ", "ተ", "ቸ", "ነ"],
  },
  {
    code: "ti",
    name: "Tigrinya",
    nativeName: "ትግርኛ",
    script: "Ge'ez (ፊደል)",
    proverb: "እንተ ዘይፈልጡሉስ ድሙ ኣንጭዋ ትኸውን።",
    gloss: "If you don't know how to handle it, a cat becomes a mouse.",
    glyphs: ["ሠ", "ረ", "ሰ", "ሸ", "ቀ", "በ", "ተ", "ቸ", "ነ", "ኘ", "አ", "ከ"],
  },
  {
    code: "om",
    name: "Oromo",
    nativeName: "Afaan Oromoo",
    script: "Latin (Qubee)",
    proverb: "Beekumsa caalaa hubannootu caala.",
    gloss: "Insight is better than knowledge.",
    glyphs: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  },
];

export default function LanguagesPage() {
  const { mode } = useLabMode();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // 10/10 Proverb Wheel States
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [activeGlyph, setActiveGlyph] = useState("❓");
  const [revealedProverb, setRevealedProverb] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Proverb Wheel spin execution
  const handleSpin = () => {
    if (isSpinning || isTyping) return;
    setIsSpinning(true);
    setSelectedLang(null);
    setRevealedProverb("");

    let elapsed = 0;
    const spinDuration = 1800; // spin for 1.8s
    let spinSpeed = 80;

    // Fast rotation degrees updates
    const rotateInterval = setInterval(() => {
      setRotationDegrees((r) => r + 25);
    }, 40);

    const spinTick = () => {
      const allGlyphs = LANGUAGES_DATA.flatMap((l) => l.glyphs);
      const randomGlyph = allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
      setActiveGlyph(randomGlyph);

      elapsed += spinSpeed;
      if (elapsed >= spinDuration) {
        // Stop spinning and select a random pack
        clearInterval(rotateInterval);
        const selected = LANGUAGES_DATA[Math.floor(Math.random() * LANGUAGES_DATA.length)];
        setSelectedLang(selected.code);
        setActiveGlyph(selected.glyphs[0]);
        setIsSpinning(false);
        triggerTypewriter(selected);
      } else {
        // Slow down spinning
        spinSpeed += 15;
        spinIntervalRef.current = setTimeout(spinTick, spinSpeed);
      }
    };

    spinTick();
  };

  const triggerTypewriter = (lang: LanguageInfo) => {
    setIsTyping(true);
    let idx = 0;
    const target = lang.proverb;
    
    const typeInterval = setInterval(() => {
      setRevealedProverb((prev) => prev + target[idx]);
      idx++;
      if (idx >= target.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 60);
  };

  const handleChooseDirect = (code: string) => {
    if (isSpinning || isTyping) return;
    const selected = LANGUAGES_DATA.find((l) => l.code === code)!;
    setSelectedLang(code);
    setActiveGlyph(selected.glyphs[0]);
    setRevealedProverb("");
    triggerTypewriter(selected);
  };

  if (mode === "fun") {
    const selectedData = LANGUAGES_DATA.find((l) => l.code === selectedLang);

    // ── 10/10 FUN MODE: THE PROVERB WHEEL ──────────────────────────────────
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
            .cartoon-btn {
              border: 3.5px solid #000;
              box-shadow: 5px 5px 0px 0px #000;
              transition: all 0.1s ease-out;
            }
            .dark .cartoon-btn {
              border: 3.5px solid #f59e0b;
              box-shadow: 5px 5px 0px 0px #f59e0b;
            }
            .cartoon-btn:hover {
              transform: translate(1px, 1px);
              box-shadow: 4px 4px 0px 0px #000;
            }
            .dark .cartoon-btn:hover {
              box-shadow: 4px 4px 0px 0px #f59e0b;
            }
            .cartoon-btn:active {
              transform: translate(3px, 3px);
              box-shadow: 2px 2px 0px 0px #000;
            }
            .dark .cartoon-btn:active {
              box-shadow: 2px 2px 0px 0px #f59e0b;
            }
            .wobbly-circle {
              border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
              animation: wobble-shape 4s ease-in-out infinite alternate;
            }
            @keyframes wobble-shape {
              0% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
              100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
            }
            .cartoon-speech-bubble::after {
              content: '';
              position: absolute;
              bottom: -20px;
              left: 50px;
              border-width: 20px 20px 0;
              border-style: solid;
              border-color: #fef08a transparent;
              display: block;
              width: 0;
            }
            .cartoon-speech-bubble-border::after {
              content: '';
              position: absolute;
              bottom: -23px;
              left: 48px;
              border-width: 22px 22px 0;
              border-style: solid;
              border-color: #000 transparent;
              display: block;
              width: 0;
              z-index: 10;
            }
          `
        }} />

        {/* Header HUD */}
        <div className="text-center space-y-2 mb-10 w-full max-w-4xl border-b-4 border-black dark:border-amber-500 pb-6 relative">
          <div className="flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
            <span>🎡 LEVEL 1: CHOOSE YOUR LANGUAGE 🎡</span>
          </div>
          <h2 className="text-5xl font-black tracking-wider text-black dark:text-amber-500">
            THE PROVERB WHEEL
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-black uppercase tracking-widest">
            Spin the wobbly wheel to cycle languages, or click direct packs to unlock!
          </p>
        </div>

        {/* Main interactive panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-5xl items-center">
          
          {/* Left Side: The Spinning Wheel */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer Ring with wobbly animation */}
              <div
                style={{ transform: `rotate(${rotationDegrees}deg)` }}
                className={`wobbly-circle absolute inset-0 border-[4px] border-black bg-yellow-100 dark:bg-zinc-900 dark:border-amber-500 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#f59e0b] flex items-center justify-center transition-transform duration-100`}
              >
                {/* Visual sectors */}
                <div className="absolute w-[2px] h-full bg-black/10 dark:bg-amber-500/10" />
                <div className="absolute h-[2px] w-full bg-black/10 dark:bg-amber-500/10" />
                
                {/* Secondary icons around ring */}
                <span className="absolute top-4 text-xs font-black select-none">አማ</span>
                <span className="absolute bottom-4 text-xs font-black select-none">ትግ</span>
                <span className="absolute left-4 text-xs font-black select-none">Oro</span>
                <span className="absolute right-4 text-xs font-black select-none">Ge'ez</span>
              </div>

              {/* Central spinning hub with active glyph */}
              <div className="relative w-24 h-24 rounded-full border-[3px] border-black bg-white dark:bg-black dark:border-amber-500 flex items-center justify-center shadow-inner z-10">
                <span className={`text-4xl font-black text-black dark:text-amber-400 transition-all select-none ${
                  isSpinning ? "scale-125" : "scale-100"
                }`}>
                  {activeGlyph}
                </span>
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || isTyping}
              className="cartoon-btn px-8 py-4 bg-amber-400 text-black text-sm font-black uppercase tracking-widest rounded-xl disabled:opacity-40"
            >
              {isSpinning ? "SPINNING..." : "SPIN THE WHEEL 🎡"}
            </button>
          </div>

          {/* Right Side: Proverb Speech Bubble & Selectors */}
          <div className="space-y-8">
            {/* Quick direct select buttons */}
            <div className="cartoon-border p-5 rounded-2xl bg-white dark:bg-[#1a1c1d] dark:border-amber-500 space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-500 block">DIRECT SELECT CLASS</span>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES_DATA.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleChooseDirect(l.code)}
                    disabled={isSpinning || isTyping}
                    className={`p-3 border-2 border-black rounded-xl text-center text-xs font-black tracking-wide cursor-pointer transition-all dark:border-amber-500 ${
                      selectedLang === l.code
                        ? "bg-amber-400 text-black"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white"
                    }`}
                  >
                    <p>{l.name}</p>
                    <p className="text-[9px] font-bold opacity-70 mt-0.5">{l.nativeName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Speech bubble proverb display */}
            {selectedLang && (
              <div className="relative animate-in zoom-in-75 duration-300">
                {/* Speech Bubble Border */}
                <div className="cartoon-speech-bubble-border absolute inset-0 rounded-2xl bg-black" />
                
                {/* Actual Speech Bubble */}
                <div className="cartoon-speech-bubble border-[3.5px] border-black bg-yellow-100 dark:bg-[#201d18] dark:border-amber-500 rounded-2xl p-8 space-y-4 text-black dark:text-amber-100 z-20 relative">
                  <div className="flex justify-between items-center border-b-2 border-dashed border-black/10 dark:border-amber-500/10 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400">
                      NATIVE PROVERB REVEALED
                    </span>
                    <span className="px-2 py-0.5 border border-black bg-white rounded text-[8px] font-black dark:bg-zinc-900">
                      {selectedData?.script}
                    </span>
                  </div>

                  {/* Typewritten Proverb */}
                  <div className="min-h-[50px] flex items-center justify-center py-2">
                    <span className="text-2xl md:text-3xl font-black text-center text-zinc-900 dark:text-white leading-relaxed font-sans block select-all">
                      {revealedProverb}
                      {isTyping && (
                        <span className="inline-block w-2.5 h-6 ml-1 bg-amber-500 animate-pulse" />
                      )}
                    </span>
                  </div>

                  {/* Translation Gloss */}
                  {!isTyping && (
                    <div className="text-center pt-3 border-t border-dashed border-black/10 dark:border-amber-500/10 animate-in fade-in duration-300">
                      <span className="text-[9px] font-black text-zinc-500 block uppercase">GLOSS / MEANING</span>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-amber-250 italic mt-1 leading-relaxed">
                        "{selectedData?.gloss}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hint stamp */}
            {!selectedLang && !isSpinning && (
              <div className="cartoon-border p-6 rounded-2xl bg-cyan-100 dark:bg-cyan-950/20 dark:border-amber-500 flex items-center gap-4 animate-bounce">
                <span className="text-3xl select-none">🎡</span>
                <div>
                  <h4 className="text-xs font-black uppercase text-black dark:text-amber-400">HOW TO PLAY</h4>
                  <p className="text-[10px] font-semibold text-zinc-650 dark:text-zinc-400 mt-0.5 uppercase">
                    Spin the central proverb wheel to land on a language pack and reveal its ancient proverb!
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
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
            Supported Languages & Reference Console
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
