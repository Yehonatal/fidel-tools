"use client";

import { Check, Bug, Rocket, ChevronRight } from "lucide-react";

interface ReleaseItem {
  version: string;
  date: string;
  packages: string[];
  features: string[];
  fixes: string[];
}

export default function ChangelogPage() {
  const releases: ReleaseItem[] = [
    {
      version: "v0.1.7",
      date: "July 01, 2026",
      packages: ["@fidel-tools/core", "@fidel-tools/core-native"],
      features: [
        "Ported the lexical normalizer hot path to Rust compiled to WebAssembly under @fidel-tools/core-native, inlining the WASM binary as base64 for zero-dependency loading.",
        "Integrated the WASM normalizer into @fidel-tools/core with a silent runtime fallback to the pure JS normalizer if WASM compilation fails.",
        "Created a multi-scale benchmarking suite to measure speedup: WASM achieves a 1.28x speedup on medium paragraphs (~150 chars), while JIT-optimized JS remains faster on short queries due to WASM boundary crossing overhead."
      ],
      fixes: [
        "Resolved the import.meta.url SyntaxError inside CommonJS environments (like Jest) by replacing imports with context-safe references in the build pipeline.",
        "Resolved WASM deprecation warning by updating initSync arguments to pass an object wrapper."
      ]
    },
    {
      version: "v0.1.6",
      date: "June 15, 2026",
      packages: ["@fidel-tools/core", "@fidel-tools/lang-am", "@fidel-tools/web"],
      features: [
        "Consolidated single Next.js monorepo workspace for landing page and developer cloud console under @fidel-tools/web.",
        "Refactored Amharic lexical exception mappings to O(1) matching checks.",
        "Created an interactive playground runner in the client layout, enabling dynamic sandbox testing for stemming and ASCII SERA transliteration."
      ],
      fixes: [
        "Removed a syntax error in packages/core/src/lexical_analyzer.ts causing workspace build breaks.",
        "Fixed Next.js 16 Turbopack build failure on client-side import references of fs module by routing aliases to empty-stub module.",
        "Standardized workspace config scripts for pnpm workspaces compilation flow."
      ]
    },
    {
      version: "v0.1.5",
      date: "June 12, 2026",
      packages: ["@fidel-tools/validate-pack"],
      features: [
        "Introduced @fidel-tools/validate-pack automated JSON language rules schema checker.",
        "Added --fix CLI flag inside validation engine to automatically auto-deduplicate rules lists and fix cycles."
      ],
      fixes: [
        "Fixed circular mapping cycle check algorithm that incorrectly flagged bi-directional equivalent maps as cyclic loops.",
        "Aligned stopwords schema lint check to ensure protected word arrays are not accidentally added."
      ]
    },
    {
      version: "v0.1.0",
      date: "June 01, 2026",
      packages: ["@fidel-tools/core", "@fidel-tools/lang-am", "@fidel-tools/api", "fidel-tools"],
      features: [
        "Initial release of Amharic morphological stemmer (rule-based prefix and suffix stripper).",
        "Implemented Ge'ez ASCII SERA transliterator for loss-free bi-directional script representation.",
        "Published Hono-based API server with endpoints for tokenizing, normalizing, and stemming Amharic corpora."
      ],
      fixes: [
        "Resolved initial base rule testing overlaps in language rules dictionary."
      ]
    }
  ];

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow transition-colors duration-300 font-sans">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column Description */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 h-fit space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
              04 / CHANGELOG
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none font-sans">
              All changes, fixes, and updates.
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              Every release shipped to the Fidel Tools monorepo packages, compiled and documented straight from our version control commits.
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 space-y-2 text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            <div>Latest Release: <span className="text-zinc-900 dark:text-white font-bold ml-1">v0.1.7</span></div>
            <div>GitHub Repository: <a href="https://github.com/Yehonatal/fidel-tools" target="_blank" className="text-blue-500 hover:underline inline-flex items-center ml-1">Yehonatal/fidel-tools <ChevronRight className="w-3 h-3" /></a></div>
          </div>
        </div>

        {/* Right Column Timeline */}
        <div className="lg:w-[65%] space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg p-6 shadow-sm dark:shadow-xl transition-colors duration-300 space-y-6">
              
              {/* Release Header */}
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-zinc-900 pb-4">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{release.version}</h2>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold font-mono">{release.date}</span>
                </div>
              </div>

              {/* Package Badges */}
              <div className="flex flex-wrap gap-1.5">
                {release.packages.map((pkg) => (
                  <span key={pkg} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                    {pkg}
                  </span>
                ))}
              </div>

              {/* Features Section */}
              {release.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-blue-500" />
                    Features &amp; Upgrades
                  </h3>
                  <ul className="space-y-2.5 pl-1">
                    {release.features.map((feat, idx) => (
                      <li key={idx} className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixes Section */}
              {release.fixes.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-500" />
                    Bug Fixes
                  </h3>
                  <ul className="space-y-2.5 pl-1">
                    {release.fixes.map((fix, idx) => (
                      <li key={idx} className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                        <Bug className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
