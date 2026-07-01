"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OnboardingWizard from "@/components/onboarding-wizard";
import QuickStartClient from "@/components/quick-start-client";
import { Key, Cpu, ChevronRight, Code2, Layers, Activity, Award } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: "active" | "revoked";
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface DashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  keys: ApiKey[];
  stats: { label: string; value: string | number }[];
  displayKey: string;
}

export default function DashboardClient({ user, keys, stats, displayKey }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    // If they already have active API keys, skip onboarding by default
    const activeKeys = keys.filter((k) => k.status === "active");
    const completed = localStorage.getItem("fidel-onboarding-completed") === "true";
    if (activeKeys.length > 0 || completed) {
      setShowOnboarding(false);
    }
  }, [keys]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem("fidel-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors to switch between Onboarding Guide and Live Telemetry Console */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-900 pb-4 mb-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-950 p-0.5 rounded-md border border-slate-200/50 dark:border-zinc-900">
          <button
            onClick={() => setShowOnboarding(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              !showOnboarding
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-zinc-800"
                : "text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            Telemetry Console
          </button>
          <button
            onClick={() => setShowOnboarding(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              showOnboarding
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-zinc-800"
                : "text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            Interactive Setup Guide
          </button>
        </div>

        {/* Status link */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-200 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 text-[10px] font-bold font-mono text-slate-500 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft"></span>
          fidel-api-prod: active
        </div>
      </div>

      {showOnboarding ? (
        <div className="animate-fade-in">
          <OnboardingWizard apiKey={displayKey} onComplete={handleCompleteOnboarding} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main stats + quickstart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Connected Grid Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 rounded-md overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-5 flex flex-col justify-between hover:bg-slate-50/40 dark:hover:bg-zinc-900/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                      {stat.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-350 dark:text-zinc-700 font-mono">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100 tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Integration / Console Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-slate-400" />
                  Quick Integration
                </h2>
                <Link
                  href="/dashboard/api-keys"
                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center"
                >
                  Manage Keys <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <QuickStartClient apiKey={displayKey} />
            </div>
          </div>

          {/* Sidebar panels */}
          <div className="space-y-6">
            {/* Recent Keys */}
            <div className="glass-card rounded-md p-5 border border-slate-200 dark:border-zinc-800/80">
              <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                API Key Context
              </h2>
              {keys.length > 0 ? (
                <div className="space-y-2">
                  {keys.slice(0, 3).map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-2.5 rounded border border-slate-200/50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/20"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[120px]">
                          {key.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                          {key.keyPrefix}••••
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          key.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 rounded">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500">
                    No API keys created yet.
                  </span>
                  <Link
                    href="/dashboard/api-keys"
                    className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline mt-1"
                  >
                    Create one now
                  </Link>
                </div>
              )}
            </div>

            {/* Quick API Docs Overview */}
            <div className="glass-card rounded-md p-5 border border-slate-200 dark:border-zinc-800/80">
              <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                API Reference
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mb-4">
                Explore query parameters for transliteration, normalization, and stemming.
              </p>
              <div className="bg-slate-950 dark:bg-black p-3 rounded border border-slate-200/30 dark:border-zinc-800 font-mono text-[10px] text-zinc-400 mb-4 leading-relaxed">
                <span className="text-emerald-400 font-bold">POST</span> /api/v1/normalize
                <br />
                <span className="text-blue-400 font-bold">POST</span> /api/v1/stem
                <br />
                <span className="text-amber-400 font-bold">POST</span> /api/v1/transliterate
              </div>
              <a
                href="https://fidel-tools.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-black dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-950 dark:border-zinc-800 text-white dark:text-zinc-300 font-bold text-xs py-2 rounded transition-colors text-center cursor-pointer"
              >
                Open Documentation
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
