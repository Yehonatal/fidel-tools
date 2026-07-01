"use client";

import React, { useEffect, useState } from "react";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const duration = 1600; // 1.6 seconds
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setVisible(false), 200);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100000] bg-[#fafafa] dark:bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        progress >= 100 && !visible ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Self-contained CSS Styles for animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes xp-char-slide {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(180%);
          }
        }
        .animate-xp-char {
          animation: xp-char-slide 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .fade-mask {
          mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
        }
      `,
        }}
      />

      <div className="flex flex-col items-center gap-4 max-w-xs w-full px-6">
        {/* Logo Filling (Left to Right) */}
        <div className="relative select-none text-7xl font-light font-loga tracking-tight leading-none">
          {/* Background Empty Logo */}
          <span className="text-zinc-200 dark:text-zinc-900 transition-colors">ፊደል</span>
          {/* Foreground Filling Logo */}
          <div
            className="absolute top-0 left-0 h-full overflow-hidden text-zinc-900 dark:text-white transition-all duration-75 select-none"
            style={{ width: `${progress}%` }}
          >
            <span className="whitespace-nowrap font-loga text-7xl font-light tracking-tight leading-none">
              ፊደል
            </span>
          </div>
        </div>

        {/* Windows XP-Style Underline Character Track (No borders, background, or accent colors) */}
        <div className="relative w-40 h-6 overflow-hidden fade-mask">
          <div className="absolute inset-0 flex items-center justify-start">
            <span className="animate-xp-char font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-800 dark:text-zinc-200 select-none whitespace-nowrap">
              ሀ ሉ ሒ ማ ሜ ር ሶ ሿ ቁ ቢ ታ ቼ ኅ ኖ ኚ ኣ ኬ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
