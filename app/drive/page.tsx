"use client";

import { useEffect, useState } from "react";
import { FiHardDrive, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "@/lib/api";

interface DriveAccount {
  email: string;
  status: "active" | "full" | "disabled";
  priority: number;
  connectedAt?: string;
  usedBytes: number | null;
  limitBytes: number | null;
}
interface DriveStatus {
  credsPresent: boolean;
  connected: boolean;
  accounts: DriveAccount[];
}

function fmtBytes(n: number | null): string {
  if (n == null) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export default function DriveConnectionPage() {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<DriveStatus>("/storage/gdrive/status");
      setStatus(data);
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.response?.data?.error || "Could not load status" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("gdrive");
    if (result === "connected") setMsg({ kind: "ok", text: "Google Drive account connected." });
    else if (result === "denied") setMsg({ kind: "err", text: "Connection cancelled." });
    else if (result === "error") setMsg({ kind: "err", text: `Could not connect: ${params.get("reason") || "unknown error"}` });
    if (result) window.history.replaceState({}, "", "/drive");
    void load();
  }, []);

  async function addAccount() {
    setBusy(true);
    try {
      const { data } = await api.get<{ url: string }>("/storage/gdrive/connect");
      window.location.href = data.url;
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.response?.data?.error || "Could not start connection" });
      setBusy(false);
    }
  }

  async function removeAccount(email: string) {
    if (!confirm(`Remove ${email}? Files stored on it will stop loading.`)) return;
    setBusy(true);
    try {
      await api.post("/storage/gdrive/remove", { email });
      setMsg({ kind: "ok", text: `Removed ${email}` });
      await load();
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.response?.data?.error || "Could not remove" });
    } finally {
      setBusy(false);
    }
  }

  const accounts = status?.accounts ?? [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
            <FiHardDrive className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">File storage</h1>
            <p className="text-sm text-gray-500">
              Files are stored across your connected Google Drive accounts. When one fills up, add
              another — uploads roll over automatically.
            </p>
          </div>
        </div>
        {status?.credsPresent && (
          <button onClick={addAccount} disabled={busy} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            <FiPlus /> Add account
          </button>
        )}
      </div>

      {msg && (
        <div className={`mb-4 rounded-lg border p-3 text-sm ${msg.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="rounded-xl border bg-white p-6">
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : !status?.credsPresent ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Google OAuth is not configured on the server. Set <code>GOOGLE_CLIENT_ID</code> and{" "}
            <code>GOOGLE_CLIENT_SECRET</code> in the backend environment, then reload.
          </div>
        ) : accounts.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">No Google account connected yet. Connect one to enable uploads.</p>
            <button onClick={addAccount} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <FiPlus /> Connect Google Drive
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {accounts.map((a) => {
              const pct = a.usedBytes != null && a.limitBytes ? Math.min(100, (a.usedBytes / a.limitBytes) * 100) : null;
              return (
                <div key={a.email} className="flex items-center gap-3 py-3">
                  <span className={`text-lg ${a.status === "full" ? "text-amber-500" : "text-emerald-600"}`}>●</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{a.email}</span>
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">{a.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {fmtBytes(a.usedBytes)} / {fmtBytes(a.limitBytes)} used{pct != null ? ` · ${pct.toFixed(0)}%` : ""}
                    </div>
                    {pct != null && (
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full ${pct > 90 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeAccount(a.email)} disabled={busy} className="text-gray-400 hover:text-red-600 disabled:opacity-50" title="Remove account">
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
