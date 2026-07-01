import { getRequiredSession } from "@/lib/session";
import { listApiKeys } from "@/lib/api-keys";
import { db, usageLogs } from "@fidel-tools/db";
import { eq, count, gte, and } from "drizzle-orm";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const keys = await listApiKeys(session.user.id);
  const activeKeys = keys.filter((k) => k.status === "active");

  const displayKey =
    activeKeys.length > 0 ? `${activeKeys[0].keyPrefix}••••••••••••••••••••••••••••••••` : "";

  // Get current month usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let monthlyRequests = 0;
  try {
    const [result] = await db
      .select({ count: count() })
      .from(usageLogs)
      .where(and(eq(usageLogs.userId, session.user.id), gte(usageLogs.createdAt, startOfMonth)));
    monthlyRequests = result?.count ?? 0;
  } catch {
    // Usage table may not exist yet
  }

  const stats = [
    {
      label: "Active API Keys",
      value: activeKeys.length,
    },
    {
      label: "Requests This Month",
      value: monthlyRequests.toLocaleString(),
    },
    {
      label: "Account Tier",
      value: (session.user as Record<string, unknown>).tier === "pro" ? "Pro" : "Free",
    },
    {
      label: "Monthly Quota",
      value: (
        ((session.user as Record<string, unknown>).monthlyQuota as number) ?? 10000
      ).toLocaleString(),
    },
  ];

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

      {/* Header */}
      <div className="border-b border-zinc-200/50 dark:border-zinc-900 pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Developer Workspace
        </h1>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 mt-1">
          Complete your application onboarding handshake and monitor live metrics stream.
        </p>
      </div>

      <DashboardClient user={session.user} keys={keys} stats={stats} displayKey={displayKey} />
    </div>
  );
}
