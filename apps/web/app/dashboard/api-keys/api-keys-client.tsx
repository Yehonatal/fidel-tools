"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  Plus,
  X,
  Terminal,
  Shield,
  Code,
  Key,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: "active" | "revoked";
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface NewKey {
  raw: string;
  prefix: string;
  name: string;
}

type LangSnippet = "curl" | "javascript" | "python";
type EndpointOption = "normalize" | "stem" | "tokenize" | "pipeline";

export default function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<NewKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [expiryDays, setExpiryDays] = useState<string>("never");

  // Code Snippet Generator States
  const [activeLang, setActiveLang] = useState<LangSnippet>("curl");
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointOption>("normalize");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    let expiresAt: string | undefined = undefined;
    if (expiryDays !== "never") {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(expiryDays));
      expiresAt = date.toISOString();
    }

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName, expiresAt }),
      });

      if (!res.ok) throw new Error("Failed to create key");

      const data = await res.json();
      setNewKey(data.key);

      const createdKey: ApiKey = {
        id: data.key.id || Math.random().toString(),
        name: data.key.name,
        keyPrefix: data.key.prefix,
        status: "active",
        lastUsedAt: null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdAt: new Date(),
      };
      setKeys((prev) => [createdKey, ...prev]);

      setShowCreate(false);
      setKeyName("");
      setExpiryDays("never");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Are you sure you want to revoke this key? This cannot be undone.")) return;

    setRevoking(id);
    try {
      await fetch(`/api/keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(null);
    }
  }

  function copyToClipboard(text: string, code = false) {
    navigator.clipboard.writeText(text);
    if (code) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const apiKeyValue = newKey ? newKey.raw : "ft_your_api_key_here";
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const apiBaseUrl = `${currentOrigin}/api/v1/nlp`;

  const payloads: Record<EndpointOption, { path: string; data: object }> = {
    normalize: {
      path: "/normalize",
      data: { text: "ሃይማኖት", lang: "am" },
    },
    stem: {
      path: "/stem",
      data: { word: "ልጆቻቸውን", lang: "am" },
    },
    tokenize: {
      path: "/tokenize",
      data: { text: "ፊደል ቱልስ። በጣም ጥሩ ነው።", lang: "am" },
    },
    pipeline: {
      path: "/pipeline",
      data: {
        text: "ልጆች በኢትዮጵያ",
        steps: ["normalize", "tokenize", "stopwords", "stem"],
        lang: "am",
      },
    },
  };

  const getCodeSnippet = () => {
    const { path, data } = payloads[activeEndpoint];
    const fullUrl = `${apiBaseUrl}${path}`;

    if (activeLang === "curl") {
      return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyValue}" \\
  -d '${JSON.stringify(data, null, 2)}'`;
    }

    if (activeLang === "javascript") {
      return `fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKeyValue}"
  },
  body: JSON.stringify(${JSON.stringify(data, null, 4)})
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    }

    if (activeLang === "python") {
      return `import requests

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKeyValue}"
}
data = ${JSON.stringify(data, null, 4).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None")}

response = requests.post(url, headers=headers, json=data)
print(response.json())`;
    }

    return "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start font-sans">
      {/* ── Left/Center Column (2/3 width) ─────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* New Key Reveal Banner */}
        {newKey && (
          <div className="bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-5 rounded-lg animate-slide-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded border border-amber-500/10 bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-amber-200">
                  New API key generated
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5 font-medium leading-relaxed">
                  Please copy this key now. For security reasons, you will not be able to see it
                  again.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 p-3.5 font-mono text-sm border border-slate-200/50 dark:border-zinc-800 rounded-lg">
              <code className="flex-1 break-all text-slate-900 dark:text-zinc-200 font-semibold select-all font-mono">
                {newKey.raw}
              </code>
              <button
                onClick={() => copyToClipboard(newKey.raw)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 dark:bg-zinc-900 text-white dark:text-zinc-300 hover:bg-black dark:hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors border border-slate-950 dark:border-zinc-800"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <button
              onClick={() => setNewKey(null)}
              className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              I have saved the key, dismiss warning
            </button>
          </div>
        )}

        {/* Create / Form Section */}
        {showCreate ? (
          <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md p-5 border border-slate-200/50 dark:border-zinc-900 animate-fade-in space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono">
                Generate API Credential
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
                Each key provides access to the Amharic preprocessing pipeline.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-mono">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder='e.g. "Production Server"'
                    required
                    maxLength={80}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200/50 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-zinc-50 text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-mono">
                    Expiration
                  </label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all"
                  >
                    <option value="never">Never (Permanent)</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating || !keyName.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-950 dark:border-zinc-800 transition-all cursor-pointer"
                >
                  {creating ? "Generating…" : "Generate Key"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setKeyName("");
                    setExpiryDays("never");
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/40 border border-transparent transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Active Credentials ({keys.filter((k) => k.status === "active").length})
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-950 dark:border-zinc-800 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate API Key
            </button>
          </div>
        )}

        {/* Keys Table Container */}
        {keys.length > 0 ? (
          <div className="bg-white/50 dark:bg-zinc-950/10 rounded-md overflow-hidden border border-slate-200/50 dark:border-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-zinc-900/50 bg-slate-50/20 dark:bg-zinc-900/10">
                    <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Key Name
                    </th>
                    <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Secret Token
                    </th>
                    <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Status
                    </th>
                    <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Expires
                    </th>
                    <th className="text-left text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Last Active
                    </th>
                    <th className="text-right text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-6 py-3.5 font-mono">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => {
                    const isRevoked = key.status === "revoked";
                    const isExpired = key.expiresAt ? new Date(key.expiresAt) < new Date() : false;

                    return (
                      <tr
                        key={key.id}
                        className="border-b border-slate-200/30 dark:border-zinc-900/50 last:border-b-0 hover:bg-slate-50/30 dark:hover:bg-zinc-900/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p
                            className={`text-xs font-bold truncate max-w-[150px] ${isRevoked ? "text-slate-400 dark:text-zinc-500 line-through" : "text-slate-800 dark:text-zinc-200"}`}
                          >
                            {key.name}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-black/35 px-2 py-0.5 rounded border border-slate-200/30 dark:border-zinc-800">
                            {key.keyPrefix}••••••••
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                              isRevoked
                                ? "bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10"
                                : isExpired
                                  ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10"
                                  : "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                isRevoked
                                  ? "bg-red-500"
                                  : isExpired
                                    ? "bg-amber-500"
                                    : "bg-emerald-500 animate-pulse-soft"
                              }`}
                            />
                            {isRevoked ? "revoked" : isExpired ? "expired" : "active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-zinc-500">
                          {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-zinc-500">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {key.status === "active" && !isExpired && (
                            <button
                              onClick={() => handleRevoke(key.id)}
                              disabled={revoking === key.id}
                              className="text-[10px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1 hover:bg-red-500/10 p-1 px-2 rounded border border-transparent"
                            >
                              <Trash2 className="w-3 h-3" />
                              {revoking === key.id ? "Revoking…" : "Revoke"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/20 dark:bg-zinc-950/10 rounded-md p-12 text-center border border-slate-200/50 dark:border-zinc-900">
            <div className="w-12 h-12 rounded bg-slate-100 dark:bg-zinc-900/40 flex items-center justify-center mx-auto mb-4 border border-slate-200/50 dark:border-zinc-800">
              <Key className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">
              No API credentials generated
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Create an API key to securely authenticate and consume the Amharic NLP pre-processing
              routes.
            </p>
          </div>
        )}

        {/* ── Quick Start Code Snippet Box ─────────────────────────── */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200/50 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/25 dark:bg-zinc-900/10">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-350 uppercase tracking-wider font-mono">
                Interactive SDK Quick Start
              </h3>
            </div>

            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
                Endpoint:
              </span>
              <select
                value={activeEndpoint}
                onChange={(e) => setActiveEndpoint(e.target.value as EndpointOption)}
                className="text-[11px] font-mono font-bold bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded px-1.5 py-0.5 text-slate-700 dark:text-zinc-300 outline-none"
              >
                <option value="normalize">POST /normalize</option>
                <option value="stem">POST /stem</option>
                <option value="tokenize">POST /tokenize</option>
                <option value="pipeline">POST /pipeline</option>
              </select>
            </div>
          </div>

          <div className="px-4 pb-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
              Generate request templates in various languages to test the {activeEndpoint} operation
              immediately.
            </p>

            {/* Language Tabs */}
            <div className="flex border-b border-slate-200/50 dark:border-zinc-900 gap-4">
              {(["curl", "javascript", "python"] as LangSnippet[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`pb-2 text-[11px] font-bold uppercase tracking-wider font-mono border-b-2 cursor-pointer transition-all ${
                    activeLang === lang
                      ? "border-slate-900 dark:border-zinc-300 text-slate-900 dark:text-zinc-200 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  {lang === "javascript" ? "JavaScript" : lang === "python" ? "Python" : "cURL"}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative group">
              <pre className="bg-slate-900 dark:bg-black border border-slate-950 dark:border-zinc-900/60 p-4 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-[300px]">
                <code>{getCodeSnippet()}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(getCodeSnippet(), true)}
                className="absolute top-3 right-3 p-1.5 rounded bg-zinc-800/60 dark:bg-zinc-900/60 border border-zinc-750/30 hover:bg-zinc-800 dark:hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Copy code snippet"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column (1/3 width): Best Practices & Resources ─── */}
      <div className="space-y-6">
        {/* Security Best Practices */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-widest font-mono">
              Security Protocol
            </h3>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed font-semibold">
                <span className="text-slate-800 dark:text-zinc-300 font-bold">
                  Never expose keys
                </span>{" "}
                in client-side applications (React/NextJS frontend scripts).
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed font-semibold">
                <span className="text-slate-800 dark:text-zinc-300 font-bold">Limit lifespan</span>{" "}
                of keys used in script environments by creating short-lived credentials.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed font-semibold">
                <span className="text-slate-800 dark:text-zinc-300 font-bold">
                  Separate credentials
                </span>{" "}
                for development, testing, and production servers to isolate access logs.
              </p>
            </li>
          </ul>
        </div>

        {/* API Capabilities */}
        <div className="bg-white/50 dark:bg-zinc-950/20 rounded-md border border-slate-200/50 dark:border-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-widest font-mono">
              Authorized Scopes
            </h3>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 leading-relaxed">
            API credentials generated grant full read-write capabilities to the Ge&apos;ez NLP
            framework suite:
          </p>

          <div className="space-y-2 pt-1">
            {[
              "Ge'ez Character Normalization",
              "Sentence & Word Tokenizer",
              "Amharic Stopword Removal Filters",
              "Affix-Based Morphological Stemmer",
              "SERA / Felig Transliteration Engine",
            ].map((scope, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 font-semibold"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-450" />
                <span>{scope}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-900">
            <a
              href="https://fidel-tools.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-zinc-300 hover:underline cursor-pointer"
            >
              <span>Explore API Reference Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
