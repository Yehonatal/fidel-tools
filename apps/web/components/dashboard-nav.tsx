"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
  BookOpen,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    category: "Developer Cloud",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Execution Console",
        href: "/dashboard/playground",
        icon: <Terminal className="w-4 h-4" />,
      },
      {
        label: "API Keys",
        href: "/dashboard/api-keys",
        icon: <Key className="w-4 h-4" />,
      },
      {
        label: "Usage Analytics",
        href: "/dashboard/usage",
        icon: <BarChart3 className="w-4 h-4" />,
      },
    ],
  },
  {
    category: "Management",
    items: [
      {
        label: "Console Settings",
        href: "/dashboard/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  },
  {
    category: "Resources",
    items: [
      {
        label: "Documentation",
        href: "/docs",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        label: "Monorepo SDKs",
        href: "/packages",
        icon: <Layers className="w-4 h-4" />,
      },
      {
        label: "Changelog Updates",
        href: "/changelog",
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
  },
];

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fidel-sidebar-collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
    setMounted(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("fidel-sidebar-collapsed", String(nextState));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <aside
      className={`border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#070709] flex flex-col h-screen sticky top-0 shrink-0 font-sans transition-all duration-300 ease-in-out relative z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ── Top Workspace Switcher Header ─────────────────────────── */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-900 flex flex-col gap-2 relative">
        <div className="flex items-center justify-between gap-2">
          {/* Workspace selector mock */}
          {!isCollapsed ? (
            <div className="flex-1 flex items-center gap-2.5 px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 select-none shadow-xs">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold font-mono">
                ፊ
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate leading-none">
                  Yehonatal
                </p>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5 leading-none">
                  fidel-tools
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center py-1.5 select-none">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-md">
                ፊ
              </div>
            </div>
          )}

          {/* Top Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 border border-transparent transition-all cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expand trigger when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-900 flex justify-center">
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40 cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Navigation Categories ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navCategories.map((cat) => (
          <div key={cat.category} className="space-y-1.5">
            {/* Category Header */}
            {!isCollapsed ? (
              <h3 className="px-2 text-[9px] font-bold font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                {cat.category}
              </h3>
            ) : (
              <div className="border-b border-zinc-200 dark:border-zinc-900 mx-2 my-2" />
            )}

            {/* Menu Items */}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded text-xs transition-all duration-150 relative ${
                      isCollapsed ? "justify-center p-2.5" : "gap-3 px-2 py-2"
                    } ${
                      isActive
                        ? "bg-zinc-200/50 dark:bg-zinc-900/55 text-zinc-900 dark:text-white font-bold"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/35 dark:hover:bg-zinc-900/25 font-semibold"
                    }`}
                  >
                    {/* Active left indicator line */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-[20%] w-0.5 h-[60%] rounded bg-blue-500" />
                    )}

                    <span
                      className={
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="flex-grow text-left leading-none">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Theme Toggle container */}
      {isCollapsed && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-900 flex justify-center">
          <ThemeToggle />
        </div>
      )}

      {/* ── Bottom Section (Cohesive User Profile Card) ─────────────── */}
      <div className="border-t border-zinc-200 dark:border-zinc-900 p-3 bg-zinc-100/15 dark:bg-zinc-950/20 mt-auto">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User row */}
            <div className="flex items-center justify-between gap-2.5 px-1.5 py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-450 text-xs font-bold shrink-0 relative">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-50 dark:border-[#070709] animate-pulse-soft" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate leading-none">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-1 leading-none font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/65 dark:border-zinc-900/60">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all cursor-pointer border border-transparent"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-450 text-xs font-bold shrink-0 relative cursor-help"
              title={`${user.name} (${user.email})`}
            >
              {user.name?.charAt(0)?.toUpperCase() || "?"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-50 dark:border-[#070709]" />
            </div>

            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center border border-transparent"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
