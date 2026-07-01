"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (err) {
      setError(err.message ?? "Failed to send reset email");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
            03 / RECOVERY SYSTEM
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
            Credential Recovery
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Generate validation links to reset account permissions and verify system-access
            configurations.
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

          {sent ? (
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center mx-auto md:mx-0 text-emerald-600 dark:text-emerald-400 animate-pulse-soft">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Check your email
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
                  If an account exists for {email}, you&apos;ll receive a password reset link.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
                >
                  &larr; Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reset Password
                </h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
                  Enter your email address to receive a secure recovery verification link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="m@example.com"
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
                      Sending link…
                    </span>
                  ) : (
                    "Send Recovery Link"
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-200/50 dark:border-zinc-900">
                <Link
                  href="/sign-in"
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
                >
                  &larr; Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
