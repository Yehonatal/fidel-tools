"use client";

import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-900 bg-slate-50/50 dark:bg-black/40 py-12 relative z-10 font-mono text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-zinc-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Fidel Tools</span>
          <span>&bull;</span>
          <span>MIT License</span>
          <span>&bull;</span>
          <a
            href="https://github.com/Yehonatal/fidel-tools"
            target="_blank"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-6">
          <span>api.fidel.tools</span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Yehonatal/fidel-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
