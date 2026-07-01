"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const updateLocalState = () => {
      const saved = localStorage.getItem("fidel-theme") as "light" | "dark" | null;
      if (saved) {
        setTheme(saved);
      } else {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
      }
    };

    updateLocalState();

    window.addEventListener("fidel-theme-changed", updateLocalState);
    return () => {
      window.removeEventListener("fidel-theme-changed", updateLocalState);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("fidel-theme", nextTheme);

    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#030303";
      document.body.style.color = "#ffffff";
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = "#fafafa";
      document.body.style.color = "#09090b";
    }

    window.dispatchEvent(new Event("fidel-theme-changed"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer transition-all duration-200"
      aria-label="Toggle light/dark theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
