"use client";

import React, { useEffect, useState } from "react";

interface FidelLoaderProps {
  layout?: "page" | "component";
  mode: "academic" | "fun";
  progress?: number;
  message?: string;
}

export default function FidelLoader({
  layout = "component",
  mode,
  progress,
  message,
}: FidelLoaderProps) {
  // Handle infinite progress if not provided
  const [pulseProgress, setPulseProgress] = useState(0);

  useEffect(() => {
    if (progress !== undefined) return;
    // Animate a scanning progress infinitely
    let dir = 1;
    const interval = setInterval(() => {
      setPulseProgress((prev) => {
        let next = prev + dir * 1.5;
        if (next >= 100) {
          next = 100;
          dir = -1;
        } else if (next <= 0) {
          next = 0;
          dir = 1;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [progress]);

  const activeProgress = progress !== undefined ? progress : pulseProgress;

  // Render CSS animations once
  const css = `
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
    @keyframes bounceCrown {
      0%, 100% { transform: translateY(0) rotate(3deg); }
      50% { transform: translateY(-4px) rotate(-3deg); }
    }
    .animate-crown {
      animation: bounceCrown 1.2s ease-in-out infinite;
    }
  `;

  // Layout styles
  const outerClass = layout === "page"
    ? "fixed inset-0 z-[200000] flex flex-col items-center justify-center select-none overflow-hidden bg-[#fafafa] dark:bg-[#030303]"
    : `w-full min-h-[30vh] py-6 flex flex-col items-center justify-center select-none overflow-hidden relative ${
        mode === "fun" ? "text-amber-600 dark:text-amber-500" : "text-zinc-950 dark:text-white"
      }`;

  const isAcademic = mode === "academic";

  return (
    <div className={outerClass}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      
      {/* Background Glow (only for fun mode) */}
      {!isAcademic && (
        <div className="absolute w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
      )}

      <div className="flex flex-col items-center gap-5 text-center max-w-xs w-full px-6 relative pt-10">
        
        {/* Animated ፊደል Logo Container */}
        <div className="relative text-7xl font-light font-loga tracking-tight leading-none select-none">
          
          {isAcademic ? (
            <>
              {/* Academic: Graduation Cap */}
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

              {/* Academic: dev label */}
              <span className="absolute -top-[14px] left-[46px] text-xs font-mono font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                dev
              </span>

              {/* Academic: Base Logo */}
              <span className="text-zinc-200 dark:text-zinc-905 transition-colors">ፊደል</span>

              {/* Academic: Filled Logo */}
              <div
                className="absolute top-0 left-0 h-full overflow-hidden text-zinc-900 dark:text-white transition-all duration-75 select-none"
                style={{ width: `${activeProgress}%` }}
              >
                <span className="whitespace-nowrap font-loga text-7xl font-light tracking-tight leading-none">
                  ፊደል
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Fun/Puzzle: Crown */}
              <div className="absolute -top-[30px] -left-[2px] select-none animate-crown z-20 origin-bottom text-amber-500">
                <svg 
                  className="w-10 h-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.2" />
                  <path d="M3 20h18" />
                  <path d="M5 16v4" />
                  <path d="M19 16v4" />
                </svg>
              </div>

              {/* Fun/Puzzle: puzzle label */}
              <span className="absolute -top-[14px] left-[46px] text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-500 select-none uppercase drop-shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                puzzle
              </span>

              {/* Fun/Puzzle: Base Logo */}
              <span className="text-zinc-200 dark:text-zinc-900 transition-colors">ፊደል</span>

              {/* Fun/Puzzle: Filled Logo */}
              <div
                className="absolute top-0 left-0 h-full overflow-hidden transition-all duration-75 select-none"
                style={{ width: `${activeProgress}%` }}
              >
                <span className="whitespace-nowrap font-loga text-7xl font-light tracking-tight leading-none bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  ፊደል
                </span>
              </div>
            </>
          )}

        </div>

        {/* Sliding characters trailer */}
        <div className="relative w-40 h-6 overflow-hidden fade-mask">
          <div className="absolute inset-0 flex items-center justify-start">
            <span className={`animate-xp-char font-mono text-[10px] font-bold tracking-[0.2em] whitespace-nowrap select-none ${
              isAcademic
                ? "text-zinc-650 dark:text-zinc-400"
                : "text-amber-650 dark:text-amber-500/70"
            }`}>
              ሀ ሉ ሒ ማ ሜ ር ሶ ሿ ቁ ቢ ታ ቼ ኅ ኖ ኚ ኣ ኬ
            </span>
          </div>
        </div>



      </div>
    </div>
  );
}
