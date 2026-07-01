"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import apiDocs from "@/lib/api-docs.json";
import {
  Search,
  BookOpen,
  Play,
  Copy,
  Check,
  Lock,
  Unlock,
  Terminal,
  Activity,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Send,
  Loader2,
  RefreshCw
} from "lucide-react";

type LanguageTab = "curl" | "javascript" | "python";
type TabType = "documentation" | "try-it";

interface RequestParam {
  type: string;
  required: boolean;
  description: string;
  example: any;
}

interface Endpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  category: string;
  description: string;
  auth: boolean;
  requestBody: Record<string, RequestParam>;
  responses: Record<string, { description: string; example: any }>;
}

export default function DocsPage() {
  const { data: session } = useSession();
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("pipeline");
  const [activeTab, setActiveTab] = useState<TabType>("documentation");
  const [activeLang, setActiveLang] = useState<LanguageTab>("curl");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);
  const [apiKey, setApiKey] = useState<string>("fidel_dev_key_2026");

  // Interactive tester states
  const [requestJson, setRequestJson] = useState<string>("");
  const [isValidJson, setIsValidJson] = useState(true);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Client side mounted check to prevent hydration mismatch
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.fidel.tools");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const url = window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : "https://api.fidel.tools";
      setApiBaseUrl(url);
    }
  }, []);

  // Cast imports to types safely
  const docInfo = apiDocs.info;
  const endpoints = apiDocs.endpoints as unknown as Endpoint[];

  const selectedEndpoint = useMemo(() => {
    return endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];
  }, [endpoints, selectedEndpointId]);

  // Initialize request JSON when endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      // Build a clean default JSON object based on requestBody examples
      const defaultBody: Record<string, any> = {};
      Object.entries(selectedEndpoint.requestBody).forEach(([key, param]) => {
        defaultBody[key] = param.example;
      });
      setRequestJson(JSON.stringify(defaultBody, null, 2));
      setIsValidJson(true);
      // Reset tester responses
      setResponseBody(null);
      setResponseStatus(null);
      setExecutionTime(null);
    }
  }, [selectedEndpoint]);

  // Handle JSON input modifications
  const handleJsonChange = (val: string) => {
    setRequestJson(val);
    try {
      JSON.parse(val);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  // Group endpoints by category
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((e) => {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [endpoints, searchQuery]);

  const categories = useMemo(() => {
    const cats: Record<string, Endpoint[]> = {};
    filteredEndpoints.forEach((e) => {
      if (!cats[e.category]) {
        cats[e.category] = [];
      }
      cats[e.category].push(e);
    });
    return cats;
  }, [filteredEndpoints]);

  // Dynamic code snippet generator
  const codeSnippets = useMemo(() => {
    if (!selectedEndpoint) return { curl: "", javascript: "", python: "" };

    const parsedBody = isValidJson ? requestJson : "{}";
    const fullUrl = `${apiBaseUrl}${selectedEndpoint.path}`;
    const cleanJsonString = parsedBody.replace(/\n/g, "\n  ");

    const curl = `curl -X ${selectedEndpoint.method} ${fullUrl} \\
  -H "Content-Type: application/json" \\
  ${selectedEndpoint.auth ? `-H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\` : ""}
  ${selectedEndpoint.method !== "GET" ? `-d '${parsedBody}'` : ""}`;

    const javascript = `const response = await fetch("${fullUrl}", {
  method: "${selectedEndpoint.method}",
  headers: {
    "Content-Type": "application/json",
    ${selectedEndpoint.auth ? `"x-api-key": "${apiKey || "YOUR_API_KEY"}"` : ""}
  }${selectedEndpoint.method !== "GET" ? `,
  body: JSON.stringify(${cleanJsonString})` : ""}
});

const data = await response.json();
console.log(data);`;

    const python = `import requests

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",
    ${selectedEndpoint.auth ? `"x-api-key": "${apiKey || "YOUR_API_KEY"}"` : ""}
}
${
  selectedEndpoint.method !== "GET"
    ? `payload = ${parsedBody}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, json=payload, headers=headers)`
    : `response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers)`
}

print(response.json())`;

    return { curl, javascript, python };
  }, [selectedEndpoint, apiKey, requestJson, isValidJson, apiBaseUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Perform real API call in interactive tester
  const runTestRequest = async () => {
    if (!isValidJson || isLoading) return;
    setIsLoading(true);
    setResponseBody(null);
    setResponseStatus(null);
    setExecutionTime(null);

    const startTime = performance.now();
    const fullUrl = `${apiBaseUrl}${selectedEndpoint.path}`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (selectedEndpoint.auth && apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method !== "GET") {
        options.body = requestJson;
      }

      const res = await fetch(fullUrl, options);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json().catch(() => null);
      setResponseBody(json || { message: `Request completed with status ${res.status}` });
    } catch (err: any) {
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseBody({
        error: "Connection Failed",
        message: err.message || "Failed to make request. Ensure the API server is active.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
      
      {/* ── Left Sidebar Navigation ──────────────────────────────────── */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Search API endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg text-xs font-semibold placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(categories).length === 0 ? (
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 py-4 text-center">
              No matching endpoints
            </p>
          ) : (
            Object.entries(categories).map(([cat, list]) => (
              <div key={cat} className="space-y-2">
                <h3 className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
                  {cat}
                </h3>
                <div className="space-y-1">
                  {list.map((e) => {
                    const active = e.id === selectedEndpointId;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEndpointId(e.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-md transition-all text-left text-xs font-bold ${
                          active
                            ? "bg-slate-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono ${
                              e.method === "POST"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/15"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                            }`}
                          >
                            {e.method}
                          </span>
                          <span className="truncate">{e.name}</span>
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                            active ? "opacity-100 text-blue-600 dark:text-blue-400" : ""
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Details Column & Code panel ─────────────────────────── */}
      <main className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Detail Center column */}
        <section className="xl:col-span-3 space-y-6">
          
          {/* Header info */}
          <div className="space-y-3 pb-5 border-b border-slate-200/50 dark:border-zinc-900">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                  selectedEndpoint.method === "POST"
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/15"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                {selectedEndpoint.path}
              </span>
            </div>
            
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {selectedEndpoint.name}
            </h1>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {selectedEndpoint.description}
            </p>
          </div>

          {/* Toggle Tab Bar */}
          <div className="flex border-b border-slate-200 dark:border-zinc-900">
            <button
              onClick={() => setActiveTab("documentation")}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "documentation"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab("try-it")}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "try-it"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Try It Out
            </button>
          </div>

          {activeTab === "documentation" ? (
            <div className="space-y-6">
              
              {/* Security info */}
              {selectedEndpoint.auth && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#070709] flex gap-3.5 items-start">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                      Authentication Required
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      This endpoint is protected. Provide your API key in the{" "}
                      <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/80 px-1 py-0.5 rounded">
                        x-api-key
                      </code>{" "}
                      header or as a Bearer token in the{" "}
                      <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/80 px-1 py-0.5 rounded">
                        Authorization
                      </code>{" "}
                      header.
                    </p>
                  </div>
                </div>
              )}

              {/* Request Parameters section */}
              {Object.keys(selectedEndpoint.requestBody).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
                    Request Parameters (JSON Body)
                  </h3>
                  <div className="border border-slate-200 dark:border-zinc-900 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-900">
                          <th className="p-3 text-[10px] font-bold uppercase font-mono text-zinc-550 dark:text-zinc-400">
                            Parameter
                          </th>
                          <th className="p-3 text-[10px] font-bold uppercase font-mono text-zinc-550 dark:text-zinc-400">
                            Type
                          </th>
                          <th className="p-3 text-[10px] font-bold uppercase font-mono text-zinc-550 dark:text-zinc-400">
                            Required
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedEndpoint.requestBody).map(([name, schema]) => (
                          <tr
                            key={name}
                            className="border-b border-slate-100 dark:border-zinc-900/50 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20"
                          >
                            <td className="p-3">
                              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-200">
                                {name}
                              </span>
                              <p className="text-[11px] text-zinc-550 dark:text-zinc-400 mt-1 leading-relaxed font-semibold">
                                {schema.description}
                              </p>
                            </td>
                            <td className="p-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                              {schema.type}
                            </td>
                            <td className="p-3">
                              {schema.required ? (
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wide">
                                  Optional
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Response fields section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-550 dark:text-zinc-400 uppercase">
                  Response (200 Success JSON)
                </h3>
                <div className="relative">
                  <pre className="bg-zinc-950 text-zinc-300 p-4 rounded-xl font-mono text-[11px] border border-zinc-900 overflow-x-auto select-text leading-relaxed">
                    {JSON.stringify(selectedEndpoint.responses["200"].example, null, 2)}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(selectedEndpoint.responses["200"].example, null, 2)
                      )
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Try it out Interactive Panel */
            <div className="space-y-6">
              
              {/* API Key inputs */}
              {selectedEndpoint.auth && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 dark:text-zinc-450 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3" /> API KEY Header
                  </label>
                  <input
                    type="password"
                    placeholder="Enter x-api-key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] rounded-lg text-xs font-mono placeholder-zinc-500 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                    Prefilled with <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">fidel_dev_key_2026</code> (default testing key).
                  </p>
                </div>
              )}

              {/* JSON Body editor */}
              {Object.keys(selectedEndpoint.requestBody).length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 dark:text-zinc-450 uppercase">
                      Request JSON Payload
                    </label>
                    {!isValidJson && (
                      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Invalid JSON
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={requestJson}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-mono text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 transition-all ${
                      isValidJson
                        ? "border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#070709] focus:border-blue-500 focus:ring-blue-500"
                        : "border-red-500 bg-red-500/[0.02] focus:border-red-500 focus:ring-red-500"
                    }`}
                  />
                </div>
              )}

              {/* Action trigger button */}
              <button
                onClick={runTestRequest}
                disabled={!isValidJson || isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request to API
                  </>
                )}
              </button>

              {/* Tester Response panel */}
              {(responseStatus !== null || responseBody !== null) && (
                <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-zinc-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-550 dark:text-zinc-450 uppercase">
                      Response Output
                    </h3>
                    <div className="flex items-center gap-3">
                      {executionTime !== null && (
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {executionTime}ms
                        </span>
                      )}
                      {responseStatus !== null && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                            responseStatus >= 200 && responseStatus < 300
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15"
                              : "bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/15"
                          }`}
                        >
                          Status {responseStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-xl font-mono text-[11px] border border-zinc-900 overflow-x-auto select-text leading-relaxed max-h-96">
                      {JSON.stringify(responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          )}

        </section>

        {/* Code Snippet Switcher column */}
        <section className="xl:col-span-2 space-y-4">
          <div className="bg-[#09090b] border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden flex flex-col h-fit sticky top-20">
            
            {/* Header / Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-black/40 p-2.5 flex items-center justify-between">
              <div className="flex gap-1.5">
                {(["curl", "javascript", "python"] as LanguageTab[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase transition-all cursor-pointer ${
                      activeLang === lang
                        ? "bg-zinc-800 dark:bg-zinc-850 text-white"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {lang === "javascript" ? "JS (fetch)" : lang === "python" ? "Python" : "cURL"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(codeSnippets[activeLang])}
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                title="Copy Code"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Snippet Code block */}
            <div className="p-4 bg-zinc-950 font-mono text-[10.5px] text-zinc-300 select-text overflow-x-auto leading-relaxed whitespace-pre min-h-60 max-h-[500px]">
              {codeSnippets[activeLang]}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
