"use client";

import { useState } from "react";
import { Check, Copy, Code, Terminal } from "lucide-react";

interface PackageInfo {
  name: string;
  lang: "TypeScript" | "Python" | "JSON Schema";
  installCmd: string;
  description: string;
  features: string[];
  codeExample: string;
}

export default function PackagesPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const packages: PackageInfo[] = [
    {
      name: "@fidel-tools/core",
      lang: "TypeScript",
      installCmd: "npm install @fidel-tools/core",
      description: "The core rule-based processing engine. Includes tokenization pipeline, stopwords filters, term weighting (TF-IDF), and stemmer orchestration.",
      features: [
        "Tree-shakeable ESM/CommonJS compilation",
        "Deterministic rule execution flow",
        "Pipeline architecture for clean composition",
        "Full static TypeScript declarations out of the box"
      ],
      codeExample: `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const analyzed = nlp.stem('ልጆቻቸውን');
// -> 'ልጅ'`
    },
    {
      name: "@fidel-tools/lang-am",
      lang: "TypeScript",
      installCmd: "npm install @fidel-tools/lang-am",
      description: "The comprehensive Amharic language pack. Outlines specific character mapping tables, labialized vowel reduction dictionaries, abbreviation expansions, and prefix/suffix morphological rules.",
      features: [
        "500+ Amharic stopwords pre-compiled",
        "Cycle-free labialization maps",
        "Standardized Ge'ez ASCII SERA rules configuration",
        "Abbreviation exceptions for complex lexical cases"
      ],
      codeExample: `import amPack from '@fidel-tools/lang-am';

console.log(amPack.stopwords.slice(0, 5));
// -> ['እነዚህ', 'እንደ', 'ነበር', 'ግን', 'ወደ']
console.log(amPack.charMap['ሃ']); // -> 'ሀ'`
    },
    {
      name: "fidel-tools",
      lang: "Python",
      installCmd: "pip install fidel-tools",
      description: "Native Python port of the Amharic NLP pre-processing framework. Optimized for integration with machine learning libraries like PyTorch, HuggingFace, or SpaCy.",
      features: [
        "Zero C-dependencies, pure Python",
        "Complies with Python >= 3.8",
        "Compatible with Pandas, NumPy pipelines",
        "Reflects 1:1 morphological parsing matching the TS SDK"
      ],
      codeExample: `from fidel_tools import Pipeline
from fidel_tools.lang.am import AmPack

nlp = Pipeline(AmPack())
result = nlp.stem("ልጆቻቸውን")
print(result) # -> "ልጅ"`
    },
    {
      name: "@fidel-tools/validate-pack",
      lang: "TypeScript",
      installCmd: "pnpm add -g @fidel-tools/validate-pack",
      description: "Linting, validation, and auto-fixing utility for checking the schema and logical correctness of custom language rules configuration packs.",
      features: [
        "Detects circular mappings that cause infinite loops",
        "Verifies schema conformance with JSON validation",
        "Identifies overlapping stopwords and protected lexemes",
        "Includes a --fix CLI flag to automatically auto-deduplicate arrays"
      ],
      codeExample: `# Run pack validation CLI
validate-pack ./my-custom-pack.json

# Auto-fix duplicates & rule cycles
validate-pack --fix ./my-custom-pack.json`
    },
    {
      name: "@fidel-tools/db",
      lang: "TypeScript",
      installCmd: "pnpm workspace add @fidel-tools/db",
      description: "Monorepo database connector package. Houses relational schema configurations, migration scripts, and telemetry adapters using Drizzle ORM and Neon Postgres client.",
      features: [
        "Declarative relational schema for user authentication",
        "Drizzle migration runner configuration templates",
        "High-performance telemetry usage logs queries",
        "Drizzle pool client adapter configuration"
      ],
      codeExample: `import { db, schema } from '@fidel-tools/db';
import { eq } from 'drizzle-orm';

const activeUser = await db.query.users.findFirst({
  where: eq(schema.users.id, userId)
});`
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column (Sticky Title & Subtitle) */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 h-fit space-y-4">
          <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
            01 / MONOREPO PACKAGES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none font-sans">
            Modular SDKs &amp; Tooling
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-650 dark:text-zinc-400 leading-relaxed max-w-sm">
            Fidel Tools is built as a series of modular packages. Install what you need locally, validate custom configurations, or query managed cloud telemetry.
          </p>
        </div>

        {/* Right Column (List of packages with Code Boxes) */}
        <div className="lg:w-[65%] space-y-12">
          {packages.map((pkg, i) => (
            <div key={pkg.name} className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg overflow-hidden shadow-sm dark:shadow-xl flex flex-col font-sans p-6 space-y-6 transition-colors duration-300">
              
              {/* Package Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-mono">{pkg.name}</h2>
                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors">
                      {pkg.lang}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold mt-1 max-w-xl">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Package Features List */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  Key Capabilities
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-705 dark:text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Package Installation & Snippet */}
              <div className="space-y-3 pt-2">
                
                {/* Installation Command */}
                <div className="flex items-center justify-between bg-zinc-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-900 px-3 py-2 rounded text-xs font-mono text-slate-700 dark:text-zinc-350 transition-colors">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>{pkg.installCmd}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pkg.installCmd, i * 2)}
                    className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedIndex === i * 2 ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Code Block Container */}
                <div className="border border-slate-200 dark:border-zinc-900 bg-[#fbfbfb] dark:bg-black/60 rounded overflow-hidden transition-colors">
                  <div className="bg-zinc-50 dark:bg-[#0b0b0e] border-b border-slate-200 dark:border-zinc-900 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Usage Example</span>
                    <button
                      onClick={() => copyToClipboard(pkg.codeExample, i * 2 + 1)}
                      className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedIndex === i * 2 + 1 ? (
                        <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="p-4 text-xs font-mono text-zinc-800 dark:text-zinc-300 overflow-x-auto leading-relaxed">
                    <pre>
                      <code>{pkg.codeExample}</code>
                    </pre>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
