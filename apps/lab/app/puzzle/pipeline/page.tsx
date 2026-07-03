"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function PipelinePuzzlePage() {
    const [loading, setLoading] = useState(false);

    // Arcade Game States
    const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
    const [conveyorBelt, setConveyorBelt] = useState<string[]>([]);
    const [mutatedOutputs, setMutatedOutputs] = useState<
        Record<string, string>
    >({});
    const [score, setScore] = useState(0);
    const [gameWin, setGameWin] = useState(false);
    const [hasTested, setHasTested] = useState(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const currentRound = CONVEYOR_ROUNDS[currentRoundIdx];

    // Live mutations update based on conveyor belt state
    const updateConveyorMutations = async (belt: string[]) => {
        if (belt.length === 0) {
            setMutatedOutputs({});
            setGameWin(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("/api/pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: currentRound.inputText,
                    steps: belt,
                }),
            });
            const data = await response.json();
            setMutatedOutputs(data.trace || {});

            const finalResult = data.final || "";
            const isMatch =
                finalResult.trim() === currentRound.targetText.trim();

            if (isMatch) {
                const stepDiff = belt.length - currentRound.minSteps;
                const calcScore = Math.max(0, 100 - stepDiff * 15);
                setScore(calcScore);
                setGameWin(true);
            } else {
                setScore(0);
                setGameWin(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Debounced conveyor update
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            updateConveyorMutations(conveyorBelt);
        }, 300);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [conveyorBelt, currentRoundIdx]);

    const handleStageClick = (stage: string) => {
        if (conveyorBelt.includes(stage)) {
            setConveyorBelt((prev) => prev.filter((s) => s !== stage));
        } else {
            setConveyorBelt((prev) => [...prev, stage]);
        }
        setHasTested(true);
    };

    const handleResetConveyor = () => {
        setConveyorBelt([]);
        setMutatedOutputs({});
        setScore(0);
        setGameWin(false);
        setHasTested(false);
    };

    const handleNextRound = () => {
        if (currentRoundIdx < CONVEYOR_ROUNDS.length - 1) {
            setCurrentRoundIdx((prev) => prev + 1);
            handleResetConveyor();
        }
    };

    const handleDragStart = (stage: string) => {
        setDraggedItem(stage);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropOnConveyor = () => {
        if (draggedItem && !conveyorBelt.includes(draggedItem)) {
            setConveyorBelt((prev) => [...prev, draggedItem]);
            setHasTested(true);
        }
        setDraggedItem(null);
    };

    return (
        <div className="font-mono min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#fdfcfa] bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] text-zinc-900 dark:bg-[#121110] dark:bg-[radial-gradient(#292524_1.5px,transparent_1.5px)] dark:text-amber-100 animate-in fade-in duration-300">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
          .cartoon-border {
            border: 3.5px solid #000;
            box-shadow: 6px 6px 0px 0px #000;
          }
          .dark .cartoon-border {
            border: 3.5px solid #f59e0b;
            box-shadow: 6px 6px 0px 0px #f59e0b;
          }
          .roller-conveyor {
            background-image: radial-gradient(circle, #000 22%, transparent 22%);
            background-size: 16px 16px;
            height: 14px;
          }
          .dark .roller-conveyor {
            background-image: radial-gradient(circle, #f59e0b 22%, transparent 22%);
          }
          .steam-cloud {
            animation: floatUp 1.8s ease-out infinite;
            opacity: 0;
            position: absolute;
          }
          @keyframes floatUp {
            0% { transform: translateY(0px) scale(0.6); opacity: 0; }
            30% { opacity: 0.8; }
            100% { transform: translateY(-70px) scale(1.3); opacity: 0; }
          }
        `,
                }}
            />

            {/* Header Block */}
            <div className="w-full max-w-6xl pb-5 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 space-y-2 mb-8 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                                    ASSEMBLY LINE
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
                                    Level 2
                                </span>
                            </div>
                            <p className="text-xs text-zinc-650 dark:text-zinc-400 font-sans mt-0.5">
                                Drop NLP preprocessing crates onto the conveyor
                                belt in the logical sequence to yield clean,
                                indexed Ge&apos;ez!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 12-Column Layout */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                {/* Left Column: Interactive Factory Area (Col span 8) */}
                <div className="lg:col-span-8 space-y-6 w-full">
                    {/* Objective Box */}
                    <div className="cartoon-border rounded-xl bg-amber-50 dark:bg-zinc-900/30 p-5 space-y-2 dark:border-amber-500">
                        <span className="text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest font-mono block">
                            {currentRound.title}
                        </span>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                                INPUT CONTEXT
                            </span>
                            <p className="text-lg md:text-xl font-black text-zinc-950 dark:text-white leading-relaxed font-sans select-all">
                                {currentRound.inputText}
                            </p>
                        </div>
                        <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                                TARGET OUTPUT RESULT
                            </span>
                            <p className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono bg-white dark:bg-black/30 px-3 py-1.5 rounded border border-black/10 dark:border-amber-500/10 truncate">
                                {currentRound.targetText}
                            </p>
                        </div>
                        <p className="text-[10px] font-semibold text-zinc-650 dark:text-zinc-400 italic pt-1">
                            &quot;{currentRound.desc}&quot; (Min steps:{" "}
                            {currentRound.minSteps})
                        </p>
                    </div>

                    {/* Conveyor belt workspace */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        {/* Assembly Blocks Pool (Span 4) */}
                        <div className="md:col-span-5 cartoon-border p-5 rounded-2xl bg-white dark:bg-[#1a1c1d] dark:border-amber-500 space-y-4">
                            <span className="text-[10px] font-black uppercase text-zinc-500 block">
                                AVAILABLE STAGE CRATES
                            </span>
                            <div className="flex flex-col gap-3.5">
                                {Object.entries(STAGE_LABELS).map(
                                    ([key, label]) => {
                                        const active =
                                            conveyorBelt.includes(key);
                                        return (
                                            <div
                                                key={key}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(key)
                                                }
                                                onClick={() =>
                                                    handleStageClick(key)
                                                }
                                                className={`p-3.5 border-2 border-black rounded-xl cursor-grab active:cursor-grabbing transition-all select-none hover:translate-x-0.5 active:translate-y-0.5 dark:border-amber-500 ${
                                                    active
                                                        ? "bg-zinc-200 border-dashed dark:bg-zinc-800 opacity-50"
                                                        : `${label.color} shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f59e0b]`
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="w-3.5 h-3.5 text-black/40 dark:text-white/40 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-900 dark:text-white">
                                                            {label.title}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">
                                                            {label.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>

                        {/* Drag Belt Target (Span 7) */}
                        <div className="md:col-span-7 flex flex-col justify-between cartoon-border p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 dark:border-amber-500 relative">
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDropOnConveyor}
                                className={`flex-grow border-2 border-dashed border-black/10 dark:border-amber-500/10 rounded-xl p-4 flex flex-col justify-center min-h-[300px] ${
                                    draggedItem
                                        ? "bg-amber-100/10 border-amber-400 dark:border-amber-500/40"
                                        : ""
                                }`}
                            >
                                {conveyorBelt.length === 0 ? (
                                    <div className="text-center p-6 text-zinc-400 text-xs font-bold space-y-2 select-none">
                                        <p className="text-3xl">🏭</p>
                                        <p>DRAG AND DROP OR CLICK STAGES</p>
                                        <p className="text-[10px] font-normal text-zinc-500 uppercase">
                                            TO CONSTRUCT Preprocessing ASSEMBLY
                                            CHAIN
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3.5 w-full">
                                        {conveyorBelt.map((stageKey, i) => {
                                            const label =
                                                STAGE_LABELS[stageKey];
                                            const intermediateOut =
                                                mutatedOutputs[stageKey] ||
                                                "...";
                                            return (
                                                <div
                                                    key={stageKey}
                                                    className="animate-in slide-in-from-left-2 duration-200"
                                                >
                                                    <div className="flex gap-3 items-center">
                                                        {/* Block index badge */}
                                                        <span className="w-5 h-5 rounded-full border-2 border-black dark:border-amber-500 bg-white dark:bg-black text-[10px] font-black flex items-center justify-center shrink-0">
                                                            {i + 1}
                                                        </span>

                                                        {/* Stage Label */}
                                                        <div
                                                            className={`p-2 border-2 border-black rounded-lg ${label.color} shrink-0 w-32 dark:border-amber-500`}
                                                        >
                                                            <p className="text-[10px] font-black truncate">
                                                                {label.title}
                                                            </p>
                                                            <p className="text-[8px] font-bold text-zinc-500 dark:text-zinc-450 uppercase truncate leading-none mt-0.5">
                                                                {label.desc}
                                                            </p>
                                                        </div>

                                                        {/* Mutated state */}
                                                        <div className="flex-grow min-w-0">
                                                            <span className="text-[8px] font-black uppercase text-zinc-500 block mb-0.5">
                                                                INTERMEDIATE
                                                                STATE
                                                            </span>
                                                            <p className="p-2 bg-white dark:bg-black border-2 border-black text-[10px] font-mono font-bold rounded truncate select-all dark:border-amber-500">
                                                                {
                                                                    intermediateOut
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Connecting arrow */}
                                                    {i <
                                                        conveyorBelt.length -
                                                            1 && (
                                                        <div className="flex justify-center my-1 select-none">
                                                            <ArrowDown className="w-4 h-4 text-black dark:text-amber-500 animate-bounce" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Physical roller wheels */}
                            <div className="pt-4">
                                <div className="roller-conveyor rounded-full border-2 border-black dark:border-amber-500 bg-white dark:bg-black" />
                            </div>

                            {/* Reset button */}
                            <div className="flex gap-4 justify-end pt-3">
                                <button
                                    onClick={handleResetConveyor}
                                    className="px-4 py-2 border-2 border-black bg-white hover:bg-zinc-150 text-black text-xs font-black rounded-lg active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer dark:bg-zinc-900 dark:text-white dark:border-amber-500"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>RESET</span>
                                </button>
                            </div>

                            {/* Steam success puff */}
                            {gameWin && !loading && (
                                <div className="absolute bottom-8 left-8 flex flex-col items-center select-none z-20 pointer-events-none">
                                    <span className="steam-cloud text-3xl">
                                        💨
                                    </span>
                                    <span
                                        className="steam-cloud text-2xl"
                                        style={{ animationDelay: "0.2s" }}
                                    >
                                        💨
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Study Guide & Performance HUD (Col span 4) */}
                <div className="lg:col-span-4 space-y-6 w-full font-mono">
                    {/* Real-time stats card */}
                    <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-amber-500 tracking-wider">
                            🎮 PIPELINE MONITOR
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                                <p className="text-2xl font-black text-black dark:text-white leading-none">
                                    {score}
                                </p>
                                <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase mt-1 leading-none">
                                    EFFICIENCY
                                </p>
                            </div>
                            <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg">
                                <p className="text-2xl font-black text-amber-500 leading-none">
                                    ⚙️ {currentRoundIdx + 1}
                                </p>
                                <p className="text-[9px] font-black text-zinc-555 dark:text-zinc-500 uppercase mt-1 leading-none">
                                    ROUND
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Educational Concept Card */}
                    <div className="cartoon-border rounded-xl bg-white dark:bg-[#1c1a19] dark:border-amber-500 p-6 space-y-4">
                        <div className="border-b-2 border-dashed border-zinc-205 dark:border-zinc-800 pb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                📖 NLP LAB REPORT
                            </span>
                            <h4 className="text-sm font-black text-black dark:text-white uppercase mt-1">
                                Sequential Preprocessing Chains
                            </h4>
                        </div>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
                            Raw text processing follows a strict order:
                            normalizing characters, tokenizing boundaries,
                            stripping grammatical stopwords, and stemming terms.
                            Getting the order wrong ruins downstream indexing.
                        </p>
                        <div className="border-t border-dashed border-zinc-205 dark:border-zinc-800 pt-3 space-y-2">
                            <h5 className="text-[10px] font-black uppercase text-black dark:text-amber-400">
                                HOW TO PLAY
                            </h5>
                            <ul className="list-disc pl-4 text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                                <li>
                                    Drag the NLP stage crates onto the conveyor
                                    belt in the logical execution order.
                                </li>
                                <li>
                                    Click stage crates or drag them onto the
                                    conveyor belt to sequence pipeline
                                    transformations.
                                </li>
                                <li>
                                    Compare your outputs directly with the gold
                                    target to secure a perfect compile
                                    efficiency!
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score HUD / Victory banner */}
            {hasTested && (
                <div className="w-full max-w-6xl mt-6">
                    <div className="cartoon-border rounded-xl p-5 bg-white dark:bg-[#1a1c1d] dark:border-amber-500 flex items-center justify-between shadow-inner">
                        <div className="space-y-1">
                            <span className="text-zinc-555 text-[9px] font-black uppercase tracking-wider block">
                                CONVEYOR EFFICIENCY
                            </span>
                            {loading ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
                                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                                    <span>COMPILING CONVEYOR...</span>
                                </div>
                            ) : (
                                <span className="text-2xl font-black text-black dark:text-amber-500 tracking-wider">
                                    {score} / 100 PTS
                                </span>
                            )}
                        </div>

                        {gameWin && !loading ? (
                            <div className="flex flex-col gap-2 items-end">
                                <div className="flex items-center gap-2 border-[3.5px] border-black bg-green-200 dark:border-amber-500 dark:bg-amber-500/10 p-2.5 rounded-xl text-green-700 dark:text-amber-400 text-xs font-black tracking-wider uppercase animate-bounce shadow-[3px_3px_0px_0px_#000]">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>COMPILE PERFECT!</span>
                                </div>
                                {currentRoundIdx <
                                    CONVEYOR_ROUNDS.length - 1 && (
                                    <button
                                        onClick={handleNextRound}
                                        className="px-4 py-2 bg-amber-400 text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-[10px] font-black uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-[0px_0px_0px_0px_#000] flex items-center gap-1 cursor-pointer dark:border-amber-550"
                                    >
                                        <span>NEXT ROUND</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            !loading && (
                                <div className="flex items-center gap-2 border-2 border-black bg-red-100 p-2.5 rounded-lg text-red-750 text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_#000]">
                                    <XCircle className="w-4 h-4" />
                                    <span>MUTATION MISMATCH</span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
