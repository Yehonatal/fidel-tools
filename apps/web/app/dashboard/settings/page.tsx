import { getRequiredSession } from "@/lib/session";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await getRequiredSession();

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-fade-in font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500 font-mono mb-4">
        <span>Yehonatal&apos;s Org</span>
        <span>/</span>
        <span className="text-slate-600 dark:text-zinc-300 font-bold">fidel-tools</span>
        <span>/</span>
        <span className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-slate-600 dark:text-zinc-400 uppercase tracking-wider font-bold">
          main
        </span>
      </div>

      <div className="border-b border-slate-200/60 dark:border-zinc-900 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mt-1">
          Manage your developer profile, password, and workspace preferences.
        </p>
      </div>

      <SettingsClient user={session.user} />
    </div>
  );
}
