import { getRequiredSession } from "@/lib/session";
import PlaygroundClient from "./playground-client";

export default async function PlaygroundPage() {
  await getRequiredSession();

  return (
    <div className="w-full py-6 px-8 animate-fade-in font-sans flex flex-col h-[calc(100vh-1rem)]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mb-3 shrink-0">
        <span>Yehonatal&apos;s Org</span>
        <span>/</span>
        <span className="text-zinc-500 dark:text-zinc-400 font-semibold">fidel-tools</span>
        <span>/</span>
        <span className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-900/40 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
          main
        </span>
      </div>

      <div className="border-b border-zinc-200/50 dark:border-zinc-900 pb-3 mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Interactive Execution Console
          </h1>
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 mt-0.5">
            Test and compile your Amharic NLP workflows inside a web-integrated development
            environment.
          </p>
        </div>
      </div>

      <PlaygroundClient />
    </div>
  );
}
