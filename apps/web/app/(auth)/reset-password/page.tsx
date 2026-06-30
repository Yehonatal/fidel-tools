"use client";

import { useState, use } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = use(searchParams);
  const token = params.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: err } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (err) {
      setError(err.message ?? "Failed to reset password.");
      setLoading(false);
      return;
    }

    setSuccess(true);
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
          <span className="font-loga text-4xl font-light text-white select-none">
            ፊደል
          </span>
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase mt-2 font-mono">
            Console
          </span>
        </Link>

        {/* Center Quote / Pitch */}
        <div className="relative z-10 space-y-4">
          <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
            05 / CREDENTIAL UPDATE
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
            Establish New Password
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Define a secure cryptographic sequence to restore access permissions for the Fidel environment.
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

          {!token ? (
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded border border-red-500/20 bg-red-500/10 flex items-center justify-center mx-auto md:mx-0 text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Invalid Reset Token
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
                  The password recovery token is missing, expired, or invalid. Please request a new link.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
                >
                  &larr; Request a new recovery link
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center mx-auto md:mx-0 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Password Reset Successful
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
                  Your credentials have been updated. You can now log in with your new password.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
                >
                  Sign In &larr;
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
                  Please enter and verify your new workspace access password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Confirm new password"
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
                      Updating password…
                    </span>
                  ) : (
                    "Reset Password"
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
