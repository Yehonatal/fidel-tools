"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Code, Cpu } from "lucide-react";

interface QuickStartClientProps {
  apiKey: string;
}

export default function QuickStartClient({ apiKey }: QuickStartClientProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "js" | "python">("curl");
  const [copied, setCopied] = useState(false);

  const displayKey = apiKey || "ft_live_your_api_key_goes_here";

  const codeSnippets = {
    curl: `curl -X POST https://api.fidel.tools/v1/normalize \\
  -H "Authorization: Bearer ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "ሐኪም ኀይሉ"}'`,
    js: `import { Fidel } from '@fidel-tools/core';

const fidel = new Fidel({ apiKey: '${displayKey}' });

const result = await fidel.normalize('ሐኪም ኀይሉ');
console.log(result.text); // "ሃኪም ሃይሉ"`,
    python: `import requests

url = "https://api.fidel.tools/v1/normalize"
headers = {
    "Authorization": "Bearer ${displayKey}",
    "Content-Type": "application/json"
}
data = {
    "text": "ሐኪም ኀይሉ"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-slate-950 text-zinc-100 flex flex-col font-mono text-xs h-[300px]">
      {/* Header bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            Quick Integration
          </span>
        </div>

        {/* Language Tabs */}
        <div className="flex border border-slate-800 rounded overflow-hidden bg-slate-950">
          {(["curl", "js", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-3 py-1 cursor-pointer transition-colors text-[10px] uppercase font-bold tracking-wider ${
                activeTab === lang ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {lang === "js" ? "JS" : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4 relative overflow-auto whitespace-pre font-mono text-zinc-300 leading-relaxed scrollbar-thin">
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 p-1.5 rounded border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Copy Code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <code className="block mt-2">{codeSnippets[activeTab]}</code>
      </div>

      {/* Footer bar */}
      <div className="bg-slate-900/40 border-t border-zinc-800/60 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 font-semibold select-none">
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          Status: Ready to make API requests
        </span>
        <span className="flex items-center gap-1">
          <Code className="w-3.5 h-3.5 text-emerald-500" />
          Production API: api.fidel.tools
        </span>
      </div>
    </div>
  );
}
