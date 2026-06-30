"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import LandingPlayground from "@/components/landing-playground";
import { useSession } from "@/lib/auth-client";
import {
  Code,
  Globe,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  Command,
  ArrowRight,
  Menu,
  X,
  Github,
  BookOpen,
  Terminal,
  Activity,
  Layers2,
  Copy,
  ExternalLink
} from "lucide-react";

type CodeTab = "cli" | "python" | "prompt" | "mcp" | "skills";

export default function HomePage() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("cli");
  const [copiedText, setCopiedText] = useState(false);

  const codeSnippets: Record<CodeTab, string> = {
    cli: `npm install @fidel-tools/core @fidel-tools/lang-am\n\n# Initialize local pipeline\n# import { Pipeline } from '@fidel-tools/core';\n# import amPack from '@fidel-tools/lang-am';`,
    python: `pip install fidel-tools\n\n# Import native Python pipeline\n# from fidel_tools import Pipeline, get_amharic_pack\n# pipeline = Pipeline(get_amharic_pack())`,
    prompt: `User: Parse the morphology of "ልጆቻቸውን" in JSON.\n\nAssistant:\n{\n  "lexeme": "ልጆቻቸውን",\n  "stem": "ልጅ",\n  "morphemes": ["ልጅ", "ዎች", "ቸው", "ን"]\n}`,
    mcp: `{\n  "mcpServers": {\n    "fidel-tools": {\n      "command": "npx",\n      "args": ["-y", "@fidel-tools/mcp-server"]\n    }\n  }\n}`,
    skills: `import { amharicNlpSkill } from "@fidel-tools/skills";\n\nconst agent = new Agent({\n  skills: [amharicNlpSkill]\n});\n\nawait agent.run("Stem the Amharic text...");`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* ── Hero Split Layout ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left: Pitch Info */}
          <div className="lg:w-[50%] space-y-6" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900/50 text-[10px] font-bold font-mono tracking-wider text-slate-800 dark:text-zinc-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Introducing Fidel Tools Console v0.1.6
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] font-sans">
              The most comprehensive Ethiopic NLP toolkit
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl font-sans">
              Fully composable, local-first rule stemmers, lexical normalizers, tokenizers, and loss-free ASCII transliteration. Powered by a high-performance Rust core with WASM and native Python bindings, running up to 35% faster than pure JavaScript implementations.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-md text-xs font-bold text-white dark:text-black bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 transition-all duration-200 inline-flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
                >
                  Open Developer Console
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="px-5 py-2.5 rounded-md text-xs font-bold text-white dark:text-black bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 transition-all duration-200 inline-flex items-center gap-1.5 shadow-lg shadow-white/5 cursor-pointer"
                  >
                    Start Building Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/benchmarks"
                    className="px-5 py-2.5 rounded-md text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    View Performance benchmarks
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: Code Console Visualizer */}
          <div className="flex-1 w-full" data-aos="fade-left">
            <div className="border border-slate-200 dark:border-zinc-900 rounded-lg overflow-hidden bg-[#0a0a0e] shadow-2xl relative">
              {/* Window controls bar */}
              <div className="bg-[#121218] px-4 py-3 flex items-center justify-between border-b border-[#1b1b24] select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 font-bold">fidel-pipeline-config</div>
                <button
                  onClick={() => copyToClipboard(codeSnippets[activeCodeTab])}
                  className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Copy snippet"
                >
                  {copiedText ? (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider px-1">Copied!</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Package toggle tabs */}
              <div className="flex bg-[#0f0f15] border-b border-[#1b1b24] text-[10px] font-mono font-bold select-none overflow-x-auto">
                {[
                  { id: "cli", label: "pnpm core" },
                  { id: "python", label: "pip sdk" },
                  { id: "mcp", label: "mcp server" },
                  { id: "skills", label: "ai skill" },
                  { id: "prompt", label: "schema" }
                ].map((tab) => {
                  const active = activeCodeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCodeTab(tab.id as CodeTab)}
                      className={`px-4 py-2.5 border-r border-[#1b1b24] transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? "bg-[#0a0a0e] text-white border-b-2 border-b-blue-500"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Snippet Code block */}
              <div className="p-5 text-zinc-305 min-h-[160px] max-h-[200px] overflow-y-auto bg-[#0a0a0e] font-mono text-xs">
                <pre className="whitespace-pre-wrap leading-relaxed select-all">
                  <code>{codeSnippets[activeCodeTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Spacious Fading Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent my-20" />

        {/* ── Interactive Playground Section (Placed Second) ───────────── */}
        <div className="space-y-6" data-aos="fade-up">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono block">Live Sandbox</span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Interactive Execution Console
            </h2>
            <p className="text-xs font-semibold text-slate-505 dark:text-zinc-400 leading-relaxed font-sans">
              Type custom words or sentences to watch the pipeline execute normalizers, filters, and morphological rules.
            </p>
          </div>
          <LandingPlayground />
        </div>

        {/* Spacious Fading Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent my-20" />

        {/* ── Features Card Grid (Placed Third) ─────────────────────────── */}
        <div className="space-y-8" data-aos="fade-up">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono block">Capabilities</span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Platform Features
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed font-sans">
              Designed with precision for natural language processing of Ethiopic typography, character sets, and stemming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Lexical Normalization",
                desc: "Equates visual variations of character glyph configurations (e.g. ሃ/ሀ/ሐ, ኀ/ሀ, ሠ/ሰ, ዐ/አ) to maximize document indexing consistency."
              },
              {
                num: "02",
                title: "Rule-Based Stemmer",
                desc: "Employs morphological patterns to strip inflected suffixes, prefixes, and infixes, yielding correct word roots."
              },
              {
                num: "03",
                title: "Lossless Transliteration",
                desc: "Robust phonetic transliteration between standardized ASCII SERA phonetic strings and native Ge'ez scripts."
              },
              {
                num: "04",
                title: "Tokenization Exception rules",
                desc: "Correctly handles compound abbreviations, custom delimiters, sentence end punctuation, and numbers."
              },
              {
                num: "05",
                title: "Developer Console APIs",
                desc: "Manage credentials, monitor incoming usage streams, logs, metrics, and rate limit thresholds."
              },
              {
                num: "06",
                title: "Multi-language bindings",
                desc: "Integrates with Hono, Next.js, Python SDK, or agentic frameworks via MCP configurations."
              }
            ].map((feat, i) => (
              <div
                key={i}
                className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] hover:border-blue-500/10 transition-colors flex flex-col justify-between"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-3 font-bold">{feat.num}</span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-semibold font-sans">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacious Fading Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent my-20" />

        {/* ── Paradigm Shift Section (Placed Fourth) ─────────────────────── */}
        <div className="space-y-10" data-aos="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono block">The Paradigm Shift</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-tight">
                Closing the Ethiopic NLP Gap
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed font-sans">
                Traditional NLP libraries are English-centric and fail when applied to Ge'ez-based scripts. Fidel Tools introduces a script-first, modular approach designed for maximum accuracy and zero overhead.
              </p>
              <div className="p-4 border border-slate-200 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10 rounded-xl space-y-2 shadow-sm">
                <span className="text-[10px] font-bold font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block">Targeted Business Value</span>
                <p className="text-[11px] font-semibold text-slate-650 dark:text-zinc-400 leading-relaxed font-sans">
                  Power accurate search engine indexing (matching <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ልጆቻቸውን</code> to <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ልጅ</code>), reduce LLM token usage in Generative AI / RAG pipelines by stripping Amharic stopwords, and run translations offline.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Schema-First (JSON vs. Code)
                </h3>
                <p className="text-[11px] text-slate-655 dark:text-zinc-400 leading-relaxed font-semibold font-sans">
                  In legacy systems, supporting a new regional language requires writing complex Python parsing classes. In Fidel Tools, it's just a JSON configuration file. Linguists define language specifications without coding, opening up rapid support for Tigrinya, Oromo, and Ge'ez.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Normalization-First Pipeline
                </h3>
                <p className="text-[11px] text-slate-655 dark:text-zinc-400 leading-relaxed font-semibold font-sans">
                  Orthographic ambiguity is the silent killer of Ethiopic text analysis. Fidel Tools collapses spelling variations (e.g. <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ሀ/ሐ/ኀ</code>) before tokenization, ensuring downstream search and ML engines read the exact same semantic intent.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Lightweight & Edge-Ready
                </h3>
                <p className="text-[11px] text-slate-655 dark:text-zinc-400 leading-relaxed font-semibold font-sans">
                  No heavy neural networks or 500MB weights. The core rules engine is under <code className="font-mono">250KB</code>. Run processing locally inside browser packages, serverless functions, or edge runtimes with zero API network latency.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-[#070709] dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Shared Script Adapters
                </h3>
                <p className="text-[11px] text-slate-655 dark:text-zinc-400 leading-relaxed font-semibold font-sans">
                  Instead of reinventing the wheel, the core engine abstracts script mechanics (syllabary, unicode mappings) into a <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ScriptAdapter</code>. Multiple regional languages share one adapter, allowing near-instant codebase extensibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacious Fading Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent my-20" />

        {/* ── Benchmark Summary Section (Placed Fifth) ──────────────────── */}
        <div className="space-y-6" data-aos="fade-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono block">Speed & Performance</span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                Next-Gen Processing Speed
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xl font-sans">
                Benchmarks measured on standard medium-length paragraphs (~200 characters) comparing JS execution, WebAssembly, and native Python C-extensions.
              </p>
            </div>
            <Link
              href="/benchmarks"
              className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>View Full Benchmarks Suite</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* JS Fallback */}
            <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">JavaScript Fallback</span>
                <span className="text-xs font-mono text-zinc-500">16.46 μs</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-extrabold text-zinc-850 dark:text-zinc-200 font-mono">60,756 <span className="text-xs text-zinc-500 font-sans">ops/s</span></div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "74%" }} />
                </div>
              </div>
            </div>

            {/* WASM/Rust Engine */}
            <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] relative overflow-hidden shadow-lg shadow-emerald-500/5 border-emerald-500/30">
              <div className="absolute right-4 top-4 bg-emerald-500/10 text-emerald-555 text-[8px] font-bold font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">
                1.35x FASTEST
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-emerald-555 uppercase font-bold">WASM/Rust Engine</span>
                <span className="text-xs font-mono text-emerald-555">12.20 μs</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-extrabold text-emerald-555 font-mono">81,996 <span className="text-xs text-emerald-555/70 font-sans">ops/s</span></div>
                <div className="h-2 rounded-full bg-slate-105 dark:bg-zinc-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Python Package */}
            <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-xl bg-white dark:bg-[#070709] space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Python PyO3</span>
                <span className="text-xs font-mono text-zinc-500">113.53 μs</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-extrabold text-zinc-850 dark:text-zinc-200 font-mono">8,808 <span className="text-xs text-zinc-500 font-sans">ops/s</span></div>
                <div className="h-2 rounded-full bg-slate-105 dark:bg-zinc-950 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "11%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
  );
}
