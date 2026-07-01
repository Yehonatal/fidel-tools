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
  CopyCheck,
  Tag,
  Keyboard,
  Maximize2,
  FolderArchive,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
} from "lucide-react";

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

  const navigation: SidebarItem[] = [
    {
      name: "Core Pipeline Stage Runner",
      href: "/pipeline",
      icon: <Layers className="w-4 h-4" />,
      desc: "Step-by-step transformation tracer",
    },
    {
      name: "Full-Text Search Engine",
      href: "/search",
      icon: <Search className="w-4 h-4" />,
      desc: "Stem matching & overlap ranking",
    },
    {
      name: "Smart Input Normalization",
      href: "/input",
      icon: <Type className="w-4 h-4" />,
      desc: "Homophone spellcheck & diff-log",
    },
    {
      name: "Document Analyzer",
      href: "/analyze",
      icon: <BarChart3 className="w-4 h-4" />,
      desc: "Vocabulary analytics & density maps",
    },
    {
      name: "Similarity & Deduplication",
      href: "/deduplicate",
      icon: <CopyCheck className="w-4 h-4" />,
      desc: "Jaccard similarity match index",
    },
    {
      name: "Tag / Keyword Generator",
      href: "/tags",
      icon: <Tag className="w-4 h-4" />,
      desc: "Extract root noun occurrences",
    },
    {
      name: "Ge'ez ↔ SERA Transliteration",
      href: "/transliterate",
      icon: <Keyboard className="w-4 h-4" />,
      desc: "Bidirectional Unicode SERA mapping",
    },
    {
      name: "Query Expander",
      href: "/query-expand",
      icon: <Maximize2 className="w-4 h-4" />,
      desc: "Display potential stem suffixes",
    },
    {
      name: "Corpus Indexer Scale Test",
      href: "/corpus",
      icon: <FolderArchive className="w-4 h-4" />,
      desc: "Index file sets into vocabulary map",
    },
  ];

  // 1. Landing page layout (No sidebar, full screen width, marketing header)
  if (pathname === "/") {
    return (
      <div className="min-h-screen flex flex-col w-full relative">
        {/* Landing Top Header */}
        <header className="w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white select-none tracking-tight">
                ፊደል
              </span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mt-1.5 font-mono">
                Labs
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/pipeline"
                className="hidden sm:inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-sans text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Launch Console
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Children marketing components */}
        <main className="flex-grow w-full">{children}</main>
      </div>
    );
  }

  // 2. Dashboard Playground Console layout (Docked full-height sidebar, scroll-locked viewport)
  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row w-full relative md:overflow-hidden bg-[#fafafa] dark:bg-[#030303]">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden w-full h-16 px-4 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white select-none tracking-tight">
            ፊደል
          </span>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mt-1.5 font-mono">
            Labs
          </span>
        </Link>

        <div className="flex items-center gap-3">
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
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#070709] transition-all duration-300 ease-in-out z-30 overflow-hidden ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Workspace header */}
        <div
          className={`border-b border-zinc-200 dark:border-zinc-900 flex items-center shrink-0 h-14 overflow-hidden ${
            isCollapsed ? "justify-center px-2" : "justify-start px-4"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white shrink-0">
              {isCollapsed ? "ፊ" : "ፊደል"}
            </span>
            {!isCollapsed && (
              <span className="text-[10px] font-bold tracking-widest text-zinc-405 dark:text-zinc-500 uppercase mt-1.5 font-mono animate-in fade-in duration-200">
                Labs
              </span>
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
                  isCollapsed ? "justify-center p-2.5 mx-1" : "gap-3 px-2.5 py-2 mx-1"
                } ${
                  active
                    ? "bg-zinc-200/50 dark:bg-zinc-900/55 text-zinc-900 dark:text-white font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/35 dark:hover:bg-zinc-900/25 font-semibold"
                }`}
              >
                {active && !isCollapsed && (
                  <span className="absolute left-0 top-[20%] w-0.5 h-[60%] rounded bg-blue-500" />
                )}

                <span
                  className={`shrink-0 transition-colors ${active ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"}`}
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

        {/* Sidebar Dock Toggle (Modern IDE style) */}
        <div className="border-t border-zinc-200 dark:border-zinc-900 p-2 shrink-0">
          <button
            onClick={toggleCollapse}
            className={`w-full flex items-center rounded text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer ${
              isCollapsed ? "justify-center p-2" : "gap-3 px-2.5 py-2"
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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

        {/* Desktop Sidebar Pinned Theme Switcher */}
        <div className="border-t border-zinc-200 dark:border-zinc-900 p-3 bg-zinc-100/10 dark:bg-zinc-950/20 shrink-0">
          <div
            className={`flex items-center justify-between ${isCollapsed ? "justify-center" : "px-1"}`}
          >
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
        <div className="fixed inset-0 z-50 bg-[#fafafa]/98 dark:bg-[#030303]/98 flex flex-col p-6 space-y-6 md:hidden overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
              Lab Navigation Menu
            </h2>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 border border-zinc-200 dark:border-zinc-900 rounded bg-white dark:bg-zinc-950 text-zinc-500 cursor-pointer"
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
                  ? "bg-zinc-900 border-zinc-800 text-white dark:bg-zinc-900 dark:border-zinc-800"
                  : "border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-660 dark:text-zinc-400"
              }`}
            >
              <span className={`mt-0.5 ${pathname === "/" ? "text-blue-500" : "text-zinc-400"}`}>
                <BookOpen className="w-4 h-4" />
              </span>
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
                      ? "bg-zinc-900 border-zinc-800 text-white dark:bg-zinc-900 dark:border-zinc-800"
                      : "border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400"
                  }`}
                >
                  <span className={`mt-0.5 ${active ? "text-blue-500" : "text-zinc-400"}`}>
                    {item.icon}
                  </span>
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
    </div>
  );
}
