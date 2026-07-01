"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const { error: err } = await signUp.email({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });

    if (err) {
      setError(err.message ?? "Sign up failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all";

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans">
      {/* ── Left Column (Branding & Technical Visual) ────────────────── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-zinc-950 border-r border-zinc-900 relative flex-col justify-between p-10 overflow-hidden">
        {/* Coordinate Grid Background */}
        <div className="bg-grid absolute inset-0 text-white/[0.012] pointer-events-none"></div>

        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2 relative z-10">
          <span className="font-loga text-4xl font-light text-white select-none">ፊደል</span>
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase mt-2 font-mono">
            Console
          </span>
        </Link>

        {/* Center Quote / Pitch */}
        <div className="relative z-10 space-y-4">
          <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
            02 / REGISTRATION MODULE
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
            Join the Developer Environment
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Configure sandboxes, retrieve telemetry dashboard views, and integrate language
            processing packages.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">
          <span>&copy; Fidel Tools</span>
          <span>api.fidel.tools</span>
        </div>
      </div>

      {/* ── Right Column (Authentication Form) ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-sm animate-fade-in space-y-6">
          {/* Logo representation on mobile */}
          <div className="text-center md:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="font-loga text-4xl font-light text-slate-800 dark:text-zinc-150 select-none">
                ፊደል
              </span>
              <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase mt-2 font-mono">
                Console
              </span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Account
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
              Register your workspace details to generate your API keys.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClass}
                placeholder="Yohannes Alemayehu"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="m@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                className={inputClass}
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center border border-transparent shadow-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  Creating workspace…
                </span>
              ) : (
                "Sign Up for Console"
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-200/60 dark:border-zinc-900">
            <p className="text-xs text-slate-500 dark:text-zinc-500 font-semibold">
              Already registered?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
