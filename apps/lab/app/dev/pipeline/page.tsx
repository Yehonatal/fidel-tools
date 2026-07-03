"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLabMode } from "@/components/mode-context";
import CodeSnippet from "@/components/CodeSnippet";
import PipelineVisualizer from "@/components/PipelineVisualizer";
import {
    Layers,
    Play,
    AlertTriangle,
    RefreshCw,
    GripVertical,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    ArrowDown,
} from "lucide-react";

interface Round {
    id: number;
    title: string;
    inputText: string;
    targetText: string;
    desc: string;
    minSteps: number;
}

const CONVEYOR_ROUNDS: Round[] = [
    {
        id: 1,
        title: "Round 1: Spell Normalization",
        inputText: "ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ሄደ።",
        targetText: "ሃኪሙ ሃይሉ ትላንትና ሰላምታ ሰጥቶን ሄደ።",
        desc: "Convert all homophone variations to their canonical baseline forms.",
        minSteps: 1,
    },
    {
        id: 2,
        title: "Round 2: Cleansing Abbreviations",
        inputText: "ሐኪም ኀይሉ በልቶ ወደ ት/ቤት ሄደ።",
        targetText: "ሃኪም ሃይሉ በልቶ ወደ ትምህርት ቤት ሄደ",
        desc: "Normalize spelling variants and expand abbreviations, removing punctuation.",
        minSteps: 2,
    },
    {
        id: 3,
        title: "Round 3: Stopword Extract",
        inputText: "ት/ቤት እና መስሪያ ቤት",
        targetText: "ትምህርት ቤት መስሪያ ቤት",
        desc: "Expand the elided contraction and extract signal words by removing grammar stopwords.",
        minSteps: 3,
    },
    {
        id: 4,
        title: "Round 4: English Cipher",
        inputText: "ሐኪሙ ት/ቤት ሄደ።",
        targetText: "hakim temhert bEt hEd",
        desc: "Normalize, expand contractions, remove stopwords, stem and transcribe into Latin SERA.",
        minSteps: 5,
    },
];

const STAGE_LABELS: Record<
    string,
    { title: string; desc: string; color: string }
> = {
    normalize: {
        title: "Normalize Shape",
        desc: "Maps character homophones",
        color: "bg-cyan-100 dark:bg-cyan-900/60",
    },
    lexAnalyze: {
        title: "Expand Abbreviations",
        desc: "Replaces contractions",
        color: "bg-yellow-100 dark:bg-yellow-900/60",
    },
    removeStopwords: {
        title: "Sweep Stopwords",
        desc: "Filters grammar noise",
        color: "bg-red-100 dark:bg-red-950/60",
    },
    stem: {
        title: "Stem Morpheme",
        desc: "Strips prefixes & suffixes",
        color: "bg-purple-100 dark:bg-purple-900/60",
    },
    transliterate: {
        title: "SERA Transliterate",
        desc: "Transcribes Ge'ez to ASCII",
        color: "bg-emerald-100 dark:bg-emerald-950/60",
    },
};

const PRESETS = [
    {
        label: "Government Bill (Mixed)",
        text: "የገንዘብ ሚኒስቴር ምክር ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
    },
    {
        label: "Linguistic Homophones",
        text: "ሐኪሙ ኀይሉ ትላንትና ሠላምታ ሰጥቶን ሄደ።",
    },
    {
        label: "Contractions & Abbreviations",
        text: "ሐኪም ኀይሉ በልቶ ወደ ት/ቤት ሄደ። መስሪያ ቤት እና ት/ቤት",
    },
];

export default function PipelinePage() {
    const { mode } = useLabMode();
    const [text, setText] = useState(
        "የገንዘብ ሚኒስቴር ምክр ቤተ ከሃያ ዓመታት በፊት ያወጣውን የ ተጨማሪ እሴት ታክስ ቫት አዋጅን የሚተካ ረቂቅ ተዘጋጀ። ት/ቤት እና መስሪያ ቤት",
    );
    const [stages, setStages] = useState<string[]>([
        "normalize",
        "lexAnalyze",
        "removeStopwords",
        "stem",
        "transliterate",
    ]);
    const [loading, setLoading] = useState(false);
    const [trace, setTrace] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    const handlePresetSelect = (presetText: string) => {
        setText(presetText);
    };

    const runPipeline = async (inputText: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText, steps: stages }),
            });
            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setTrace(data.trace);
            }
        } catch (err: any) {
            setError(err.message || "Failed to contact pipeline API");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mode === "academic") {
            runPipeline(text);
        }
    }, [mode, text]);

    // ── ACADEMIC MODE: CONSOLE RUNNER ──────────────────────────────────────
    const codeSnippet = `import { Pipeline } from '@fidel-tools/core';
import amPack from '@fidel-tools/lang-am';

const nlp = new Pipeline(amPack);
const text = "${text.replace(/"/g, '\\"').slice(0, 50)}...";
const result = nlp.run(text, {
  stages: ["normalize", "tokenize", "stopwords", "stem"]
});`;

    return (
        <div className="animate-in fade-in duration-300">
            {/* Title block */}
            <div className="sticky top-0 z-20 px-6 md:px-8 pt-6 md:pt-8 pb-5 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-200 space-y-2 mb-6 md:mb-8">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                        Multi-Stage Execution Pipeline
                    </h2>
                </div>
                <p className="text-xs font-medium text-zinc-555 dark:text-zinc-400 max-w-3xl leading-relaxed font-sans">
                    Trace custom sequences of normalization, contractions
                    expansion, stopwords removal, stemming, and transliteration
                    in a single request.
                </p>
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-8">
                {/* Preset Selector */}
                <div className="premium-card p-6 space-y-4">
                    <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">
                        Select Sample Presets
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {PRESETS.map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePresetSelect(p.text)}
                                className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-medium hover:border-blue-500 hover:bg-blue-500/5 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs & Snippets */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="premium-card p-6 space-y-4">
                            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                                API Endpoint Specifications
                            </h3>
                            <div className="space-y-3 font-sans text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400">
                                        POST
                                    </span>
                                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                                        /api/v1/nlp/pipeline
                                    </span>
                                </div>
                                <p className="text-zinc-500 leading-relaxed font-medium">
                                    Sequences steps internally inside Hono.
                                    Returns sequential trace map alongside the
                                    final compiled output.
                                </p>
                            </div>
                        </div>

                        <CodeSnippet
                            title="Node.js Pipeline Integration"
                            code={codeSnippet}
                        />
                    </div>

                    {/* Core Interactive Visualizer */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="premium-card flex flex-col overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between shrink-0 font-mono text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">
                                <span>Interactive Pipeline Tracer</span>
                                {loading && (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold font-mono text-zinc-405 uppercase tracking-wider">
                                        Input Corpus
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={text}
                                        onChange={(e) =>
                                            setText(e.target.value)
                                        }
                                        className="w-full p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:border-blue-500 text-zinc-850 dark:text-white"
                                        placeholder="Enter Amharic text to route..."
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => runPipeline(text)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-white" />
                                        <span>Run Pipeline</span>
                                    </button>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-xs font-semibold">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <PipelineVisualizer
                                    inputText={text}
                                    trace={trace}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
