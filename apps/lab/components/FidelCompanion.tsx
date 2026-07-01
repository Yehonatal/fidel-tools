"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, CornerDownLeft } from "lucide-react";

interface ChatMessage {
    sender: "user" | "fidel";
    text: string;
}

const GLOBAL_QUESTIONS = [
    {
        q: "How are we using the API?",
        a: "The lab uses local Next.js API routes as a server-side proxy, so browser requests stay on the app origin while the backend handles authenticated requests internally.",
    },
    {
        q: "How is the infrastructure secured?",
        a: "Access is restricted through server-side routing and authentication. Sensitive backend details are kept out of the browser and are not shown in the companion UI.",
    },
];

const PAGE_CONTEXTS: Record<
    string,
    {
        name: string;
        greeting: string;
        question: string;
        answer: string;
    }
> = {
    "/": {
        name: "Overview Dashboard",
        greeting:
            "ሰላም! Welcome to the Fidel NLP Lab overview dashboard. How can I help you get started?",
        question: "How do I choose between Academic and Arcade modes?",
        answer: "You can toggle the workspace mode at any time using the console/joystick icon in the top header, or select it on this landing dashboard card!",
    },
    "/dev/languages": {
        name: "Supported Languages Tool",
        greeting:
            "ሰላም! You are on the languages page. Ready to choose your linguist warrior class?",
        question: "What language parameters are returned by the API?",
        answer: "The API returns supported locales and the language metadata needed by the lab tools.",
    },
    "/dev/pipeline": {
        name: "Execution Pipeline Tool",
        greeting:
            "ሰላም! I see you are viewing the multi-stage NLP pipeline playground.",
        question: "What stages are running in this pipeline?",
        answer: "The pipeline runs a sequence of normalization, lexical analysis, stopword removal, stemming, and transliteration stages.",
    },
    "/dev/normalize": {
        name: "Normalization Tool",
        greeting:
            "ሰላም! Inspecting spelling variants? Let's check some homophone groups.",
        question: "How does the normalizer handle Amharic homophones?",
        answer: "It maps spelling variants into a canonical form so equivalent words normalize consistently.",
    },
    "/dev/tokenize": {
        name: "Tokenizer Tool",
        greeting:
            "ሰላም! Need to split sentences and words? You are on the Tokenizer page.",
        question: "How does tokenization handle boundary characters?",
        answer: "It splits text into sentence and word units using language-aware punctuation and spacing rules.",
    },
    "/dev/remove-stopwords": {
        name: "Stopwords Removal Tool",
        greeting:
            "ሰላም! Clearing grammatical noise? You are in the Stopword Sweep zone.",
        question: "What are stopwords in Amharic?",
        answer: "They are common function words that are filtered out so indexing and search can focus on the more meaningful terms.",
    },
    "/dev/stem": {
        name: "Morphological Stemmer Tool",
        greeting:
            "ሰላም! You are in the Stem Sprint arena. Let's find some word bases.",
        question: "How does light stemming work?",
        answer: "It reduces inflected forms to a lighter root form for search and analysis.",
    },
    "/dev/transliterate": {
        name: "Transliteration Tool",
        greeting:
            "ሰላም! Converting Ge'ez Unicode to ASCII SERA? Ready for the typing rush?",
        question: "What keyboard mapping scheme is used?",
        answer: "The lab uses a phonetic transliteration scheme to convert between Ge'ez script and ASCII representations.",
    },
    "/dev/lexical-analyze": {
        name: "Lexical Expansion Tool",
        greeting: "ሰላም! Expanding abbreviations? Let's bust some contractions.",
        question: "How does abbreviation expansion work?",
        answer: "It expands shortened forms into their fuller dictionary equivalents before later processing steps.",
    },
    "/dev/search": {
        name: "Full-Text Search Engine",
        greeting:
            "ሰላም! Prepared for the index card-showdown? Let's query the corpus.",
        question: "How does search rank results?",
        answer: "It builds an inverted index and scores matches using relevance ranking over the indexed corpus.",
    },
};

export default function FidelCompanion() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            sender: "fidel",
            text: (PAGE_CONTEXTS[pathname] || PAGE_CONTEXTS["/"]).greeting,
        },
    ]);
    const [typingText, setTypingText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Get context configuration for the current active page path
    const currentCtx = PAGE_CONTEXTS[pathname] || PAGE_CONTEXTS["/"];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingText]);

    const handleAskQuestion = (qText: string, aText: string) => {
        if (isTyping) return;

        setMessages((prev) => [...prev, { sender: "user", text: qText }]);
        setIsTyping(true);
        setTypingText("");

        let charIndex = 0;
        const interval = setInterval(() => {
            setTypingText((prev) => prev + aText[charIndex]);
            charIndex++;
            if (charIndex >= aText.length) {
                clearInterval(interval);
                setMessages((prev) => [
                    ...prev,
                    { sender: "fidel", text: aText },
                ]);
                setTypingText("");
                setIsTyping(false);
            }
        }, 12);
    };

    // Compile active list of questions (Page Context Question + Global Questions)
    const activeQuestions = [
        {
            q: currentCtx.question,
            a: currentCtx.answer,
            label: "Page-Specific Context",
        },
        ...GLOBAL_QUESTIONS.map((g) => ({ ...g, label: "General API" })),
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[999] font-sans">
            {/* Floating Toggle Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 dark:bg-amber-500 text-white dark:text-black shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative group"
                >
                    <span className="font-loga text-xl font-bold select-none group-hover:rotate-12 transition-transform">
                        ፊ
                    </span>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 dark:bg-amber-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500 dark:bg-amber-400"></span>
                    </span>
                </button>
            )}

            {/* Companion Chat Window */}
            {isOpen && (
                <div className="w-80 md:w-96 h-[480px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 text-zinc-800 dark:text-zinc-200">
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-250/60 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-amber-500/10 border border-blue-500/20 dark:border-amber-500/20 flex items-center justify-center">
                                <span className="font-loga text-base font-bold text-blue-600 dark:text-amber-500 select-none">
                                    ፊ
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                                    Fidel Companion
                                </h4>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">
                                    Context: {currentCtx.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Logs */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl px-3 py-2.5 leading-relaxed font-sans ${
                                        msg.sender === "user"
                                            ? "bg-blue-600 text-white dark:bg-amber-500 dark:text-black font-semibold rounded-tr-none shadow-sm"
                                            : "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/40 font-medium"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typewriter message indicator */}
                        {isTyping && typingText && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-xl px-3 py-2.5 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/40 font-medium leading-relaxed font-sans">
                                    {typingText}
                                    <span className="inline-block w-1.5 h-3 ml-0.5 bg-blue-500 dark:bg-amber-500 animate-pulse" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Preloaded Action Questions */}
                    <div className="p-4 border-t border-zinc-250/60 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/20 space-y-2">
                        <span className="text-[9px] font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                            SUGGESTED QUESTIONS
                        </span>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto p-0.5">
                            {activeQuestions.map((item) => {
                                const alreadyAsked = messages.some(
                                    (m) => m.text === item.q,
                                );
                                return (
                                    <button
                                        key={item.q}
                                        disabled={isTyping || alreadyAsked}
                                        onClick={() =>
                                            handleAskQuestion(item.q, item.a)
                                        }
                                        className={`w-full py-1.5 px-2.5 border text-left text-[10px] font-bold rounded-lg transition-all flex items-center justify-between gap-2 font-mono ${
                                            alreadyAsked
                                                ? "border-zinc-200/55 dark:border-zinc-850/40 bg-zinc-100/30 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                                                : "border-blue-500/25 dark:border-amber-500/25 bg-white dark:bg-zinc-950 text-blue-600 dark:text-amber-500 hover:bg-blue-50/5 dark:hover:bg-amber-500/5 cursor-pointer"
                                        }`}
                                    >
                                        <div className="truncate flex items-center gap-1.5">
                                            <span className="text-[8px] px-1 py-0.2 rounded border border-blue-500/10 bg-blue-500/5 text-blue-500 dark:border-amber-500/25 dark:bg-amber-500/5 dark:text-amber-500 shrink-0 font-sans uppercase">
                                                {item.label}
                                            </span>
                                            <span className="truncate">
                                                {item.q}
                                            </span>
                                        </div>
                                        <CornerDownLeft className="w-3 h-3 shrink-0 opacity-60" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
