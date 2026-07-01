"use client";

import { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Code,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Key,
  Shield,
  RefreshCw,
  Cpu,
} from "lucide-react";

interface OnboardingWizardProps {
  apiKey: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ apiKey, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [projectName, setProjectName] = useState("My Amharic App");
  const [codeTab, setCodeTab] = useState<"sdk" | "curl">("sdk");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionVerified, setConnectionVerified] = useState(false);

  const displayKey = apiKey || "ft_live_7x8901234567890abcdefghijkl";

  const codeSnippets = {
    sdk: `import { Fidel } from '@fidel-tools/core';

// Initialize with your workspace credential key
const fidel = new Fidel({
  apiKey: '${displayKey}'
});

const result = await fidel.normalize('ሐኪም ኀይሉ');
console.log(result.text); // Output: "ሃኪም ሃይሉ"`,
    curl: `curl -X POST https://api.fidel.tools/v1/normalize \\
  -H "Authorization: Bearer ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "ሐኪም ኀይሉ"}'`,
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionVerified(true);
    }, 2000);
  };

  const stepperSteps = [
    { num: 1, label: "Project Details" },
    { num: 2, label: "Setup SDK" },
    { num: 3, label: "Environment Keys" },
    { num: 4, label: "Verify Handshake" },
  ];

  return (
    <div className="min-h-[500px] flex flex-col md:flex-row border border-slate-200/50 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-md overflow-hidden shadow-xs font-sans">
      {/* ── Left Content Pane (Interactive Form Control) ──────────────── */}
      <div className="flex-1 p-8 md:p-10 flex flex-col justify-between space-y-8">
        {/* Step Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block">
            Step {step} of 4
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            {step === 1 && "Create Project"}
            {step === 2 && "Install & Configure SDK"}
            {step === 3 && "Set API Credentials"}
            {step === 4 && "Simulate Connection"}
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed max-w-md">
            {step === 1 &&
              "Name your application workspace to initialize isolated credentials keys."}
            {step === 2 &&
              "Add our parsing engine package to your codebase and initialize the client handler."}
            {step === 3 &&
              "Set your environment authorization key to authenticate API network requests."}
            {step === 4 && "Execute a network handshake test to verify API routing parameters."}
          </p>
        </div>

        {/* Step Body */}
        <div className="flex-1 py-4 flex flex-col justify-center">
          {/* STEP 1: Name Project */}
          {step === 1 && (
            <div className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Project Workspace Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="My App"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-relaxed font-semibold">
                This project configuration establishes local telemetry metrics and configures client
                headers.
              </p>
            </div>
          )}

          {/* STEP 2: Install SDK */}
          {step === 2 && (
            <div className="space-y-6 max-w-xl">
              {/* Install CLI */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  Install Package
                </label>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-zinc-900 rounded-md font-mono text-xs text-zinc-300">
                  <code>npm install @fidel-tools/core</code>
                  <button
                    onClick={() => handleCopy("npm install @fidel-tools/core", "install")}
                    className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText === "install" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Mount Code
                  </label>
                  <div className="flex rounded overflow-hidden border border-slate-200/50 dark:border-zinc-800 bg-slate-50 dark:bg-black p-0.5">
                    <button
                      onClick={() => setCodeTab("sdk")}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase cursor-pointer ${
                        codeTab === "sdk"
                          ? "bg-slate-900 text-white dark:bg-zinc-800"
                          : "text-slate-500 dark:text-zinc-500"
                      }`}
                    >
                      SDK
                    </button>
                    <button
                      onClick={() => setCodeTab("curl")}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase cursor-pointer ${
                        codeTab === "curl"
                          ? "bg-slate-900 text-white dark:bg-zinc-800"
                          : "text-slate-500 dark:text-zinc-500"
                      }`}
                    >
                      cURL
                    </button>
                  </div>
                </div>

                <div className="relative p-4 bg-slate-950 border border-zinc-900 rounded-md font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre max-h-[160px] leading-relaxed">
                  <button
                    onClick={() => handleCopy(codeSnippets[codeTab], "code")}
                    className="absolute top-2 right-2 p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors cursor-pointer"
                  >
                    {copiedText === "code" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <code>{codeSnippets[codeTab]}</code>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Environment keys */}
          {step === 3 && (
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  BETTER_AUTH_API_KEY
                </label>
                <div className="flex items-center justify-between p-3 bg-slate-950 border border-zinc-900 rounded-md font-mono text-xs text-zinc-300">
                  <code className="truncate max-w-[280px]">{displayKey}</code>
                  <button
                    onClick={() => handleCopy(displayKey, "key")}
                    className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText === "key" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-relaxed font-semibold">
                Mount this credentials token inside your server environment variable list as{" "}
                <code className="font-mono text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded">
                  BETTER_AUTH_API_KEY
                </code>
                .
              </p>
            </div>
          )}

          {/* STEP 4: Verify Handshake */}
          {step === 4 && (
            <div className="space-y-6 max-w-md">
              <div className="border border-dashed border-slate-200/60 dark:border-zinc-900 rounded p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[160px] bg-slate-50/50 dark:bg-zinc-950/20">
                {testingConnection ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-sky-400 animate-spin" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Listening for endpoints telemetry requests...
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">
                        Attempting handshakes with api.fidel.tools
                      </p>
                    </div>
                  </>
                ) : connectionVerified ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse-soft">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Handshake verified successfully!
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold font-mono">
                        fidel-api-prod: OK (200)
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Cpu className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Waiting for API communication test
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">
                        Click the trigger below to run a test verification request.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!connectionVerified && !testingConnection && (
                <button
                  onClick={handleTestConnection}
                  className="w-full py-2.5 bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-transparent shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test Verification Endpoint
                </button>
              )}
            </div>
          )}
        </div>

        {/* Step Actions */}
        <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-zinc-900 pt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as any)}
              disabled={step === 1 && !projectName.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-transparent shadow-sm"
            >
              Continue
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={!connectionVerified}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-transparent shadow-sm"
            >
              Go to Telemetry Console
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Right Vertical Navigation Stepper Panel ───────────────────── */}
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
            Setup Progress
          </h3>
          <div className="relative pl-0.5 space-y-6">
            {/* Stepper connector line */}
            <div className="absolute top-2 left-3 w-0.5 h-[calc(100%-16px)] bg-slate-200 dark:bg-zinc-900 z-0" />

            {stepperSteps.map((s) => {
              const active = step === s.num;
              const passed = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-3.5 relative z-10">
                  <div
                    className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border transition-all ${
                      passed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : active
                          ? "bg-blue-500/10 text-blue-600 dark:text-sky-400 border-blue-500/35 scale-105"
                          : "bg-white dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 border-slate-200/60 dark:border-zinc-900"
                    }`}
                  >
                    {passed ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs transition-colors ${
                      active
                        ? "font-bold text-slate-900 dark:text-white"
                        : passed
                          ? "font-semibold text-slate-500 dark:text-zinc-400"
                          : "font-semibold text-slate-400 dark:text-zinc-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/50 dark:border-zinc-900/60 hidden md:block">
          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Verified Sandbox
          </div>
        </div>
      </div>
    </div>
  );
}
