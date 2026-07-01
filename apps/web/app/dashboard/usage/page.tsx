import { getRequiredSession } from "@/lib/session";
import { db, usageLogs } from "@fidel-tools/db";
import { eq, desc, count, gte, and, sum } from "drizzle-orm";
import {
  Activity,
  BarChart3,
  Clock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default async function UsagePage() {
  const session = await getRequiredSession();

  // Current month stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let monthlyRequests = 0;
  let monthlyTokens = 0;
  let recentLogs: {
    id: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number | null;
    tokensProcessed: number | null;
    createdAt: Date;
  }[] = [];

  try {
    const [result] = await db
      .select({ count: count() })
      .from(usageLogs)
      .where(and(eq(usageLogs.userId, session.user.id), gte(usageLogs.createdAt, startOfMonth)));
    monthlyRequests = result?.count ?? 0;

    const [tokensResult] = await db
      .select({ totalTokens: sum(usageLogs.tokensProcessed) })
      .from(usageLogs)
      .where(and(eq(usageLogs.userId, session.user.id), gte(usageLogs.createdAt, startOfMonth)));
    monthlyTokens = Number(tokensResult?.totalTokens ?? 0);

    recentLogs = await db
      .select({
        id: usageLogs.id,
        endpoint: usageLogs.endpoint,
        method: usageLogs.method,
        statusCode: usageLogs.statusCode,
        latencyMs: usageLogs.latencyMs,
        tokensProcessed: usageLogs.tokensProcessed,
        createdAt: usageLogs.createdAt,
      })
      .from(usageLogs)
      .where(eq(usageLogs.userId, session.user.id))
      .orderBy(desc(usageLogs.createdAt))
      .limit(50);
  } catch (err) {
    console.error("Failed to query usage metrics:", err);
  }

  // Calculate success rate and average latency from recent logs
  let successCount = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  const endpointCounts: Record<string, number> = {};

  recentLogs.forEach((log) => {
    if (log.statusCode < 300) successCount++;
    if (log.latencyMs !== null && log.latencyMs > 0) {
      totalLatency += log.latencyMs;
      latencyCount++;
    }
    endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
  });

  const recentLogsLength = recentLogs.length;
  const successRate = recentLogsLength > 0 ? (successCount / recentLogsLength) * 100 : 100;
  const averageLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0;

  const endpointStats = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({
      endpoint,
      count,
      percentage: recentLogsLength > 0 ? (count / recentLogsLength) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const quota = ((session.user as Record<string, unknown>).monthlyQuota as number) ?? 10000;
  const usagePercent = Math.min((monthlyRequests / quota) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto py-8 px-8 animate-fade-in font-sans space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
        <span>Yehonatal&apos;s Org</span>
        <span>/</span>
        <span className="text-zinc-500 dark:text-zinc-400 font-semibold">fidel-tools</span>
        <span>/</span>
        <span className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-900/40 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
          main
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-200/50 dark:border-zinc-900 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Usage & Analytics
            </h1>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 mt-1">
              Real-time request metrics, latency telemetry, and monthly usage limits.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/30 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              API STATUS: OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid (4 Cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Requests */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Monthly Queries
            </span>
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {monthlyRequests.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-mono font-semibold">
              {usagePercent.toFixed(1)}% of {quota.toLocaleString()} Limit
            </p>
          </div>
        </div>

        {/* Card 2: Average Latency */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Average Latency
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {averageLatency ? `${averageLatency} ms` : "—"}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-mono font-semibold">
              Recent 50 executions
            </p>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Success Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {successRate.toFixed(1)}%
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-mono font-semibold">
              HTTP status &lt; 300
            </p>
          </div>
        </div>

        {/* Card 4: Tokens Processed */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Tokens Processed
            </span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {monthlyTokens.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-mono font-semibold">
              Amharic glyph segments
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout Split ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) - Quota Bar & Logs Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Bar Card */}
          <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md p-5 border border-slate-200/50 dark:border-zinc-900 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                Monthly Quota Allocation
              </h2>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-300">
                {monthlyRequests.toLocaleString()} / {quota.toLocaleString()} queries
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden border border-slate-200/10 dark:border-zinc-800 relative">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${usagePercent}%`,
                  background:
                    usagePercent > 90 ? "#ef4444" : usagePercent > 70 ? "#f59e0b" : "#3b82f6",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider pt-1">
              <span>
                {usagePercent < 100
                  ? `${(100 - usagePercent).toFixed(1)}% limit remaining`
                  : "Quota depleted. System auto-throttling active."}
              </span>
              {usagePercent >= 80 && (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Usage Warning
                </span>
              )}
            </div>
          </div>

          {/* Recent Requests Table Card */}
          <div className="bg-white/50 dark:bg-zinc-950/10 rounded-md overflow-hidden border border-slate-200/50 dark:border-zinc-900">
            <div className="px-6 py-4 border-b border-slate-200/30 dark:border-zinc-900/50 bg-slate-50/20 dark:bg-zinc-900/10 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Requests Activity Log
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                Last 50 Events
              </span>
            </div>

            {recentLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200/30 dark:border-zinc-900/50 bg-slate-50/20 dark:bg-zinc-905/10">
                      <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Route Endpoint
                      </th>
                      <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Method
                      </th>
                      <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Status
                      </th>
                      <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Latency
                      </th>
                      <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Tokens
                      </th>
                      <th className="text-right text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3 font-mono">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => {
                      const isError = log.statusCode >= 400;
                      return (
                        <tr
                          key={log.id}
                          className="border-b border-slate-200/30 dark:border-zinc-900/50 last:border-b-0 hover:bg-slate-50/30 dark:hover:bg-zinc-900/5 transition-colors"
                        >
                          <td className="px-6 py-3">
                            <code className="text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200/30 dark:border-zinc-800/40">
                              {log.endpoint}
                            </code>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded border border-slate-200/30 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300">
                              {log.method}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                log.statusCode < 300
                                  ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                  : log.statusCode < 500
                                    ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                    : "bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10"
                              }`}
                            >
                              {log.statusCode}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-3 text-xs font-mono font-semibold ${isError ? "text-slate-400" : "text-slate-700 dark:text-zinc-400"}`}
                          >
                            {log.latencyMs ? `${log.latencyMs}ms` : "—"}
                          </td>
                          <td className="px-6 py-3 text-xs font-mono text-slate-500 dark:text-zinc-500">
                            {log.tokensProcessed ?? "—"}
                          </td>
                          <td className="px-6 py-3 text-right text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center border-t border-slate-200/30 dark:border-zinc-900/50">
                <div className="w-12 h-12 rounded bg-slate-50 dark:bg-zinc-950/40 flex items-center justify-center mx-auto mb-4 border border-slate-200/50 dark:border-zinc-800">
                  <Globe className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  No query logs detected. Initiate requests using your generated API credentials to
                  fill this log ledger.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) - Endpoint Breakdown & Performance info */}
        <div className="space-y-6">
          {/* Endpoint Distribution Breakdown */}
          <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-zinc-900/50 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-widest font-mono">
                  Routes Share
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                Distribution
              </span>
            </div>

            {endpointStats.length > 0 ? (
              <div className="space-y-4">
                {endpointStats.map((stat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <code className="font-mono text-[10px] text-slate-800 dark:text-zinc-300 bg-slate-100/65 dark:bg-black/35 px-1.5 py-0.5 rounded">
                        {stat.endpoint}
                      </code>
                      <span className="font-mono font-bold text-slate-500 dark:text-zinc-500 text-[10px]">
                        {stat.count} queries ({stat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-450 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
                Distribution breakdown will display here once the API processing pipeline begins
                receiving requests.
              </p>
            )}
          </div>

          {/* Optimization Alerts */}
          <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-widest font-mono">
                Optimization guide
              </h3>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-zinc-500 font-semibold leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                <p>
                  <span className="text-slate-800 dark:text-zinc-300 font-bold">
                    Geographic proximity
                  </span>
                  : API servers are hosted in AWS us-east-1. Locate calling clients nearby to
                  minimize round-trip connection overhead.
                </p>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-500 dark:text-zinc-500 font-semibold leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                <p>
                  <span className="text-slate-800 dark:text-zinc-300 font-bold">
                    Pipeline optimization
                  </span>
                  : Use the batch <code className="font-mono text-[10px]">/pipeline</code> endpoint
                  rather than sequential single-tool calls to achieve up to 3x lower latency.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
