"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";
import { ChevronDown, ArrowRight, Menu, X, Code, Globe } from "lucide-react";

export default function MarketingHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Packages", href: "/packages" },
    { label: "Benchmarks", href: "/benchmarks" },
    { label: "Infrastructure", href: "/infrastructure" },
    { label: "Enterprise", href: "/enterprise" },
    { label: "Changelog", href: "/changelog" },
  ];

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/55 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-loga text-2xl font-light text-zinc-900 dark:text-white select-none tracking-tight">
                ፊደል
              </span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mt-1.5 font-mono">
                tools
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="https://fidel-tools.vercel.app/docs"
                target="_blank"
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Docs
              </Link>

              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-bold transition-colors ${
                      active
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Products Dropdown Trigger */}
              <div className="relative font-sans">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Products
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-8 left-0 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-2xl p-3 space-y-2 animate-fade-in z-50">
                    <a
                      href="https://github.com/Yehonatal/fidel-tools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-2.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-50 dark:group-hover:bg-black transition-colors">
                        <Code className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Framework (SDK)
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-semibold">
                          TypeScript NLP engine. Stem, normalize, and tokenize locally in your apps.
                        </p>
                      </div>
                    </a>

                    <Link
                      href="/dashboard"
                      className="flex gap-3 p-2.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-50 dark:group-hover:bg-black transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          API Cloud (Console)
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 leading-relaxed font-semibold">
                          Managed REST endpoints, credential management, logs, and rate limiters.
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Header Buttons */}
          <div className="hidden md:flex items-center gap-3 font-sans">
            {session ? (
              <Link
                href="/dashboard"
                className="text-xs font-bold text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 rounded transition-all inline-flex items-center gap-1.5 shadow-md dark:shadow-lg dark:shadow-white/5"
              >
                Go to Console
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-xs font-bold text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 rounded transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
            <div className="border-l border-zinc-200 dark:border-zinc-900 pl-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-900 dark:text-zinc-100 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (Full-screen Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[56px] z-50 bg-[#fafafa] dark:bg-[#030303] flex flex-col p-8 space-y-8 animate-fade-in font-sans overflow-y-auto">
          {/* Subtle grid and glows in the mobile menu overlay to match design lang */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="bg-grid absolute inset-0 text-zinc-900/[0.025] dark:text-white/[0.012]"></div>
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-zinc-100/50 dark:from-[#0a0a0f] via-transparent to-transparent pointer-events-none opacity-80"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 text-lg font-bold">
            <Link
              href="https://fidel-tools.vercel.app/docs"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Documentation
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-900 pt-6 space-y-4 relative z-10">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Products
            </p>
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://github.com/Yehonatal/fidel-tools"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <Code className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Framework (SDK)
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">
                    TypeScript NLP engine. Stem, normalize, and tokenize locally.
                  </p>
                </div>
              </a>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <Globe className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    API Cloud (Console)
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">
                    Managed REST endpoints, credential management, logs, and rate limiters.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-900 pt-6 flex flex-col gap-3 mt-auto relative z-10">
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded text-xs font-bold text-white dark:text-black bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 transition-colors shadow-lg shadow-black/5"
              >
                Go to Console
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded text-xs font-bold text-zinc-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded text-xs font-bold text-white dark:text-black bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 transition-colors shadow-lg shadow-black/5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
