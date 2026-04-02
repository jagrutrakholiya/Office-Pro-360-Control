"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type HealthData = {
  status?: string;
  uptime?: number;
  version?: string;
  environment?: string;
  database?: {
    status?: string;
    name?: string;
  };
  memory?: {
    rss?: number;
    heapUsed?: number;
    heapTotal?: number;
  };
};

type PaymentConfig = {
  configured?: boolean;
  provider?: string;
};

export default function SystemPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [seedingPlans, setSeedingPlans] = useState(false);

  async function loadHealth() {
    setLoading(true);
    try {
      const [healthRes, paymentRes] = await Promise.allSettled([
        api.get("/health"),
        api.get("/payment/config"),
      ]);

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value.data);
      }
      if (paymentRes.status === "fulfilled") {
        setPaymentConfig(paymentRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load system health", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  function formatUptime(seconds?: number): string {
    if (!seconds) return "N/A";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  }

  function formatBytes(bytes?: number): string {
    if (!bytes) return "N/A";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function seedPlans() {
    if (!confirm("This will seed default plans. Continue?")) return;
    setSeedingPlans(true);
    try {
      await api.post("/admin/plans/seed");
      alert("Default plans seeded successfully.");
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSeedingPlans(false);
    }
  }

  const dbStatus = health?.database?.status || "unknown";
  const dbColor =
    dbStatus === "connected" || dbStatus === "ok"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const serverColor =
    health?.status === "ok" || health?.status === "healthy"
      ? "bg-green-100 text-green-700"
      : health
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">System Health</h2>
            <p className="section-subtitle">
              Monitor server status, database, and configuration
            </p>
          </div>
          <button onClick={loadHealth} className="btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-slate-600 font-medium">Checking system health...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Server Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Server Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</div>
                <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${serverColor}`}>
                  {health?.status || "Unknown"}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Uptime</div>
                <div className="text-lg font-bold text-slate-900">
                  {formatUptime(health?.uptime)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Version</div>
                <div className="text-lg font-bold text-slate-900">
                  {health?.version || "N/A"}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Environment</div>
                <div className="text-lg font-bold text-slate-900">
                  {health?.environment || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Database</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">MongoDB Status</div>
                <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${dbColor}`}>
                  {dbStatus}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Database Name</div>
                <div className="text-lg font-bold text-slate-900">
                  {health?.database?.name || "N/A"}
                </div>
              </div>
              {health?.memory && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Memory Usage</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatBytes(health.memory.heapUsed)} / {formatBytes(health.memory.heapTotal)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">NODE_ENV</div>
                <div className="text-sm font-bold text-slate-900">
                  {health?.environment || "N/A"}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Razorpay</div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    paymentConfig?.configured
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {paymentConfig?.configured ? "Configured" : "Not Configured"}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Email</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                  Check Server Logs
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Firebase</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                  Check Server Logs
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={seedPlans}
                disabled={seedingPlans}
                className="btn-primary"
              >
                {seedingPlans ? "Seeding..." : "Seed Default Plans"}
              </button>
              <button
                onClick={() => alert("API cache clearing is not yet implemented.")}
                className="btn-secondary"
              >
                Clear API Cache
              </button>
            </div>
          </div>

          {/* Recent Errors */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Errors</h3>
            <div className="text-center py-8 text-slate-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm mt-1">Error tracking will be available in a future update.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
