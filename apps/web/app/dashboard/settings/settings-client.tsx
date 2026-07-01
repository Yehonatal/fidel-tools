"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User, Lock, AlertTriangle, ShieldAlert, Check, X } from "lucide-react";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();

  // ── Profile ──────────────────────────────────────
  const [name, setName] = useState(user.name);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await authClient.updateUser({ name });
      setProfileMsg("Profile updated successfully.");
      router.refresh();
    } catch {
      setProfileMsg("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Password ─────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      await authClient.changePassword({
        currentPassword: currentPwd,
        newPassword: newPwd,
        revokeOtherSessions: true,
      });
      setPwdMsg("Password changed. Other sessions revoked.");
      setCurrentPwd("");
      setNewPwd("");
    } catch {
      setPwdMsg("Failed to change password. Check your current password.");
    } finally {
      setPwdSaving(false);
    }
  }

  // ── Delete Account ───────────────────────────────
  const [showDelete, setShowDelete] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await authClient.deleteUser({ password: deletePwd });
      router.push("/");
    } catch {
      alert("Failed to delete account. Check your password.");
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all";

  const btnClass =
    "px-4 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5 border border-transparent";

  return (
    <div className="space-y-6 font-sans">
      {/* Profile Section */}
      <div className="glass-card rounded-md p-5 border border-slate-200 dark:border-zinc-800/80">
        <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          Profile Credentials
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          {profileMsg && (
            <p
              className={`text-xs font-bold flex items-center gap-1 ${profileMsg.includes("Failed") ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {profileMsg.includes("Failed") ? null : <Check className="w-3.5 h-3.5" />}
              {profileMsg}
            </p>
          )}
          <button type="submit" disabled={profileSaving} className={btnClass}>
            {profileSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="glass-card rounded-md p-5 border border-slate-200 dark:border-zinc-800/80">
        <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label
              htmlFor="current-password"
              className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>
          {pwdMsg && (
            <p
              className={`text-xs font-bold flex items-center gap-1 ${
                pwdMsg.includes("Failed")
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {pwdMsg.includes("Failed") ? null : <Check className="w-3.5 h-3.5" />}
              {pwdMsg}
            </p>
          )}
          <button type="submit" disabled={pwdSaving} className={btnClass}>
            {pwdSaving ? "Changing…" : "Change password"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-md border border-red-500/20 dark:border-red-900/40 p-5 bg-red-500/[0.01]">
        <h2 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {showDelete ? (
          <div className="space-y-3 max-w-md animate-fade-in">
            <input
              type="password"
              value={deletePwd}
              onChange={(e) => setDeletePwd(e.target.value)}
              placeholder="Confirm your password"
              className={inputClass}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting || !deletePwd}
                className="px-4 py-2 rounded-md text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeletePwd("");
                }}
                className="px-3 py-2 rounded-md text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/40 border border-transparent transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-md text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10 dark:hover:bg-red-500/5 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
