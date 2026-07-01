"use client";

import { useState, useRef, useEffect } from "react";
import { Pipeline } from "@fidel-tools/core";
import amPack from "@fidel-tools/lang-am/am.json";
import {
  Check,
  Copy,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Play,
  FileCode,
  Settings,
  AlertCircle,
  Code2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

// Initialize local pipeline with imported Amharic pack
const nlp = new Pipeline(amPack as any);

interface FileItem {
  id: string;
  name: string;
  type: "ts" | "json";
  icon: React.ReactNode;
  description: string;
}

const ideFiles: FileItem[] = [
  {
    id: "pipeline",
    name: "pipeline.ts",
    type: "ts",
    icon: <Layers className="w-3.5 h-3.5 text-blue-400" />,
    description: "Complete composition pipeline analyzer.",
  },
  {
    id: "transliterator",
    name: "transliterator.ts",
    type: "ts",
    icon: <Terminal className="w-3.5 h-3.5 text-purple-400" />,
    description: "Bi-directional SERA / Ethiopic transliterators.",
  },
  {
    id: "stemmer",
    name: "stemmer.ts",
    type: "ts",
    icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
    description: "Amharic grammar stemmer / root extractor.",
  },
  {
    id: "stopwords",
    name: "stopwords.ts",
    type: "ts",
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    description: "Grammatical & structural stopwords filter.",
  },
  {
    id: "normalizer",
    name: "normalizer.ts",
    type: "ts",
    icon: <Code2 className="w-3.5 h-3.5 text-sky-400" />,
    description: "Lexical abbreviation and dialect normalizer.",
  },
];

type ConsoleTab = "terminal" | "json" | "snippet";

export default function PlaygroundClient() {
  const [activeFile, setActiveFile] = useState<string>("pipeline");
  const [inputText, setInputText] = useState(
    "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
  );
  const [transLang, setTransLang] = useState<"am" | "en">("am");
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("terminal");
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Trigger running status
  const runCode = () => {
    setIsRunning(true);
    setRunLogs((prev) => [
      ...prev,
      `[compiler] Compiling ${activeFile}...`,
      `[runtime] Initializing Fidel NLP runtime...`,
    ]);
    setTimeout(() => {
      setIsRunning(false);
      setRunLogs((prev) => [
        ...prev,
        `[runtime] Processed ${inputText.split(/\s+/).filter(Boolean).length} tokens.`,
        `[success] Compiled and finished in 0.${Math.floor(Math.random() * 8) + 1}ms.`,
      ]);
    }, 450);
  };

  useEffect(() => {
    setRunLogs([
      `[sys] Fidel NLP Engine version 0.1.6 initialized.`,
      `[sys] Ready. Select a file from the explorer to run.`,
    ]);
  }, [activeFile]);

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSnippets = (): string => {
    switch (activeFile) {
      case "pipeline":
        return `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const corpus = "${inputText.slice(0, 40)}...";

const lexed = nlp.lexAnalyze(corpus);
const clean = nlp.removeStopwords(lexed);
const stems = clean.split(' ').map(w => nlp.stem(w));
console.log(stems);`;
      case "transliterator":
        return `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const word = "${transLang === "am" ? "ወንበር" : "wenber"}";

const result = nlp.feligTransliterate(word, "${transLang}");
console.log(result);`;
      case "stemmer":
        return `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const stem = nlp.stem("ልጆቻቸውን"); // -> ልጅ
console.log(stem);`;
      case "stopwords":
        return `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const clean = nlp.removeStopwords("እነሱ ወደ ትምህርት ቤት ሄዱ");
console.log(clean);`;
      case "normalizer":
        return `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const normalized = nlp.lexAnalyze("ት/ቤት እና መስሪያ ቤት");
// -> "ትምህርት ቤት እና መስሪያ ቤት"`;
      default:
        return "";
    }
  };

  const lexedText = nlp.lexAnalyze(inputText);
  const cleanedText = nlp.removeStopwords(lexedText);
  const tokensList = inputText.split(/\s+/).filter(Boolean);

  const getJSONOutput = () => {
    return JSON.stringify(
      {
        inputFile: `${activeFile}`,
        tokensCount: tokensList.length,
        pipelineSteps: {
          step1_normalized: lexedText,
          step2_stopwords_removed: cleanedText,
          step3_stems: cleanedText
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => nlp.stem(w)),
        },
        languagePack: "amharic-v0.1.6",
        env: "sandbox-local",
      },
      null,
      2,
    );
  };

  // Split lines for line numbers
  const lines = inputText.split("\n");
  const maxLineNumbers = Math.max(lines.length + 3, 10);

  return (
    <div className="flex-1 flex flex-col min-h-0 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#030303] rounded-md overflow-hidden font-mono text-xs">
      {/* IDE Toolbar / Header */}
      <div className="h-10 border-b border-slate-200 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/40 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 font-semibold text-[10px] uppercase tracking-wider">
            <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Workspace: fidel-tools-console</span>
          </div>
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1 bg-slate-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-black font-bold text-[10px] uppercase rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>Run Program</span>
          </button>
        </div>
      </div>

      {/* Main Split Pane Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-[500px]">
        {/* Pane 1: File Explorer Sidebar */}
        <div className="w-full lg:w-48 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-900 bg-slate-50/20 dark:bg-zinc-950/10 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-900/60 flex items-center justify-between text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <span>Explorer</span>
            <span>src/</span>
          </div>
          <div className="p-1.5 flex flex-col gap-0.5">
            {ideFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFile(file.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-all cursor-pointer text-left ${
                  activeFile === file.id
                    ? "bg-slate-200/50 dark:bg-zinc-900 text-slate-900 dark:text-white font-bold"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/40"
                }`}
                title={file.description}
              >
                <div className="flex items-center gap-2 truncate">
                  {file.icon}
                  <span className="truncate">{file.name}</span>
                </div>
                {activeFile === file.id && <ChevronRight className="w-3 h-3 text-zinc-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Pane 2: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-900">
          {/* Editor Tabs bar */}
          <div className="h-8 border-b border-slate-200 dark:border-zinc-900 bg-slate-50/20 dark:bg-zinc-950/20 flex items-center select-none overflow-x-auto">
            {ideFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFile(file.id)}
                className={`h-full px-4 flex items-center gap-1.5 border-r border-slate-200 dark:border-zinc-900 transition-all cursor-pointer ${
                  activeFile === file.id
                    ? "bg-white dark:bg-[#030303] text-slate-800 dark:text-white border-t-2 border-slate-900 dark:border-white font-semibold"
                    : "text-slate-400 dark:text-zinc-500 bg-slate-100/50 dark:bg-zinc-950/30 hover:bg-slate-100 dark:hover:bg-zinc-900/20"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 flex min-h-0 bg-white dark:bg-[#030303] overflow-y-auto">
            {/* Line numbers column */}
            <div className="w-8 select-none border-r border-slate-200/60 dark:border-zinc-900/60 py-3 text-right pr-2 text-zinc-300 dark:text-zinc-700 bg-slate-50/10 dark:bg-zinc-950/5 font-mono text-[10px] leading-relaxed shrink-0">
              {Array.from({ length: maxLineNumbers }).map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            {/* Editor Input Area */}
            <div className="flex-1 flex flex-col p-3 font-sans">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-1 select-none">
                // Interactive Text Corpus Editor
              </span>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full flex-1 p-0 bg-transparent border-0 text-slate-900 dark:text-zinc-50 text-xs font-mono focus:outline-none focus:ring-0 resize-none leading-relaxed"
                placeholder="Type or paste Ge'ez / Amharic text here..."
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="h-6 border-t border-slate-200 dark:border-zinc-900 bg-slate-50/40 dark:bg-zinc-950/30 px-3 flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 select-none">
            <div className="flex items-center gap-3">
              <span>TypeScript</span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Lines: {lines.length}</span>
              <span>Words: {tokensList.length}</span>
            </div>
          </div>
        </div>

        {/* Pane 3: Visualizer & Output Console */}
        <div className="w-full lg:w-96 flex flex-col min-w-0 bg-slate-50/10 dark:bg-zinc-950/10">
          {/* Console Tab selectors */}
          <div className="h-8 border-b border-slate-200 dark:border-zinc-900 bg-slate-50/20 dark:bg-zinc-950/20 flex items-center select-none">
            <button
              onClick={() => setConsoleTab("terminal")}
              className={`h-full px-3.5 flex items-center gap-1 border-r border-slate-200 dark:border-zinc-900 font-bold transition-all cursor-pointer ${
                consoleTab === "terminal"
                  ? "bg-white dark:bg-[#030303] text-slate-900 dark:text-white border-b border-transparent"
                  : "text-slate-400 dark:text-zinc-500"
              }`}
            >
              <span>Visualizer</span>
            </button>
            <button
              onClick={() => setConsoleTab("json")}
              className={`h-full px-3.5 flex items-center gap-1 border-r border-slate-200 dark:border-zinc-900 font-bold transition-all cursor-pointer ${
                consoleTab === "json"
                  ? "bg-white dark:bg-[#030303] text-slate-900 dark:text-white border-b border-transparent"
                  : "text-slate-400 dark:text-zinc-500"
              }`}
            >
              <span>JSON Output</span>
            </button>
            <button
              onClick={() => setConsoleTab("snippet")}
              className={`h-full px-3.5 flex items-center gap-1 border-r border-slate-200 dark:border-zinc-900 font-bold transition-all cursor-pointer ${
                consoleTab === "snippet"
                  ? "bg-white dark:bg-[#030303] text-slate-900 dark:text-white border-b border-transparent"
                  : "text-slate-400 dark:text-zinc-500"
              }`}
            >
              <span>Code Snippet</span>
            </button>
          </div>

          {/* Console Content Screen */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
            <div className="flex-1">
              {consoleTab === "terminal" && (
                <div className="space-y-4">
                  {/* Visualizer content based on active file */}
                  {activeFile === "pipeline" && (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded border border-slate-200/50 dark:border-zinc-900/60 bg-slate-50 dark:bg-zinc-950/20">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                          1. Lexical Normalizer
                        </span>
                        <p className="text-xs text-slate-800 dark:text-zinc-200 font-mono leading-relaxed truncate">
                          {lexedText}
                        </p>
                      </div>
                      <div className="flex justify-center text-slate-300 dark:text-zinc-800">
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </div>
                      <div className="p-2.5 rounded border border-slate-200/50 dark:border-zinc-900/60 bg-slate-50 dark:bg-zinc-950/20">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                          2. Stopword Filter
                        </span>
                        <p className="text-xs text-slate-800 dark:text-zinc-200 font-mono leading-relaxed truncate">
                          {cleanedText}
                        </p>
                      </div>
                      <div className="flex justify-center text-slate-300 dark:text-zinc-800">
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </div>
                      <div className="p-2.5 rounded border border-blue-500/10 dark:border-sky-400/10 bg-blue-500/[0.02] dark:bg-sky-400/[0.01]">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                          3. Morphological Roots
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1 max-h-[70px] overflow-y-auto">
                          {cleanedText
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((w, i) => (
                              <span
                                key={i}
                                className="bg-slate-900 dark:bg-zinc-800 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-transparent font-bold"
                              >
                                {nlp.stem(w)}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFile === "transliterator" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Transliteration Mode:
                        </span>
                        <div className="flex bg-slate-100 dark:bg-zinc-900 p-0.5 rounded border border-slate-200/50 dark:border-zinc-800">
                          <button
                            onClick={() => setTransLang("am")}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                              transLang === "am"
                                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                                : "text-slate-500"
                            }`}
                          >
                            AM &rarr; ASCII
                          </button>
                          <button
                            onClick={() => setTransLang("en")}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                              transLang === "en"
                                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                                : "text-slate-500"
                            }`}
                          >
                            ASCII &rarr; AM
                          </button>
                        </div>
                      </div>
                      <div className="p-3 rounded border border-slate-200/60 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 min-h-[140px] max-h-[160px] overflow-y-auto leading-relaxed whitespace-pre-wrap font-mono text-xs">
                        {nlp.feligTransliterate(inputText, transLang)}
                      </div>
                    </div>
                  )}

                  {activeFile === "stemmer" && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        Stem mapping results:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {tokensList.map((token, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded border border-slate-200/40 dark:border-zinc-900/60 bg-slate-50/50 dark:bg-zinc-950/20 flex items-center justify-between font-mono text-xs"
                          >
                            <span className="text-slate-800 dark:text-zinc-300 font-semibold truncate max-w-[110px]">
                              {token}
                            </span>
                            <span className="text-slate-400 dark:text-zinc-600">&rarr;</span>
                            <span className="text-blue-600 dark:text-sky-400 font-bold truncate max-w-[110px]">
                              {nlp.stem(token)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFile === "stopwords" && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        Stopword identification:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                        {tokensList.map((token, idx) => {
                          const isStop = nlp.stopwords.includes(token);
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                isStop
                                  ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400 line-through"
                                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {token}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeFile === "normalizer" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded border border-slate-200/50 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-950/20 font-mono text-xs leading-relaxed">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                          Normalized Output
                        </span>
                        <p className="text-slate-800 dark:text-zinc-200">{lexedText}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Example expansions:
                        </span>
                        <div className="grid grid-cols-1 gap-1">
                          {[
                            { orig: "ት/ቤት", expanded: "ትምህርት ቤት" },
                            { orig: "መስሪያ ቤት", expanded: "መሥሪያ ቤት" },
                            { orig: "ም/ቤት", expanded: "ምክር ቤት" },
                          ].map((abbr, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 rounded border border-slate-200/30 dark:border-zinc-900/40 bg-slate-50/20 dark:bg-zinc-950/5 flex items-center justify-between text-xs"
                            >
                              <span className="text-zinc-800 dark:text-zinc-200">{abbr.orig}</span>
                              <span className="text-zinc-400 dark:text-zinc-600">&rarr;</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {abbr.expanded}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {consoleTab === "json" && (
                <div className="relative h-full flex flex-col">
                  <div className="flex-1 p-3 rounded bg-zinc-950 text-zinc-300 font-mono text-[10px] leading-relaxed whitespace-pre overflow-auto max-h-[220px]">
                    {getJSONOutput()}
                  </div>
                  <button
                    onClick={() => copyText(getJSONOutput())}
                    className="absolute top-2 right-2 p-1 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
                    title="Copy JSON output"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {consoleTab === "snippet" && (
                <div className="relative h-full flex flex-col">
                  <div className="flex-1 p-3 rounded bg-zinc-950 text-zinc-300 font-mono text-[10px] leading-relaxed whitespace-pre overflow-auto max-h-[220px]">
                    {getSnippets()}
                  </div>
                  <button
                    onClick={() => copyText(getSnippets())}
                    className="absolute top-2 right-2 p-1 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
                    title="Copy SDK snippet"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Run Console logs window */}
            <div className="border-t border-slate-200 dark:border-zinc-900 pt-3 mt-4">
              <span className="block text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono mb-2">
                Compiler Diagnostics
              </span>
              <div className="p-2.5 rounded bg-[#09090b] text-[10px] font-mono leading-relaxed space-y-1 min-h-[70px] max-h-[90px] overflow-y-auto">
                {runLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes("[success]")
                        ? "text-emerald-400"
                        : log.includes("[error]")
                          ? "text-red-400"
                          : log.includes("[compiler]")
                            ? "text-zinc-500"
                            : "text-zinc-400"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
