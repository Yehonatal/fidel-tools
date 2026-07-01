"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import {
  Layers,
  Search,
  Type,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Award,
  Terminal,
  Activity,
  Compass,
  LayoutGrid,
} from "lucide-react";
import { useLabMode } from "./mode-context";
import FidelCompanion from "./FidelCompanion";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  desc: string;
}

export default function LabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { mode, toggleMode } = useLabMode();

  useEffect(() => {
    const saved = localStorage.getItem("fidel-lab-collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
    setMounted(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("fidel-lab-collapsed", String(nextState));
  };

  const academicNavigation: SidebarItem[] = [
    {
      name: "Overview",
      href: "/dev",
      icon: <LayoutGrid className="w-4 h-4" />,
      desc: "Developer tools grid overview",
    },
    {
      name: "Supported Languages",
      href: "/dev/languages",
      icon: <BookOpen className="w-4 h-4" />,
      desc: "Language codes & config metadata",
    },
    {
      name: "Execution Pipeline",
      href: "/dev/pipeline",
      icon: <Layers className="w-4 h-4" />,
      desc: "Interactive multi-stage processing",
    },
    {
      name: "Smart Normalization",
      href: "/dev/normalize",
      icon: <Type className="w-4 h-4" />,
      desc: "Orthographic spelling homophones",
    },
    {
      name: "Sentence & Word Tokenizer",
      href: "/dev/tokenize",
      icon: <Activity className="w-4 h-4" />,
      desc: "Sentence segmenter & word arrays",
    },
    {
      name: "Stopwords Removal",
      href: "/dev/remove-stopwords",
      icon: <X className="w-4 h-4" />,
      desc: "Filter high-frequency semantic noise",
    },
    {
      name: "Morphological Stemmer",
      href: "/dev/stem",
      icon: <Compass className="w-4 h-4" />,
      desc: "Light stemmer and affix parsing",
    },
    {
      name: "Ge'ez ↔ SERA Transliteration",
      href: "/dev/transliterate",
      icon: <Layers className="w-4 h-4" />, // Replaced Keyboard with Layers to avoid type checking issues
      desc: "Bidirectional Unicode transcription",
    },
    {
      name: "Lexical Analyzer",
      href: "/dev/lexical-analyze",
      icon: <BarChart3 className="w-4 h-4" />,
      desc: "Contraction & abbreviation expansion",
    },
    {
      name: "Search & Term Indexer",
      href: "/dev/search",
      icon: <Search className="w-4 h-4" />,
      desc: "Index documents & query weighing",
    },
  ];

  const arcadeNavigation: SidebarItem[] = [
    {
      name: "Hero Selector",
      href: "/dev/languages",
      icon: <span className="text-sm select-none">🛡️</span>,
      desc: "Choose your linguist class",
    },
    {
      name: "Pipeline Playground",
      href: "/dev/pipeline",
      icon: <span className="text-sm select-none">⚙️</span>,
      desc: "Assemble stage compilation blocks",
    },
    {
      name: "Normalize or Not",
      href: "/dev/normalize",
      icon: <span className="text-sm select-none">🎯</span>,
      desc: "Spot spelling homophones under fire",
    },
    {
      name: "Token Ninja",
      href: "/dev/tokenize",
      icon: <span className="text-sm select-none">🥷</span>,
      desc: "Slice and reorder boundary units",
    },
    {
      name: "Stopword Sweep",
      href: "/dev/remove-stopwords",
      icon: <span className="text-sm select-none">🧹</span>,
      desc: "Clean high-frequency noise words",
    },
    {
      name: "Stem Sprint",
      href: "/dev/stem",
      icon: <span className="text-sm select-none">⚡</span>,
      desc: "Zap inflections by typing stems",
    },
    {
      name: "Transliteration Rush",
      href: "/dev/transliterate",
      icon: <span className="text-sm select-none">⌨️</span>,
      desc: "Ge'ez phonetic keyboard zapper",
    },
    {
      name: "Abbreviation Buster",
      href: "/dev/lexical-analyze",
      icon: <span className="text-sm select-none">💥</span>,
      desc: "Trivia match for contractions",
    },
    {
      name: "Search Showdown",
      href: "/dev/search",
      icon: <span className="text-sm select-none">⚔️</span>,
      desc: "Card-battle inverted relevance match",
    },
  ];

  const navigation = mode === "fun" ? arcadeNavigation : academicNavigation;

  // 1. Bypass layout for puzzle routes (renders the dedicated puzzle layout instead)
  if (pathname && pathname.startsWith("/puzzle")) {
    return <div className="min-h-screen w-full relative">{children}</div>;
  }

  // 2. Landing page layout (No sidebar, full screen width, marketing header)
  if (pathname === "/") {
    return (
      <div className="min-h-screen flex flex-col w-full relative">
        <header className="w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white select-none tracking-tight">
                ፊደል
              </span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-405 dark:text-zinc-500 uppercase mt-1.5 font-mono">
                Labs
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {mounted && (
                <button
                  onClick={toggleMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold font-mono text-zinc-700 dark:text-zinc-305 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {mode === "academic" ? (
                    <>
                      <Terminal className="w-3.5 h-3.5 text-blue-500" />
                      <span>Dev</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Puzzle</span>
                    </>
                  )}
                </button>
              )}
              <Link
                href="/dev/pipeline"
                className="hidden sm:inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-sans text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Launch
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow w-full">{children}</main>
      </div>
    );
  }

  // 2. Dashboard Playground Console layout (Docked full-height sidebar, scroll-locked viewport)
  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row w-full relative md:overflow-hidden bg-[#fafafa] dark:bg-[#030303]">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className={`md:hidden w-full h-16 px-4 border-b flex items-center justify-between sticky top-0 z-40 shrink-0 ${
        mode === "fun"
          ? "border-dashed border-zinc-250 bg-stone-100/90 dark:border-amber-500/25 dark:bg-[#0c0a09]/90 font-mono text-amber-500"
          : "border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      }`}>
        <Link href="/" className="group flex items-center gap-2.5 select-none">
          <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white tracking-tight">
            ፊደል
          </span>
          <div className="relative h-4 overflow-hidden mt-1.5">
            <span className="block text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-mono transition-transform duration-300 group-hover:-translate-y-6">
              {mode === "fun" ? "Puzzle" : "Dev"}
            </span>
            <span className={`absolute top-0 left-0 text-[10px] font-bold tracking-widest uppercase font-mono transition-transform duration-300 translate-y-6 group-hover:translate-y-0 whitespace-nowrap ${
              mode === "fun" ? "text-amber-500" : "text-blue-500"
            }`}>
              ← Back to Labs
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleMode}
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              title={mode === "academic" ? "Fidel Puzzle" : "Fidel Dev"}
            >
              {mode === "academic" ? (
                <Terminal className="w-4 h-4 text-blue-500" />
              ) : (
                <Award className="w-4 h-4 text-amber-500" />
              )}
            </button>
          )}
          <ThemeToggle />
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Desktop Docked Sidebar (Hidden on Mobile) */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out z-30 overflow-hidden ${
          isCollapsed ? "w-16" : "w-64"
        } ${
          mode === "fun"
            ? "border-r-2 border-dashed border-zinc-250 dark:border-amber-500/25 bg-stone-100 dark:bg-[#0b0a09] font-mono text-amber-500"
            : "border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#070709]"
        }`}
      >
        {/* Workspace header */}
        <div
          className={`flex items-center shrink-0 h-14 overflow-hidden ${
            isCollapsed ? "justify-center px-2" : "justify-start px-4"
          } ${
            mode === "fun"
              ? "border-b-2 border-dashed border-zinc-250 dark:border-amber-500/25"
              : "border-b border-zinc-200 dark:border-zinc-900"
          }`}
        >
          <Link href="/" className="group flex items-center gap-2.5 select-none">
            <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white shrink-0">
              {isCollapsed ? "ፊ" : "ፊደል"}
            </span>
            {!isCollapsed && (
              <div className="relative h-4 overflow-hidden mt-1.5">
                <span className={`block text-[10px] font-bold tracking-widest uppercase font-mono transition-transform duration-300 group-hover:-translate-y-6 ${
                  mode === "fun" ? "text-blue-600 dark:text-amber-400" : "text-zinc-405 dark:text-zinc-500"
                }`}>
                  {mode === "fun" ? "Puzzle" : "Dev"}
                </span>
                <span className={`absolute top-0 left-0 text-[10px] font-bold tracking-widest uppercase font-mono transition-transform duration-300 translate-y-6 group-hover:translate-y-0 whitespace-nowrap ${
                  mode === "fun" ? "text-amber-500" : "text-blue-500"
                }`}>
                  ← Back to Labs
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Sidebar Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded text-xs transition-all duration-200 relative ${
                  isCollapsed ? "justify-center p-2.5 mx-1" : "gap-3 px-2.5 py-2.5 mx-1"
                } ${
                  active
                    ? mode === "fun"
                      ? "bg-blue-600 text-white font-bold dark:bg-amber-500/10 dark:text-amber-300 dark:border-2 dark:border-dashed dark:border-amber-500/45 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-zinc-200/50 dark:bg-zinc-900/55 text-zinc-900 dark:text-white font-bold"
                    : mode === "fun"
                      ? "text-zinc-500 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-amber-400 hover:bg-blue-50/50 dark:hover:bg-amber-500/5 font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/35 dark:hover:bg-zinc-900/25 font-semibold"
                }`}
              >
                {active && !isCollapsed && mode !== "fun" && (
                  <span className="absolute left-0 top-[20%] w-0.5 h-[60%] rounded bg-blue-500" />
                )}

                <span
                  className={`shrink-0 transition-colors ${
                    active 
                      ? mode === "fun"
                        ? "text-white dark:text-amber-300"
                        : "text-blue-600 dark:text-blue-400"
                      : "text-zinc-405 dark:text-zinc-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span
                  className={`flex-grow text-left leading-none transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isCollapsed ? "w-0 opacity-0 max-w-0" : "w-auto opacity-100 max-w-[200px]"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Collapse Toggle */}
        <div className={`border-t p-2 shrink-0 ${
          mode === "fun" ? "border-zinc-250 dark:border-amber-500/25" : "border-zinc-200 dark:border-zinc-900"
        }`}>
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center rounded text-xs text-zinc-555 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer gap-3 px-2.5 py-2"
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <span className="font-semibold whitespace-nowrap">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* Desktop Sidebar Pinned Switchers */}
        <div className={`border-t p-3 shrink-0 space-y-3 ${
          mode === "fun" 
            ? "border-zinc-250 dark:border-amber-500/25 bg-stone-100/30 dark:bg-zinc-950/20" 
            : "border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-950/20"
        }`}>
          <div className="flex items-center justify-between px-1">
            {!isCollapsed && (
              <span className="text-[9px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                {mode === "academic" ? "Fidel Dev" : "Fidel Puzzle"}
              </span>
            )}
            {mounted && (
              <button
                onClick={toggleMode}
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer"
              >
                {mode === "academic" ? (
                  <Terminal className="w-4 h-4 text-blue-500" />
                ) : (
                  <Award className="w-4 h-4 text-amber-500" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between px-1">
            {!isCollapsed && (
              <span className="text-[9px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                Theme Toggle
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Navigation overlay drawer */}
      {mobileNavOpen && (
        <div className={`fixed inset-0 z-50 flex flex-col p-6 space-y-6 md:hidden overflow-y-auto ${
          mode === "fun"
            ? "bg-stone-50/98 dark:bg-[#0c0a09]/98 font-mono text-amber-500"
            : "bg-[#fafafa]/98 dark:bg-[#030303]/98"
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b ${
            mode === "fun" ? "border-zinc-250 dark:border-amber-500/25" : "border-zinc-200 dark:border-zinc-900"
          }`}>
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
              Lab Navigation Menu
            </h2>
            <div className="flex items-center gap-3">
              {mounted && (
                <button
                  onClick={toggleMode}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-900 rounded bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  {mode === "academic" ? (
                    <Terminal className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Award className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              )}
              <ThemeToggle />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 border border-zinc-200 dark:border-zinc-900 rounded bg-white dark:bg-zinc-950 text-zinc-550 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-start gap-3 p-3 rounded text-left transition-all border ${
                pathname === "/"
                  ? mode === "fun"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-white"
                  : "border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400"
              }`}
            >
              <span className="mt-0.5 text-sm">🎮</span>
              <div>
                <p className="text-xs font-bold leading-none">Lab Landing Overview</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-tight font-semibold">
                  NLP features presentation and quick start
                </p>
              </div>
            </Link>

            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-start gap-3 p-3 rounded text-left transition-all border ${
                    active
                      ? mode === "fun"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-white"
                      : "border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-655 dark:text-zinc-400"
                  }`}
                >
                  <span className="mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold leading-none">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-tight font-semibold">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content viewport panel */}
      <main className="flex-grow min-w-0 overflow-y-auto h-full">
        <div className="w-full h-full">{children}</div>
      </main>
      <FidelCompanion />
    </div>
  );
}
