"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Keyboard,
  Type,
  Check,
  Copy,
  Github,
  Cpu,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Code,
  Compass,
  Terminal,
  HelpCircle,
  Activity,
  ArrowRightLeft,
  Settings,
  Database,
} from "lucide-react";

type TabType = "NORMALIZER" | "STEMMER" | "TRANSLITERATOR" | "CODE";

export default function LabLandingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("NORMALIZER");
  const [copied, setCopied] = useState(false);
  const [inputVal, setInputVal] = useState("ሐኪሙ ትናንትና ወደ ት/ቤት ሄደ።");
  const [normalizedVal, setNormalizedVal] = useState("");
  const [stems, setStems] = useState<string[]>([]);
  const [sera, setSera] = useState("");
  const [loading, setLoading] = useState(false);

  // Onboarding States
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Onboarding Stage Interactive States
  const [wizardNormInput, setWizardNormInput] = useState("ሀኪም");
  const [wizardNormInput2, setWizardNormInput2] = useState("ሐኪም");
  const [wizardNormOutput, setWizardNormOutput] = useState("");
  const [wizardNormOutput2, setWizardNormOutput2] = useState("");
  const [normLoading, setNormLoading] = useState(false);

  const [wizardStemInput, setWizardStemInput] = useState("ልጆቻቸውን");
  const [wizardStemOutput, setWizardStemOutput] = useState("");
  const [stemLoading, setStemLoading] = useState(false);

  const [wizardTransInput, setWizardTransInput] = useState("selam");
  const [wizardTransOutput, setWizardTransOutput] = useState("");
  const [transLoading, setTransLoading] = useState(false);

  const [fidelSearchEnabled, setFidelSearchEnabled] = useState(false);
  const [simulationSearchQuery, setSimulationSearchQuery] = useState("ሐኪም");
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  // Simulation Corpus Docs
  const simulationCorpus = [
    { id: "doc-1", content: "የሀገሪቱ ሐኪሞች በሙሉ በሆስፒታሉ ውስጥ ይሰበሰባሉ።" },
    { id: "doc-2", content: "ሃኪሙ ትላንትና ማታ ወደ መርካቶ ሄዶ ነበረ።" },
  ];

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("pnpm add @fidel-tools/core @fidel-tools/lang-am");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processText = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          stages: ["normalize", "stem", "transliterate"],
        }),
      });
      const data = await res.json();
      if (data.trace) {
        setNormalizedVal(data.trace.normalize?.[0] || "");
        setStems(data.trace.stem || []);
        setSera(data.trace.transliterate || "");
      }
    } catch (err) {
      console.error("Pipeline run failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Normalizer Handler
  const handleWizardNormalize = async () => {
    setNormLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: wizardNormInput }),
        }).then((r) => r.json()),
        fetch("/api/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: wizardNormInput2 }),
        }).then((r) => r.json()),
      ]);
      setWizardNormOutput(res1.result || "");
      setWizardNormOutput2(res2.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setNormLoading(false);
    }
  };

  // Onboarding Stemmer Handler
  const handleWizardStem = async (wordToStem?: string) => {
    const target = wordToStem || wizardStemInput;
    if (wordToStem) setWizardStemInput(wordToStem);
    setStemLoading(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target, stages: ["stem"] }),
      });
      const data = await res.json();
      setWizardStemOutput(data.trace?.stem?.[0] || "");
    } catch (err) {
      console.error(err);
    } finally {
      setStemLoading(false);
    }
  };

  // Onboarding Transliterate Handler
  const handleWizardTransliterate = async (latin?: string) => {
    const target = latin || wizardTransInput;
    if (latin) setWizardTransInput(latin);
    setTransLoading(true);
    try {
      const res = await fetch("/api/transliterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target, direction: "to-geez" }),
      });
      const data = await res.json();
      setWizardTransOutput(data.result || "");
    } catch (err) {
      console.error(err);
    } finally {
      setTransLoading(false);
    }
  };

  // Onboarding Search Simulation Handler
  const runSearchSimulation = async () => {
    if (!fidelSearchEnabled) {
      // Literal Search simulation
      const queryClean = simulationSearchQuery.trim();
      const hits = simulationCorpus.map((doc) => {
        const hasTerm = doc.content.includes(queryClean);
        return {
          id: doc.id,
          content: doc.content,
          score: hasTerm ? 1.0 : 0.0,
          matchedStems: hasTerm ? [queryClean] : [],
        };
      });
      setSimulationResults(hits);
    } else {
      // Fidel NLP Search
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: simulationSearchQuery, documents: simulationCorpus }),
        });
        const data = await response.json();
        setSimulationResults(data.results || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    processText(inputVal);
    const done = localStorage.getItem("fidel-onboarding-done");
    if (done === "true") {
      setOnboardingDone(true);
    }
  }, []);

  useEffect(() => {
    if (onboardingOpen) {
      if (onboardingStep === 1) handleWizardNormalize();
      if (onboardingStep === 2) handleWizardStem();
      if (onboardingStep === 3) handleWizardTransliterate();
    }
  }, [onboardingStep, onboardingOpen]);

  useEffect(() => {
    if (onboardingOpen && onboardingStep === 4) {
      runSearchSimulation();
    }
  }, [fidelSearchEnabled, simulationSearchQuery, onboardingStep, onboardingOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    processText(val);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem("fidel-onboarding-done", "true");
    setOnboardingDone(true);
    setOnboardingOpen(false);
    window.location.href = "/pipeline";
  };

  const handleLaunchConsoleClick = (e: React.MouseEvent) => {
    const done = localStorage.getItem("fidel-onboarding-done");
    if (done !== "true") {
      e.preventDefault();
      setOnboardingStep(0);
      setOnboardingOpen(true);
    }
  };

  const codeSnippet = `// Run Amharic NLP pre-processing pipeline
import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am/am.json';

const nlp = new Pipeline(amPack);
const normalized = nlp.normalize("${inputVal}");
const stems = nlp.stem(normalized);`;

  const onboardingSteps = [
    {
      title: "The Ge'ez Script Problem",
      desc: "Understanding the unique linguistic bottlenecks of Amharic computing.",
    },
    {
      title: "Stage 1: Lexical Normalization",
      desc: "Merging spelling duplicates into canonical keys.",
    },
    { title: "Stage 2: Light Stemming", desc: "Stripping suffixes to expose core root meanings." },
    {
      title: "Stage 3: Transliteration",
      desc: "Bidirectional mapping for frictionless text inputs.",
    },
    {
      title: "Stage 4: Search Validation",
      desc: "Seeing the exact precision boost in a live index search.",
    },
    { title: "Launch & SDK Install", desc: "Adding the library components to your environment." },
  ];

  return (
    <div className="space-y-20 py-8 md:py-16 px-4 max-w-7xl mx-auto font-sans relative">
      {/* ── 1. TWO-COLUMN HERO SECTION ──────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 dark:border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Development Lab v0.1.6</span>
          </div>

          {/* Large Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
            The interactive testground for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Amharic NLP
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-zinc-655 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
            Trace, benchmark, and visualize language processing pipelines in real-time. Test spell
            correction homophones, Light Stemming, and transliteration stages interactively.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/pipeline"
              onClick={handleLaunchConsoleClick}
              className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-sans text-xs font-bold px-5 py-3 rounded-lg transition-all active:scale-98 shadow-sm cursor-pointer"
            >
              <span>Launch Lab Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {onboardingDone && (
              <button
                onClick={() => {
                  setOnboardingStep(0);
                  setOnboardingOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 text-zinc-750 dark:text-zinc-300 font-sans text-xs font-bold px-5 py-3 rounded-lg transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Replay Onboarding Tour</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Code Console Terminal Widget (Always Dark Theme) */}
        <div className="lg:col-span-7">
          <div className="w-full rounded-xl border border-zinc-900 bg-[#070709] overflow-hidden flex flex-col font-mono text-zinc-300 shadow-2xl">
            {/* Terminal Header Tabs */}
            <div className="bg-[#0b0b0e] px-4 py-2 border-b border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(["NORMALIZER", "STEMMER", "TRANSLITERATOR", "CODE"] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                      activeTab === tab
                        ? "bg-zinc-900 text-white border border-zinc-800"
                        : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Copy action */}
              <button
                onClick={handleCopyInstall}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded"
                title="Copy code snippet"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Terminal Panel Content */}
            <div className="p-6 space-y-5 min-h-[260px] flex flex-col justify-between">
              {/* Output Content */}
              <div className="space-y-4">
                {activeTab === "NORMALIZER" && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Normalizer Stage Output
                    </span>
                    <div className="p-3 bg-[#0d0d11] border border-zinc-900 rounded-lg">
                      <p className="text-xs text-sky-450 font-bold leading-normal select-all">
                        {loading ? "..." : normalizedVal || "-"}
                      </p>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Harmonizes variable letter shapes to uniform canonical roots (e.g. ሀ, ሐ, ኀ, ሃ)
                      to prevent index duplicate keys.
                    </p>
                  </div>
                )}

                {activeTab === "STEMMER" && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Stems Stage Output
                    </span>
                    <div className="flex flex-wrap gap-2 p-3 bg-[#0d0d11] border border-zinc-900 rounded-lg min-h-[48px]">
                      {loading ? (
                        <span className="text-xs text-zinc-500">...</span>
                      ) : stems.length > 0 ? (
                        stems.map((stem, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-900/10"
                          >
                            {stem}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 italic">None</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Removes grammatical suffixes and prefixes from token stems.
                    </p>
                  </div>
                )}

                {activeTab === "TRANSLITERATOR" && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Transliteration mapping
                    </span>
                    <div className="p-3 bg-[#0d0d11] border border-zinc-900 rounded-lg">
                      <p className="text-xs text-emerald-450 font-bold leading-normal select-all">
                        {loading ? "..." : sera || "-"}
                      </p>
                    </div>
                    <p className="text-[10px] text-zinc-550 leading-normal">
                      Phonetic SERA ASCII mapping representation.
                    </p>
                  </div>
                )}

                {activeTab === "CODE" && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Workspace Setup Code
                    </span>
                    <pre className="p-3 bg-[#0d0d11] border border-zinc-900 rounded-lg text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                      {codeSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Prompt Input */}
              <div className="border-t border-zinc-900 pt-4 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 font-bold text-xs select-none shrink-0">$</span>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={handleInputChange}
                    className="flex-grow bg-transparent border-0 outline-none focus:outline-none text-xs font-semibold text-zinc-100 placeholder-zinc-700"
                    placeholder="Enter Amharic text to trace compilation output..."
                  />
                  {loading && (
                    <div className="w-3.5 h-3.5 border border-zinc-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PLATFORM FEATURES ────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-left space-y-2 max-w-lg">
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white font-sans tracking-tight">
            Lab Playground Modules
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed font-sans">
            Validate all functions of the fidel-tools NLP parser inside dedicated sandboxes.
          </p>
        </div>

        {/* 3-column features card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/input"
            className="premium-card p-6 flex flex-col justify-between min-h-[180px] bg-white dark:bg-zinc-950/20 hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-600 block mb-4">
                01
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-sans mb-2">
                Lexical Normalizer
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                Type sentences to view side-by-side homophone character normalization and spelling
                corrections in real-time.
              </p>
            </div>
          </Link>

          <Link
            href="/pipeline"
            className="premium-card p-6 flex flex-col justify-between min-h-[180px] bg-white dark:bg-zinc-950/20 hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-600 block mb-4">
                02
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-sans mb-2">
                Pipeline Stage Visualizer
              </h3>
              <p className="text-xs text-zinc-660 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                Trace step-by-step transformation traces from raw strings through stopwords removal,
                stemming, and SERA.
              </p>
            </div>
          </Link>

          <Link
            href="/search"
            className="premium-card p-6 flex flex-col justify-between min-h-[180px] bg-white dark:bg-zinc-950/20 hover:border-blue-500 transition-colors"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-600 block mb-4">
                03
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-sans mb-2">
                Full-Text Search Engine
              </h3>
              <p className="text-xs text-zinc-660 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                Evaluate keyword overlap scores, inverted index parameters, and document tf-idf
                values interactively.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. ENGULFIING ONBOARDING INTERACTIVE WIZARD FULL-VIEWPORT ── */}
      {onboardingOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[99999] bg-[#fafafa] dark:bg-[#030303] flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
          {/* Left Panel: Step List & Info Header (Dark Industrial Side) */}
          <div className="md:w-80 bg-zinc-950 text-zinc-105 p-6 md:p-8 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-zinc-900">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-500">
                    <Compass className="w-4.5 h-4.5 animate-spin-slow" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-loga text-xl font-light tracking-tight text-white select-none">
                      ፊደል
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase font-mono">
                      Labs onboarding
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-4">
                {onboardingSteps.map((step, idx) => {
                  const isPassed = onboardingStep > idx;
                  const isActive = onboardingStep === idx;
                  return (
                    <div key={idx} className="flex gap-3 text-left items-start">
                      <div
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold font-mono transition-colors ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : isActive
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-900 text-zinc-650 border border-zinc-800"
                        }`}
                      >
                        {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold font-sans transition-colors ${
                            isActive ? "text-white" : "text-zinc-500"
                          }`}
                        >
                          {step.title}
                        </p>
                        {isActive && (
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans leading-relaxed">
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
              <button
                onClick={handleCompleteOnboarding}
                className="text-[9px] font-bold tracking-widest text-zinc-600 hover:text-red-400 transition-colors uppercase font-mono cursor-pointer"
              >
                Skip Onboarding
              </button>
              <span className="text-[9px] font-mono text-zinc-600">v0.1.6</span>
            </div>
          </div>

          {/* Right Panel: Content Area & Sandboxes (Theme Responsive Pane) */}
          <div className="flex-1 bg-white dark:bg-[#030303] p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
            {/* Header / Dismiss Action */}
            <div className="flex justify-between items-start gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest">
                  Pipeline Discovery Stage {onboardingStep + 1} of 6
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-white font-sans mt-1">
                  {onboardingSteps[onboardingStep].title}
                </h2>
              </div>
              <button
                onClick={handleCompleteOnboarding}
                className="p-1.5 border border-zinc-200 dark:border-zinc-900 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Body */}
            <div className="flex-1 py-8 md:py-10 max-w-3xl">
              {/* STEP 0: Introduction to Ge'ez computing problem */}
              {onboardingStep === 0 && (
                <div className="space-y-6">
                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    Amharic language computation is fundamentally broken on traditional Western
                    database structures. Traditional databases index text literally. Ge'ez syntax,
                    however, creates massive information loss due to duplicate spelling shapes:
                  </p>

                  {/* Flow Diagram Block */}
                  <div className="p-5 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 space-y-4 animate-slide-up shadow-xs">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-405 dark:text-zinc-555 block uppercase">
                      NLP Compilation Failure Model
                    </span>

                    <div className="flex flex-col gap-3">
                      {/* Diagram Row 1 */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-red-500/10 bg-red-500/[0.01] hover:scale-[1.01] transition-transform duration-200">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-500 uppercase shrink-0">
                          WITHOUT NLP
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>Query `ሐኪም`</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="p-1 bg-zinc-200 dark:bg-zinc-900 rounded border text-[10px]">
                            Database Search Index
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-red-500 font-bold">
                            X (Zero hits for doc containing `ሀኪም`)
                          </span>
                        </div>
                      </div>

                      {/* Diagram Row 2 */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.01] hover:scale-[1.01] transition-transform duration-200 animate-glow-pulse">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase shrink-0">
                          WITH FIDEL TOOLS
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>Query `ሐኪም`</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="p-1 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20 text-[10px] font-bold">
                            Normalizer
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">
                            ✔ Match! (Returns `ሀኪም`)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up">
                    <div className="p-5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 space-y-2 hover:scale-[1.01] transition-transform duration-200">
                      <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <h4 className="text-sm font-bold font-sans">Homophone Duplicates</h4>
                      </div>
                      <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-sans">
                        Identical sounding words use distinct spelling shapes. Searching for `ሐኪም`
                        (doctor) misses entries stored as `ሀኪም` or `ሃኪም`. Index queries miss up to
                        40% of relevant records.
                      </p>
                    </div>

                    <div className="p-5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 space-y-2 hover:scale-[1.01] transition-transform duration-200">
                      <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <h4 className="text-sm font-bold font-sans">Inflectional Bloat</h4>
                      </div>
                      <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-sans">
                        Suffixes mutate the word form. `ልጅ` (child) expands into `ልጆች`, `ልጅነት`,
                        `ልጆቻችን`. Standard indexes treat these as entirely distinct entities.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: The Normalizer */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    The **Lexical Normalizer** solves spelling divergence. It maps character shapes
                    representing identical phonemes to unified canonical keys. Watch how we
                    normalize the variations below into a single index query:
                  </p>

                  {/* Normalizer Diagram */}
                  <div className="p-5 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 space-y-4 animate-slide-up shadow-xs">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-405 dark:text-zinc-555 block uppercase">
                      Lexical Merging Pipeline
                    </span>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      {/* Character boxes */}
                      <div className="flex gap-2 animate-float">
                        {["ሀ", "ሐ", "ኀ", "ሃ"].map((char) => (
                          <div
                            key={char}
                            className="w-10 h-10 rounded-lg border border-zinc-350 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center font-bold text-sm text-zinc-800 dark:text-zinc-200 shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            {char}
                          </div>
                        ))}
                      </div>

                      <div className="text-zinc-450">
                        <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                      </div>

                      {/* Engine node */}
                      <div className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold font-mono flex items-center gap-2 animate-glow-pulse">
                        <Settings className="w-4 h-4 animate-spin-slow" />
                        <span>Normalizer</span>
                      </div>

                      <div className="text-zinc-450">
                        <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                      </div>

                      {/* Target node */}
                      <div className="w-12 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-extrabold text-emerald-500 shadow-md animate-float">
                        ሀ
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Variant Spelling A
                      </span>
                      <input
                        type="text"
                        value={wizardNormInput}
                        onChange={(e) => setWizardNormInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                      <div className="p-3 bg-[#09090b] border border-zinc-900 rounded-lg text-sm font-mono font-bold text-sky-400 text-center min-h-[46px]">
                        {normLoading ? "..." : wizardNormOutput || "-"}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Variant Spelling B
                      </span>
                      <input
                        type="text"
                        value={wizardNormInput2}
                        onChange={(e) => setWizardNormInput2(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                      <div className="p-3 bg-[#09090b] border border-zinc-900 rounded-lg text-sm font-mono font-bold text-sky-400 text-center min-h-[46px]">
                        {normLoading ? "..." : wizardNormOutput2 || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleWizardNormalize}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold px-6 py-3 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Run Live Normalizer
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: The Stemmer */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    The **Light Stemmer** exposes root lemmas. Suffixes and prefixes are parsed and
                    stripped. Select a word below to test the extraction engine:
                  </p>

                  {/* Stemmer Diagram */}
                  <div className="p-5 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 space-y-4 animate-slide-up shadow-xs">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-405 dark:text-zinc-555 block uppercase">
                      Suffix Stripping Flow
                    </span>

                    <div className="flex flex-wrap items-center justify-center gap-3 animate-float">
                      <div className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-500 hover:scale-105 transition-transform duration-200">
                        ልጅ (Root)
                      </div>
                      <span className="text-zinc-450 font-bold">+</span>
                      <div className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-bold text-red-400 line-through hover:scale-105 transition-transform duration-200">
                        ኦቻቸው (Suffix)
                      </div>
                      <span className="text-zinc-450 font-bold">+</span>
                      <div className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-bold text-red-400 line-through hover:scale-105 transition-transform duration-200">
                        ን (Suffix)
                      </div>

                      <ArrowRight className="w-5 h-5 text-zinc-400" />

                      <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-md animate-glow-pulse">
                        ልጅ (Final Stem)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 py-1">
                    {["ልጆቻቸውን", "ቤታችን", "ትምህርትቤቶች", "መምህራን"].map((word) => (
                      <button
                        key={word}
                        onClick={() => handleWizardStem(word)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-900 hover:border-blue-500 hover:scale-[1.05] active:scale-95 transition-all cursor-pointer"
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-250 dark:border-zinc-900 rounded-xl p-5">
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Grammatical Variant
                      </span>
                      <input
                        type="text"
                        value={wizardStemInput}
                        onChange={(e) => setWizardStemInput(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="w-10 flex justify-center text-zinc-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Lemma Base Root
                      </span>
                      <div className="bg-[#09090b] border border-zinc-900 rounded-lg p-3.5 text-sm font-mono font-extrabold text-center text-emerald-450 min-h-[46px] flex items-center justify-center">
                        {stemLoading ? "..." : wizardStemOutput || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleWizardStem()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold px-6 py-3 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Extract Stem Root
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Transliteration */}
              {onboardingStep === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    The **Phonetic Transliterator** bridges Latin keyboards with Ge'ez Unicode. It
                    parses phonetic sound mapping inputs standardly. Try typing or selecting Latin
                    text below:
                  </p>

                  {/* Transliteration Keyboard Diagram */}
                  <div className="p-5 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 space-y-4 animate-slide-up shadow-xs">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-405 dark:text-zinc-555 block uppercase">
                      SERA Keyboard Translation Model
                    </span>

                    <div className="flex flex-col items-center gap-3">
                      {/* Keyboard Keys Layout */}
                      <div className="flex gap-1.5 animate-float">
                        {["S", "E", "L", "A", "M"].map((k) => (
                          <div
                            key={k}
                            className="px-3.5 py-2 rounded border border-zinc-350 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 shadow-sm hover:-translate-y-1 hover:border-blue-500 transition-all cursor-pointer"
                          >
                            {k}
                          </div>
                        ))}
                      </div>

                      <div className="text-zinc-400">
                        <ArrowRightLeft className="w-4 h-4 rotate-90" />
                      </div>

                      {/* Output characters */}
                      <div className="flex gap-4">
                        <div className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-sm animate-glow-pulse">
                          ሰ
                        </div>
                        <div className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-sm animate-glow-pulse">
                          ላ
                        </div>
                        <div className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-sm animate-glow-pulse">
                          ም
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 py-1">
                    {["selam", "abeba", "ihit", "ityopya"].map((lat) => (
                      <button
                        key={lat}
                        onClick={() => handleWizardTransliterate(lat)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-900 hover:border-blue-500 hover:scale-[1.05] active:scale-95 transition-all cursor-pointer"
                      >
                        {lat}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-250 dark:border-zinc-900 rounded-xl p-5">
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Latin characters
                      </span>
                      <input
                        type="text"
                        value={wizardTransInput}
                        onChange={(e) => setWizardTransInput(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="w-10 flex justify-center text-zinc-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-mono block">
                        Ge'ez output
                      </span>
                      <div className="bg-[#09090b] border border-zinc-900 rounded-lg p-3.5 text-sm font-mono font-extrabold text-center text-sky-400 min-h-[46px] flex items-center justify-center">
                        {transLoading ? "..." : wizardTransOutput || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => handleWizardTransliterate()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold px-6 py-3 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Transliterate
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Search Engine Simulation */}
              {onboardingStep === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-655 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    Let's search for **`ሐኪም`** in a small index corpus. The corpus contains spelling
                    variants like `ሐኪሞች` and `ሃኪሙ`. Toggle the switch to see the exact contrast:
                  </p>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200 font-mono">
                        Query: "{simulationSearchQuery}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 dark:text-zinc-500">
                        Fidel Tools Engine
                      </span>
                      <button
                        onClick={() => setFidelSearchEnabled(!fidelSearchEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          fidelSearchEnabled ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            fidelSearchEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 animate-slide-up">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 font-mono block">
                      Corpus Matches
                    </span>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {simulationResults.map((res) => {
                        const hasHit = res.score > 0;
                        return (
                          <div
                            key={res.id}
                            className={`p-3.5 rounded-lg border text-sm flex justify-between items-center transition-all hover:scale-[1.01] ${
                              hasHit
                                ? "bg-blue-500/[0.02] border-blue-500/20 text-zinc-800 dark:text-zinc-250"
                                : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-250 dark:border-zinc-900/40 text-zinc-400 opacity-50"
                            }`}
                          >
                            <span className="font-semibold line-clamp-1">{res.content}</span>
                            <span
                              className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded ${
                                hasHit
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                              }`}
                            >
                              {hasHit ? `Match (${Math.round(res.score * 100)}%)` : "No Match"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg text-xs leading-relaxed font-sans">
                    {fidelSearchEnabled ? (
                      <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          ✔ Success! Fidel Tools normalizes the spelling to a common root, and stems
                          inflections, retrieving 100% of matches!
                        </span>
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>
                          ✘ Search Miss! Without preprocessing, literal search yields 0 matches
                          because orthographic structures do not match the query exactly.
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: SDK Install & Console launch */}
              {onboardingStep === 5 && (
                <div className="space-y-6">
                  <p className="text-sm text-zinc-655 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                    Fidel Tools is available as an npm package for modern Node.js, Bun, and
                    browser-based build environments. Run the following command in your terminal:
                  </p>

                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4">
                    <pre className="text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre-wrap select-all">
                      pnpm add @fidel-tools/core @fidel-tools/lang-am
                    </pre>
                    <button
                      onClick={handleCopyInstall}
                      className="absolute right-4 p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                      title="Copy install command"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="p-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl flex items-start gap-4 text-zinc-800 dark:text-zinc-200 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 font-sans">
                      <p className="font-bold">Discovery Tour Completed!</p>
                      <p className="text-xs text-zinc-500 leading-normal">
                        You have successfully verified all modules of the pipeline. You can now
                        launch the dashboard environment to build your custom indexes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stage Footer Navigation */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5 flex justify-between items-center mt-auto">
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                disabled={onboardingStep === 0}
                className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {onboardingStep < 5 ? (
                <button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold px-5 py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteOnboarding}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold px-6 py-3 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>Launch Lab Console</span>
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
