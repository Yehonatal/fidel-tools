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

type CodeTab = "cli" | "prompt" | "mcp" | "skills";

export default function HomePage() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activePlan, setActivePlan] = useState<"starter" | "pro" | "enterprise">("pro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("cli");
  const [copiedText, setCopiedText] = useState(false);

  const codeSnippets: Record<CodeTab, string> = {
    cli: `npm install @fidel-tools/core @fidel-tools/lang-am\n\n# Initialize local pipeline\n# import { Pipeline } from '@fidel-tools/core';\n# import amPack from '@fidel-tools/lang-am';`,
    prompt: `User: Parse the morphology of "ልጆቻቸውን" in JSON.\n\nAssistant:\n{\n  "lexeme": "ልጆቻቸውን",\n  "stem": "ልጅ",\n  "morphemes": ["ልጅ", "ዎች", "ቸው", "ን"]\n}`,
    mcp: `{\n  "mcpServers": {\n    "fidel-tools": {\n      "command": "npx",\n      "args": ["-y", "@fidel-tools/mcp-server"]\n    }\n  }\n}`,
    skills: `import { amharicNlpSkill } from "@fidel-tools/skills";\n\nconst agent = new Agent({\n  skills: [amharicNlpSkill]\n});\n\nawait agent.run("Stem the Amharic text...");`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const plans = {
    starter: {
      price: "$0",
      desc: "For evaluation and hobby projects.",
      features: [
        "10,000 requests / month",
        "1 active API credential key",
        "Self-service community support",
        "Access to basic stemming & tokenizer"
      ],
      buttonText: "Start building for free",
      href: "/sign-up"
    },
    pro: {
      price: "$29",
      desc: "For production services and applications.",
      features: [
        "250,000 requests / month",
        "Unlimited API credential keys",
        "Standard email & chat support",
        "Access to advanced normalization rules",
        "High-performance low-latency response priority"
      ],
      buttonText: "Get Pro Access",
      href: "/sign-up?tier=pro"
    },
    enterprise: {
      price: "Custom",
      desc: "For high-volume enterprise production workloads.",
      features: [
        "Unlimited monthly requests",
        "Dedicated isolated API instances",
        "Custom service level agreements (SLAs)",
        "24/7 priority developer support",
        "Dedicated account technical manager"
      ],
      buttonText: "Contact Sales",
      href: "mailto:support@fidel.tools"
    }
  };

  const comparisonRows = [
    { name: "Monthly requests limit", starter: "10,000 / mo", pro: "250,000 / mo", enterprise: "Unlimited" },
    { name: "API Keys allowed", starter: "1 key", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Rate limit threshold", starter: "60 req / min", pro: "600 req / min", enterprise: "Custom limits" },
    { name: "Normalize & Stemmer API", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    { name: "Transliterate API", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    { name: "Custom Stopwords List", starter: "No", pro: "Yes", enterprise: "Yes" },
    { name: "Support tier", starter: "Community Discord", pro: "Standard Email", enterprise: "24/7 dedicated support" },
    { name: "Service uptime SLA", starter: "99.0% SLA", pro: "99.9% SLA", enterprise: "99.99% custom SLA" },
  ];

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-24 relative z-10">
        
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
            <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              Fully composable, local-first rule stemmers, lexical normalizers, tokenizers, and loss-free ASCII transliteration. Built from scratch for the Ge'ez and Amharic developer ecosystem.
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
                    Get Started Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href="https://github.com/Yehonatal/fidel-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-300 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:border-zinc-800 dark:hover:text-white transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Github className="w-4 h-4" />
                    Star on GitHub
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right: Code Block Panel */}
          <div className="lg:w-[50%] w-full" data-aos="fade-left" data-aos-delay="100">
            <div className="border border-slate-200 dark:border-zinc-900 bg-[#070709] rounded-lg overflow-hidden flex flex-col font-mono text-xs shadow-2xl">
              {/* Tab Header */}
              <div className="bg-[#0b0b0e] border-b border-slate-200 dark:border-zinc-900 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-2">
                  {(["cli", "prompt", "mcp", "skills"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-1 transition-all cursor-pointer ${
                        activeCodeTab === tab
                          ? "text-white border-b-2 border-white"
                          : "text-zinc-500 hover:text-zinc-355"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(codeSnippets[activeCodeTab])}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Copy snippet"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 text-zinc-300 min-h-[160px] max-h-[200px] overflow-y-auto bg-black/40">
                <pre className="whitespace-pre-wrap leading-relaxed select-all">
                  <code>{codeSnippets[activeCodeTab]}</code>
                </pre>
              </div>
            </div>

            {/* Trusted By / Powering ecosystem logos */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-6 opacity-70 px-2" data-aos="fade-up" data-aos-delay="200">
              <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-bold">POWERING ECOSYSTEM:</span>
              <div className="flex flex-wrap gap-5 text-[11px] font-bold font-mono text-slate-600 dark:text-zinc-400">
                <span>VERCEL</span>
                <span>NEON</span>
                <span>SUPABASE</span>
                <span>UPSTASH</span>
                <span>HONO</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features Card Grid ──────────────────────────────────────── */}
        <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-zinc-900" data-aos="fade-up">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Platform Features
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
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
                className="border border-slate-200 dark:border-zinc-900 p-6 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900/10 transition-colors flex flex-col justify-between"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-500 block mb-3 font-bold">{feat.num}</span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 font-sans">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Paradigm Shift Section ───────────────────────────────────── */}
        <div className="space-y-10 pt-10 border-t border-slate-200 dark:border-zinc-900" data-aos="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-bold text-blue-500 dark:text-zinc-550 uppercase tracking-widest font-mono block">The Paradigm Shift</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-tight">
                Closing the Ethiopic NLP Gap
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
                Traditional NLP libraries are English-centric and fail when applied to Ge'ez-based scripts. Fidel Tools introduces a script-first, modular approach designed for maximum accuracy and zero overhead.
              </p>
              <div className="p-4 border border-slate-200 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10 rounded-md space-y-2">
                <span className="text-[10px] font-bold font-mono text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block">Targeted Business Value</span>
                <p className="text-[11px] font-semibold text-slate-650 dark:text-zinc-400 leading-relaxed">
                  Power accurate search engine indexing (matching <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ልጆቻቸውን</code> to <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ልጅ</code>), reduce LLM token usage in Generative AI / RAG pipelines by stripping Amharic stopwords, and run translations offline.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-md bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Schema-First (JSON vs. Code)
                </h3>
                <p className="text-[11px] text-slate-650 dark:text-zinc-450 leading-relaxed font-semibold">
                  In legacy systems, supporting a new language requires writing complex Python classes. In Fidel Tools, it's just a JSON file. Linguists define language specifications without coding, opening up rapid support for Tigrinya, Oromo, and Ge'ez.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-md bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Normalization-First Pipeline
                </h3>
                <p className="text-[11px] text-slate-650 dark:text-zinc-450 leading-relaxed font-semibold">
                  Orthographic ambiguity is the silent killer of Ethiopic text analysis. Fidel Tools collapses spelling variations (e.g. <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ሀ/ሐ/ኀ</code>) before tokenization, ensuring downstream search and ML engines read the exact same semantic intent.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-md bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Lightweight & Edge-Ready
                </h3>
                <p className="text-[11px] text-slate-650 dark:text-zinc-450 leading-relaxed font-semibold">
                  No heavy neural networks or 500MB weights. The core rules engine is under <code className="font-mono">250KB</code>. Run processing locally inside browser packages, serverless functions, or edge runtimes with zero API network latency.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-900 p-6 rounded-md bg-white dark:bg-[#070709] space-y-3">
                <div className="w-8 h-8 rounded bg-blue-50/80 dark:bg-zinc-900 flex items-center justify-center text-blue-600 dark:text-zinc-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">
                  Shared Script Adapters
                </h3>
                <p className="text-[11px] text-slate-650 dark:text-zinc-450 leading-relaxed font-semibold">
                  Instead of reinventing the wheel, the core engine abstracts script mechanics (syllabary, unicode mappings) into a <code className="font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">ScriptAdapter</code>. Multiple regional languages share one adapter, allowing near-instant codebase extensibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Interactive Playground Section ───────────────────────────── */}
        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-zinc-900" data-aos="fade-up">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Interactive Execution Console
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-550">
              Type custom words or sentences to watch the pipeline execute normalizers, filters, and morphological rules.
            </p>
          </div>
          <LandingPlayground />
        </div>

        {/* ── Pricing Structure & Toggles ────────────────────────────── */}
        <div className="space-y-10 pt-10 border-t border-slate-200 dark:border-zinc-900">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
            {/* Left pricing switcher */}
            <div className="md:w-1/3 flex flex-col justify-between py-1 space-y-6 md:space-y-0" data-aos="fade-right">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-widest font-mono block">Pricing Configuration</span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Developer Infrastructure
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-450 leading-relaxed">
                  Scale your production services using our managed REST APIs. Isolated instances and custom SLAs on demand.
                </p>
              </div>

              <div className="space-y-2 max-w-xs font-sans">
                {(["starter", "pro", "enterprise"] as const).map((p) => {
                  const active = activePlan === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setActivePlan(p)}
                      className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-155 cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white border-slate-800 font-bold dark:bg-zinc-900 dark:text-white dark:border-zinc-800"
                          : "border-slate-200/60 dark:border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium"
                      }`}
                    >
                      <span className="text-[9px] tracking-widest font-mono uppercase">{p}</span>
                      <span className="text-xs font-mono">{plans[p].price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right pricing card */}
            <div className="flex-1" data-aos="fade-left">
              <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md p-8 shadow-2xl min-h-[360px] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-baseline gap-2 justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-mono">
                      {activePlan} plan features
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                        {plans[activePlan].price}
                      </span>
                      {activePlan !== "enterprise" && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 font-mono">/ mo</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-6">
                    {plans[activePlan].desc}
                  </p>

                  <div className="border-t border-slate-200 dark:border-zinc-800 my-4" />

                  <ul className="space-y-3">
                    {plans[activePlan].features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed">
                        <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={plans[activePlan].href}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer border border-transparent bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black shadow-lg"
                  >
                    <span>{plans[activePlan].buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Comparison Matrix Table ────────────────────────────────── */}
        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-zinc-900" data-aos="fade-up">
          <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-450 uppercase tracking-widest font-mono flex items-center gap-2">
            <Command className="w-4 h-4 text-slate-500" />
            Comparison Matrix Table
          </h3>
          <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-900 bg-slate-50/80 dark:bg-black/20">
                    <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Features Details</th>
                    <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Starter</th>
                    <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Pro</th>
                    <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-900">
                  {comparisonRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-805 dark:text-zinc-200">{row.name}</td>
                      <td className="px-6 py-3.5 text-slate-500 dark:text-zinc-500 font-semibold">{row.starter}</td>
                      <td className="px-6 py-3.5 text-slate-900 dark:text-zinc-200 font-bold">{row.pro}</td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-zinc-400 font-semibold">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
  );
}
