"use client";

import { useEffect, useState } from "react";
import { FiHardDrive, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "@/lib/api";
import {
  PageHeader,
  Button,
  IconButton,
  Badge,
  Card,
  EmptyState,
  Skeleton,
} from "@/components/ui";

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <PageHeader
        icon={<FiHardDrive className="h-5 w-5" />}
        title="File storage"
        description="Files are stored across your connected Google Drive accounts. When one fills up, add another — uploads roll over automatically."
        actions={
          status?.credsPresent && (
            <Button
              onClick={addAccount}
              disabled={busy}
              leadingIcon={<FiPlus />}
            >
              Add account
            </Button>
          )
        }
      />

      {msg && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            msg.kind === "ok"
              ? "border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300"
              : "border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      <Card padding="lg">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !status?.credsPresent ? (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-700 dark:text-amber-300">
            Google OAuth is not configured on the server. Set <code>GOOGLE_CLIENT_ID</code> and{" "}
            <code>GOOGLE_CLIENT_SECRET</code> in the backend environment, then reload.
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No Google account connected"
            description="No Google account connected yet. Connect one to enable uploads."
            action={
              <Button
                onClick={addAccount}
                disabled={busy}
                leadingIcon={<FiPlus />}
              >
                Connect Google Drive
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {accounts.map((a) => {
              const pct = a.usedBytes != null && a.limitBytes ? Math.min(100, (a.usedBytes / a.limitBytes) * 100) : null;
              return (
                <div key={a.email} className="flex items-center gap-3 py-3">
                  <span className={`text-lg ${a.status === "full" ? "text-amber-500" : "text-success-600 dark:text-success-400"}`}>●</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-slate-900 dark:text-slate-100">{a.email}</span>
                      <Badge variant={a.status === "full" ? "warning" : "neutral"} size="sm">{a.status}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {fmtBytes(a.usedBytes)} / {fmtBytes(a.limitBytes)} used{pct != null ? ` · ${pct.toFixed(0)}%` : ""}
                    </div>
                    {pct != null && (
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full ${pct > 90 ? "bg-amber-500" : "bg-success-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                  <IconButton
                    aria-label={`Remove ${a.email}`}
                    variant="ghost"
                    onClick={() => removeAccount(a.email)}
                    disabled={busy}
                    title="Remove account"
                    className="text-slate-400 hover:text-danger-600 dark:hover:text-danger-400"
                  >
                    <FiTrash2 />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
