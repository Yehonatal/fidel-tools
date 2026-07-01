"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Gamepad, Lock, Key, ShieldAlert, Eye, EyeOff } from "lucide-react";

export type LabMode = "academic" | "fun";

interface ModeContextType {
  mode: LabMode;
  toggleMode: () => void;
  setMode: (mode: LabMode) => void;
  isInitialized: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

function ModeTransitionLoader({ progress, targetMode }: { progress: number; targetMode: LabMode | null }) {
  const [msg, setMsg] = useState("");

  const funMsgs = [
    "INSERTING COIN...",
    "LOADING GAME ENGINE...",
    "COMPILING LINGUISTIC MAPS...",
    "READY PLAYER ONE!",
  ];

  useEffect(() => {
    if (targetMode === "fun") {
      const index = Math.min(Math.floor((progress / 100) * funMsgs.length), funMsgs.length - 1);
      setMsg(funMsgs[index]);
    }
  }, [progress, targetMode]);

  if (targetMode === "fun") {
    // Retro Arcade Loader
    return (
      <div className="fixed inset-0 z-[200000] bg-[#0c0a09] flex flex-col items-center justify-center font-mono text-amber-500 select-none">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes bounceJoystick {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-joystick {
              animation: bounceJoystick 0.5s ease infinite;
            }
          `
        }} />
        <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full px-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-joystick">
            <Gamepad className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-widest text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
              FIDEL PLAYGROUND
            </h3>
            <p className="text-[9px] font-bold tracking-[0.25em] text-orange-500">
              ★ SWITCHING TO ARCADE ★
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="w-full h-5 border-2 border-amber-500/60 p-0.5 rounded overflow-hidden bg-zinc-950">
              <div className="h-full bg-amber-500 transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold text-amber-405/80">
              <span className="truncate">{msg}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Developer Console SSH Loader (Matches the old logo loader with a custom graduation cap hat directly on logo + dev text)
  return (
    <div className="fixed inset-0 z-[200000] bg-[#fafafa] dark:bg-[#030303] flex flex-col items-center justify-center select-none text-zinc-900 dark:text-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes xp-char-slide {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(180%); }
          }
          .animate-xp-char {
            animation: xp-char-slide 6.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          .fade-mask {
            mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
          }
          @keyframes bounceCap {
            0%, 100% { transform: translateY(0) rotate(5deg); }
            50% { transform: translateY(-4px) rotate(-5deg); }
          }
          .animate-cap {
            animation: bounceCap 1.2s ease-in-out infinite;
          }
        `
      }} />

      <div className="flex flex-col items-center gap-4 max-w-xs w-full px-6 relative pt-10">
        {/* Logo text with left-to-right progress filling */}
        <div className="relative text-7xl font-light font-loga tracking-tight leading-none">
          {/* Custom SVG Graduation Cap Hat sitting on top of the first letter ፊ */}
          <div className="absolute -top-[32px] -left-[2px] select-none animate-cap z-20 origin-bottom">
            <svg 
              className="w-10 h-10 text-zinc-900 dark:text-white transition-colors duration-300"
              viewBox="0 0 32 32" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M16 6L28 11L16 16L4 11Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M8 13v4.5c0 2 3.5 3.5 8 3.5s8-1.5 8-3.5V13" />
              <path d="M16 11l8.5 3.5v5.5" />
              <circle cx="24.5" cy="20.5" r="1.2" fill="currentColor" />
            </svg>
          </div>

          {/* dev text sitting on top of the next two letters ደል */}
          <span className="absolute -top-[14px] left-[46px] text-xs font-mono font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
            dev
          </span>

          <span className="text-zinc-200 dark:text-zinc-905 transition-colors">ፊደል</span>
          <div
            className="absolute top-0 left-0 h-full overflow-hidden text-zinc-900 dark:text-white transition-all duration-75"
            style={{ width: `${progress}%` }}
          >
            <span className="whitespace-nowrap font-loga text-7xl font-light tracking-tight leading-none">
              ፊደል
            </span>
          </div>
        </div>

        {/* Sliding characters */}
        <div className="relative w-40 h-6 overflow-hidden fade-mask">
          <div className="absolute inset-0 flex items-center justify-start">
            <span className="animate-xp-char font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-650 dark:text-zinc-400 whitespace-nowrap">
              ሀ ሉ ሒ ማ ሜ ር ሶ ሿ ቁ ቢ ታ ቼ ኅ ኖ ኚ ኣ ኬ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeProviderInner({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LabMode>("academic");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [targetMode, setTargetMode] = useState<LabMode | null>(null);
  
  // Gate Security State
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [inputPasskey, setInputPasskey] = useState("");
  const [inputPassphrase, setInputPassphrase] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Intercept window.fetch to inject secret passkey + passphrase headers on client side
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const pk = sessionStorage.getItem("fidel-passkey") || "";
      const pp = sessionStorage.getItem("fidel-passphrase") || "";

      let targetUrl = "";
      if (typeof input === "string") {
        targetUrl = input;
      } else if (input instanceof URL) {
        targetUrl = input.pathname;
      } else if (input instanceof Request) {
        targetUrl = input.url;
      }

      // Automatically append headers on calls pointing to local proxy route
      if (pk && pp && (targetUrl.startsWith("/api/") || targetUrl.includes("/api/"))) {
        const newInit = { ...init };
        const headersObj = new Headers(newInit.headers || {});
        headersObj.set("x-passkey", pk);
        headersObj.set("x-passphrase", pp);
        newInit.headers = headersObj;
        return originalFetch(input, newInit);
      }

      return originalFetch(input, init);
    };

    // Check credentials inside sessionStorage
    const savedPk = sessionStorage.getItem("fidel-passkey");
    const savedPp = sessionStorage.getItem("fidel-passphrase");

    if (savedPk && savedPp) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  // Load mode from localStorage or URL on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("fidel-lab-mode") as LabMode | null;
    const urlMode = searchParams.get("mode") as LabMode | null;

    let initialMode: LabMode = "academic";

    if (urlMode === "fun" || urlMode === "academic") {
      initialMode = urlMode;
    } else if (savedMode === "fun" || savedMode === "academic") {
      initialMode = savedMode;
    }

    setModeState(initialMode);
    localStorage.setItem("fidel-lab-mode", initialMode);
    setIsInitialized(true);
  }, [searchParams]);

  const setMode = (newMode: LabMode) => {
    if (newMode === mode) return;

    // Trigger transition loader
    setTargetMode(newMode);
    setIsTransitioning(true);
    setTransitionProgress(0);

    const duration = 1400; // Fast and dramatic
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setTransitionProgress(100);
        
        // Complete transition
        setModeState(newMode);
        localStorage.setItem("fidel-lab-mode", newMode);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", newMode);
        router.replace(`${pathname}?${params.toString()}`);
        
        setTimeout(() => {
          setIsTransitioning(false);
          setTargetMode(null);
        }, 350);
      } else {
        setTransitionProgress(currentProgress);
      }
    }, intervalTime);
  };

  const toggleMode = () => {
    setMode(mode === "academic" ? "fun" : "academic");
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPasskey || !inputPassphrase) {
      setErrorMsg("Both Passkey and Passphrase are required.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      // Test key verification against languages API
      const res = await fetch("/api/languages", {
        headers: {
          "x-passkey": inputPasskey,
          "x-passphrase": inputPassphrase,
        },
      });

      if (res.ok) {
        sessionStorage.setItem("fidel-passkey", inputPasskey);
        sessionStorage.setItem("fidel-passphrase", inputPassphrase);
        setIsUnlocked(true);
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.message || "Invalid passkey or passphrase. Access denied.");
      }
    } catch (err) {
      setErrorMsg("Failed to verify access. Ensure the API server is listening.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isUnlocked === null) {
    return null; // Prevent SSR Hydration Mismatch Flashes
  }

  // Render Gate Lock screen if unauthorized
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[150000] bg-zinc-950 flex items-center justify-center font-sans overflow-y-auto px-4 py-8">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes scanline {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            .scanline-effect {
              position: absolute;
              inset: 0;
              background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.03) 50%, transparent);
              animation: scanline 8s linear infinite;
              pointer-events: none;
            }
          `
        }} />
        <div className="scanline-effect" />

        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 leading-none select-none">
                <span className="font-loga text-2xl font-light text-white">
                  ፊደል
                </span>
                <span className="font-sans font-semibold text-zinc-400 text-sm mt-1">
                  LAB
                </span>
              </div>
              <p className="text-[11px] font-bold font-mono tracking-widest text-zinc-550 uppercase">
                API GATEWAY SECURITY LOCK
              </p>
            </div>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              This sandbox accesses high-performance natural language models. Please enter your credentials to activate your terminal session.
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-zinc-500" /> Security Passkey
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? "text" : "password"}
                  value={inputPasskey}
                  onChange={(e) => setInputPasskey(e.target.value)}
                  placeholder="fidel_passkey_..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-650 hover:text-zinc-300 transition-colors"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-zinc-500" /> Secret Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassphrase ? "text" : "password"}
                  value={inputPassphrase}
                  onChange={(e) => setInputPassphrase(e.target.value)}
                  placeholder="Enter secret developer phrase..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-650 hover:text-zinc-300 transition-colors"
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/60 rounded-lg p-3 text-[11px] text-red-400 leading-relaxed font-sans animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 disabled:opacity-50 text-white rounded-lg py-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isVerifying ? "Verifying Token..." : "Authenticate Session"}
            </button>
          </form>

          {/* Console footer logs */}
          <div className="mt-8 border-t border-zinc-850 pt-4 flex flex-col gap-1 text-[8px] font-mono text-zinc-600">
            <div>[SYS] SYSTEM ENCRYPTION KEY VALIDATION: ACTIVE</div>
            <div>[SYS] SESSION STATUS: WAITING FOR TOKEN RESPONSE</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode, isInitialized }}>
      {isTransitioning && (
        <ModeTransitionLoader progress={transitionProgress} targetMode={targetMode} />
      )}
      {children}
    </ModeContext.Provider>
  );
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <ModeProviderInner>{children}</ModeProviderInner>
    </React.Suspense>
  );
}

export function useLabMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useLabMode must be used within a ModeProvider");
  }
  return context;
}
