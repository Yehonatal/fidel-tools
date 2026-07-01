"use client";

import React, { useEffect, useState } from "react";
import { Gamepad, Sparkles } from "lucide-react";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<"academic" | "fun" | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  const arcadeMsgs = [
    "BOOTING FIDEL ENGINE...",
    "COLLAPSING HOMOPHONES...",
    "ZAPPING SEMANTIC NOISE...",
    "PREPARING TOKEN NINJA...",
    "READY PLAYER ONE!",
  ];

  useEffect(() => {
    const savedMode = localStorage.getItem("fidel-lab-mode") as "academic" | "fun" | null;
    setMode(savedMode || "academic");

    const duration = savedMode === "fun" ? 2200 : 1600;
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        
        if (savedMode === "fun") {
          const index = Math.min(Math.floor((nextVal / 100) * arcadeMsgs.length), arcadeMsgs.length - 1);
          setMsgIndex(index);
        }

        if (nextVal >= 100) {
          clearInterval(timer);
          setTimeout(() => setVisible(false), 200);
          return 100;
        }
        return nextVal;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  if (!visible || mode === null) return null;

  if (mode === "fun") {
    // ── RETRO ARCADE LOAD SCREEN ──────────────────────────────────────────
    return (
      <div className="fixed inset-0 z-[100000] bg-[#0c0a09] flex flex-col items-center justify-center font-mono text-amber-500 overflow-hidden">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes flash {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .animate-flash {
              animation: flash 1s step-start infinite;
            }
            @keyframes shake {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-8deg); }
              75% { transform: rotate(8deg); }
            }
            .animate-arcade-joystick {
              animation: shake 0.6s ease-in-out infinite;
            }
          `
        }} />

        <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-arcade-joystick">
              <Gamepad className="w-8 h-8 text-amber-500" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent select-none">
              FIDEL LAB
            </h2>
            <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase">
              ★ ARCADE SYSTEM ★
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-550">
              <span>INSERT COIN</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="h-6 w-full border-2 border-amber-500 p-0.5 bg-black/60 shadow-[0_0_10px_rgba(245,158,11,0.1)] flex items-center">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[10px] tracking-wider text-orange-500 font-bold uppercase min-h-[14px]">
              &gt; {arcadeMsgs[msgIndex]}
            </p>
          </div>

          <div className="text-[9px] text-amber-600 tracking-[0.2em] uppercase animate-flash pt-4">
            CREDITS: 9 / 9 FREE PLAY
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD ACADEMIC CONSOLE LOAD SCREEN (WITH GRADUATION CAP + DEV TEXT) ──
  return (
    <div
      className={`fixed inset-0 z-[100000] bg-[#fafafa] dark:bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-500 ease-out text-zinc-900 dark:text-white ${
        progress >= 100 && !visible ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes xp-char-slide {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(180%); }
            }
            .animate-xp-char {
              animation: xp-char-slide 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .fade-mask {
              mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
              -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
            }
            @keyframes bounceCap {
              0%, 100% { transform: translateY(0) rotate(5deg); }
              50% { transform: translateY(-4px) rotate(-5deg); }
            }
            .animate-cap {
              animation: bounceCap 1.2s ease-in-out infinite;
            }
          `,
        }}
      />

      <div className="flex flex-col items-center gap-4 max-w-xs w-full px-6 relative pt-10">
        {/* Logo text with left-to-right progress filling */}
        <div className="relative select-none text-7xl font-light font-loga tracking-tight leading-none">
          {/* Custom SVG Graduation Cap Hat sitting on top of the first letter ፊ */}
          <div className="absolute -top-[32px] -left-[2px] select-none animate-cap z-20 origin-bottom">
            <svg 
              className="w-10 h-10 text-zinc-900 dark:text-white transition-colors duration-300"
              viewBox="0 0 32 32" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M16 6L28 11L16 16L4 11Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M8 13v4.5c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5V13" />
              <path d="M16 11l8.5 3.5v5.5" />
              <circle cx="24.5" cy="20.5" r="1.2" fill="currentColor" />
            </svg>
          </div>

          {/* dev text sitting on top of the next two letters ደል */}
          <span className="absolute -top-[14px] left-[46px] text-xs font-mono font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
            dev
          </span>

          <span className="text-zinc-200 dark:text-zinc-900 transition-colors">ፊደል</span>
          <div
            className="absolute top-0 left-0 h-full overflow-hidden text-zinc-900 dark:text-white transition-all duration-75 select-none"
            style={{ width: `${progress}%` }}
          >
            <span className="whitespace-nowrap font-loga text-7xl font-light tracking-tight leading-none">
              ፊደል
            </span>
          </div>
        </div>

        {/* Sliding characters */}
        <div className="relative w-40 h-6 overflow-hidden fade-mask">
          <div className="absolute inset-0 flex items-center justify-start">
            <span className="animate-xp-char font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-650 dark:text-zinc-400 select-none whitespace-nowrap">
              ሀ ሉ ሒ ማ ሜ ር ሶ ሿ ቁ ቢ ታ ቼ ኅ ኖ ኚ ኣ ኬ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
