import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const sent = params.status === "sent";

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
            04 / VERIFICATION MODULE
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
            Account Verification
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Verify workspace parameters and establish authenticated handshake validation for the NLP
            service mesh.
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
        <div className="w-full max-w-sm animate-fade-in space-y-6 text-center md:text-left">
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

          <div className="w-12 h-12 rounded border border-blue-500/20 bg-blue-500/10 flex items-center justify-center mx-auto md:mx-0 text-blue-600 dark:text-sky-400">
            {sent ? <Mail className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Check your inbox
            </h1>
            {sent ? (
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
                We sent a verification link to your email address. Click it to activate your account
                and start using the API.
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
                Verifying your email address credentials…
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-900 text-center md:text-left">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline transition-colors"
            >
              &larr; Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
