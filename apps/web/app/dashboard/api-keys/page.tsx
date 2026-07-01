import { getRequiredSession } from "@/lib/session";
import { listApiKeys } from "@/lib/api-keys";
import ApiKeysClient from "./api-keys-client";

export default async function ApiKeysPage() {
  const session = await getRequiredSession();
  const keys = await listApiKeys(session.user.id);

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-fade-in font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mb-4">
        <span>Yehonatal&apos;s Org</span>
        <span>/</span>
        <span className="text-zinc-500 dark:text-zinc-400 font-semibold">fidel-tools</span>
        <span>/</span>
        <span className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-900/40 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
          main
        </span>
      </div>

      <div className="border-b border-zinc-200/50 dark:border-zinc-900 pb-5 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          API Credentials
        </h1>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 mt-1">
          Use these credentials to authenticate calls to the Amharic NLP API endpoints.
        </p>
      </div>

      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
