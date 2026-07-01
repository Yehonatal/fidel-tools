"use client";

import { useEffect, useState } from "react";

export function CountdownBanner() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 23,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Target date is set to 23 days from the initial local time (June 16, 2026, 01:47:27)
  // which is July 9, 2026, at 01:47:27.
  const targetDate = new Date("2026-07-09T01:47:27+03:00").getTime();

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    // Render placeholder with exact user request days during SSR to prevent layout shifts
    return (
      <div className="w-full bg-slate-50 dark:bg-[#09090b] border-b border-slate-200/60 dark:border-zinc-900/60 py-2 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              Currently Under Development
            </span>
          </div>
          <div className="text-slate-800 dark:text-zinc-200 font-semibold tracking-wide">
            Full Release in{" "}
            <span className="text-blue-600 dark:text-sky-400 font-bold">23 days</span> (23d 00h 00m
            00s)
          </div>
        </div>
      </div>
    );
  }

  const formatNum = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="w-full bg-slate-50/90 dark:bg-[#070709]/95 backdrop-blur-xs border-b border-slate-200/60 dark:border-zinc-900/60 py-2.5 px-4 transition-colors duration-300 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/80 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-slate-550 dark:text-zinc-400 font-bold uppercase tracking-widest text-[9px]">
            Currently Under Development
          </span>
        </div>

        <div className="text-slate-800 dark:text-zinc-200 font-semibold tracking-wide flex items-center gap-1.5 flex-wrap justify-center">
          <span>Full Release in</span>
          <span className="text-blue-600 dark:text-sky-400 font-bold px-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 text-[11px]">
            {timeLeft.days} {timeLeft.days === 1 ? "day" : "days"}
          </span>
          <span className="text-slate-400 dark:text-zinc-550 font-bold text-[10px]">
            ({formatNum(timeLeft.days)}d : {formatNum(timeLeft.hours)}h :{" "}
            {formatNum(timeLeft.minutes)}m : {formatNum(timeLeft.seconds)}s)
          </span>
        </div>
      </div>
    </div>
  );
}
