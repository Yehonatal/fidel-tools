"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Command, ArrowRight } from "lucide-react";

export default function InfrastructurePage() {
  const [activePlan, setActivePlan] = useState<"starter" | "pro" | "enterprise">("pro");

  const plans = {
    starter: {
      price: "$0",
      desc: "For evaluation and hobby projects.",
      features: [
        "10,000 requests / month",
        "1 active API credential key",
        "Self-service community support",
        "Access to basic stemming & tokenizer",
      ],
      buttonText: "Start building for free",
      href: "/sign-up",
    },
    pro: {
      price: "$29",
      desc: "For production services and applications.",
      features: [
        "250,000 requests / month",
        "Unlimited API credential keys",
        "Standard email & chat support",
        "Access to advanced normalization rules",
        "High-performance low-latency response priority",
      ],
      buttonText: "Get Pro Access",
      href: "/sign-up?tier=pro",
    },
    enterprise: {
      price: "Custom",
      desc: "For high-volume enterprise production workloads.",
      features: [
        "Unlimited monthly requests",
        "Dedicated isolated API instances",
        "Custom service level agreements (SLAs)",
        "24/7 priority developer support",
        "Dedicated account technical manager",
      ],
      buttonText: "Contact Sales",
      href: "mailto:support@fidel.tools",
    },
  };

  const comparisonRows = [
    {
      name: "Monthly requests limit",
      starter: "10,000 / mo",
      pro: "250,000 / mo",
      enterprise: "Unlimited",
    },
    { name: "API Keys allowed", starter: "1 key", pro: "Unlimited", enterprise: "Unlimited" },
    {
      name: "Rate limit threshold",
      starter: "60 req / min",
      pro: "600 req / min",
      enterprise: "Custom limits",
    },
    { name: "Normalize & Stemmer API", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    { name: "Transliterate API", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    { name: "Custom Stopwords List", starter: "No", pro: "Yes", enterprise: "Yes" },
    {
      name: "Support tier",
      starter: "Community Discord",
      pro: "Standard Email",
      enterprise: "24/7 dedicated support",
    },
    {
      name: "Service uptime SLA",
      starter: "99.0% SLA",
      pro: "99.9% SLA",
      enterprise: "99.99% custom SLA",
    },
  ];

  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex-grow space-y-16 transition-colors duration-300">
      {/* ── Top Pricing Hero & Selector Flow ──────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left Column Description */}
        <div className="lg:w-[35%] flex flex-col justify-between py-1 space-y-6 lg:space-y-0">
          <div className="space-y-4">
            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">
              02 / MANAGED INFRASTRUCTURE
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none font-sans">
              Managed API Infrastructure
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              Connect to our globally distributed, low-latency API cloud to power your applications
              with rule stemmers and lexical normalization without hosting complexity.
            </p>
          </div>

          {/* Interactive Tier Switcher */}
          <div className="space-y-2 max-w-xs pt-4 lg:pt-0">
            {(["starter", "pro", "enterprise"] as const).map((p) => {
              const active = activePlan === p;
              return (
                <button
                  key={p}
                  onClick={() => setActivePlan(p)}
                  className={`w-full flex items-center justify-between p-3.5 rounded border text-left transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-slate-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border-slate-200 dark:border-zinc-800 font-bold"
                      : "border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium"
                  }`}
                >
                  <span className="text-[9px] tracking-widest font-mono uppercase">{p}</span>
                  <span className="text-xs font-mono">{plans[p].price}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pricing Plan Card Detail */}
        <div className="lg:w-[65%]">
          <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg p-8 shadow-sm dark:shadow-xl min-h-[380px] flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
            <div>
              <div className="flex items-baseline gap-2 justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-mono">
                  {activePlan} plan features
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                    {plans[activePlan].price}
                  </span>
                  {activePlan !== "enterprise" && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 font-mono">
                      / mo
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-6">
                {plans[activePlan].desc}
              </p>

              <div className="border-t border-slate-200 dark:border-zinc-900 my-4" />

              <ul className="space-y-4">
                {plans[activePlan].features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed"
                  >
                    <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href={plans[activePlan].href}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer border border-transparent bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black shadow-sm"
              >
                <span>{plans[activePlan].buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison Matrix Table ────────────────────────────────── */}
      <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-zinc-900">
        <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
          <Command className="w-4 h-4 text-slate-500" />
          Comparison Matrix Table
        </h3>
        <div className="border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-900 bg-slate-50/80 dark:bg-black/20 transition-colors">
                  <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Features Details
                  </th>
                  <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Starter
                  </th>
                  <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Pro
                  </th>
                  <th className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-900">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-bold text-slate-805 dark:text-zinc-300">
                      {row.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-zinc-500 font-semibold">
                      {row.starter}
                    </td>
                    <td className="px-6 py-3.5 text-slate-900 dark:text-zinc-200 font-bold">
                      {row.pro}
                    </td>
                    <td className="px-6 py-3.5 text-slate-605 dark:text-zinc-400 font-semibold">
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
