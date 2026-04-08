"use client";
/**
 * Platform Storage — Control Panel page (super_admin only).
 *
 * Two responsibilities:
 *   1. Storage Add-on Pricing: edit the platform-wide per-GB monthly/yearly
 *      prices that every customer sees in the Task-Manager "Buy More Storage"
 *      modal. Backed by PlatformSettings (auto-seeded on first read).
 *   2. All Companies storage usage: real-time aggregation showing which
 *      tenant uses how much, sorted by hoarders descending, with platform
 *      totals at the top.
 *
 * Backend routes (all super_admin gated via requireSuperAdmin middleware):
 *   GET   /api/admin/storage/pricing
 *   PUT   /api/admin/storage/pricing
 *   GET   /api/admin/storage/all-companies
 */

import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import { toast } from "react-toastify";
import {
  FiHardDrive, FiRefreshCw, FiAlertTriangle, FiEdit3, FiSave, FiX,
} from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────────────────────────

type Pricing = {
  currency: string;
  monthly: { pricePerGB: number; billingCycle: string; description: string };
  yearly: {
    pricePerGB: number;
    effectivePerMonth: number;
    savingsPercent: number;
    billingCycle: string;
    description: string;
  };
};

type CompanyRow = {
  companyId: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  usedBytes: number;
  usedMB: number;
  usedGB: number;
  quotaMB: number;
  quotaGB: number;
  availableMB: number;
  usagePercentage: number;
  fileCount: number;
  addOnMB: number;
  activeSubsCount: number;
};

type AllCompaniesResponse = {
  totalCompanies: number;
  platformTotal: {
    usedBytes: number;
    usedGB: number;
    quotaMB: number;
    quotaGB: number;
    totalFiles: number;
  };
  companies: CompanyRow[];
  lastSyncedAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : 1)} ${units[i]}`;
}

function formatMB(mb: number): string {
  if (!mb || mb < 0) return "0 MB";
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function barColor(percent: number): string {
  if (percent >= 95) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  if (percent >= 60) return "bg-yellow-500";
  return "bg-emerald-500";
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PlatformStoragePage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [allCompanies, setAllCompanies] = useState<AllCompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pricing edit state
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    monthly: "" as string | number,
    yearly: "" as string | number,
    currency: "INR",
  });
  const [savingPricing, setSavingPricing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setRefreshing(true);
      const [pricingRes, allRes] = await Promise.all([
        api.get<Pricing>("/admin/storage/pricing"),
        api.get<AllCompaniesResponse>("/admin/storage/all-companies"),
      ]);
      setPricing(pricingRes.data);
      setAllCompanies(allRes.data);
    } catch (err: any) {
      console.error("Failed to load platform storage:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load platform storage"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Pricing edit handlers ────────────────────────────────────────────────
  const startEditPricing = () => {
    setPricingForm({
      monthly: pricing?.monthly?.pricePerGB ?? "",
      yearly: pricing?.yearly?.pricePerGB ?? "",
      currency: pricing?.currency ?? "INR",
    });
    setEditingPricing(true);
  };

  const cancelEditPricing = () => setEditingPricing(false);

  const savePricing = async () => {
    const m = parseFloat(String(pricingForm.monthly));
    const y = parseFloat(String(pricingForm.yearly));
    if (!Number.isFinite(m) || m <= 0 || !Number.isFinite(y) || y <= 0) {
      toast.error("Both monthly and yearly prices must be positive numbers");
      return;
    }
    if (!pricingForm.currency || pricingForm.currency.length > 5) {
      toast.error("Currency must be a 1-5 letter code (e.g. INR, USD, EUR)");
      return;
    }
    try {
      setSavingPricing(true);
      const { data } = await api.put("/admin/storage/pricing", {
        monthly: m,
        yearly: y,
        currency: pricingForm.currency.toUpperCase(),
      });
      toast.success(data?.message || "Pricing updated");
      setEditingPricing(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update pricing");
    } finally {
      setSavingPricing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-slate-500">
          Loading platform storage…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* ─── Header ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-md">
              <FiHardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Platform Storage
              </h1>
              <p className="text-sm text-slate-500">
                Storage pricing & all-company usage across the platform
              </p>
            </div>
          </div>
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ─── Pricing Management ──────────────────────────────── */}
        {pricing && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Storage Add-on Pricing
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Platform-wide pricing for storage subscriptions. Auto-seeded
                  from env defaults on first run, then editable here. Changes
                  apply immediately to NEW purchases. Existing subscriptions
                  stay at their original locked-in price for life.
                </p>
              </div>
              {!editingPricing && (
                <button
                  onClick={startEditPricing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <FiEdit3 className="w-3.5 h-3.5" /> Edit Prices
                </button>
              )}
            </div>

            {!editingPricing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase">Monthly</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {pricing.monthly?.pricePerGB} {pricing.currency}
                  </div>
                  <div className="text-xs text-slate-500">per GB / month</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase">Yearly</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {pricing.yearly?.pricePerGB} {pricing.currency}
                  </div>
                  <div className="text-xs text-slate-500">
                    per GB / year ({pricing.yearly?.effectivePerMonth}/mo · save {pricing.yearly?.savingsPercent}%)
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase">Currency</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {pricing.currency}
                  </div>
                  <div className="text-xs text-slate-500">platform-wide</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 uppercase mb-1">
                      Monthly per GB
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pricingForm.monthly}
                      onChange={(e) =>
                        setPricingForm((p) => ({ ...p, monthly: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 uppercase mb-1">
                      Yearly per GB
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pricingForm.yearly}
                      onChange={(e) =>
                        setPricingForm((p) => ({ ...p, yearly: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      Tip: keep below{" "}
                      {Number(pricingForm.monthly) > 0
                        ? (Number(pricingForm.monthly) * 12).toFixed(0)
                        : "..."}{" "}
                      for a real discount
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 uppercase mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={pricingForm.currency}
                      onChange={(e) =>
                        setPricingForm((p) => ({
                          ...p,
                          currency: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      placeholder="INR"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={cancelEditPricing}
                    disabled={savingPricing}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <FiX className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={savePricing}
                    disabled={savingPricing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors"
                  >
                    {savingPricing ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" /> Save Pricing
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <FiAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    New prices apply only to <strong>future purchases</strong>.
                    All existing subscriptions keep their original locked-in
                    price for the lifetime of that subscription.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── All Companies table ─────────────────────────────── */}
        {allCompanies && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                All Companies — Storage Usage
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {allCompanies.totalCompanies} companies · Platform total:{" "}
                <span className="font-semibold text-slate-700">
                  {allCompanies.platformTotal.usedGB} GB used
                </span>{" "}
                of {allCompanies.platformTotal.quotaGB} GB allocated ·{" "}
                {allCompanies.platformTotal.totalFiles.toLocaleString()} files
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3 text-right">Used</th>
                    <th className="px-6 py-3 text-right">Quota</th>
                    <th className="px-6 py-3 text-right">Files</th>
                    <th className="px-6 py-3 text-right">Add-ons</th>
                    <th className="px-6 py-3 w-1/4">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allCompanies.companies.map((c, i) => (
                    <tr
                      key={c.companyId}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">
                          {c.code} · {c.status}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 capitalize">
                        {c.plan}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-900">
                        {formatBytes(c.usedBytes)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm text-slate-600">
                        {formatMB(c.quotaMB)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm text-slate-600">
                        {c.fileCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-slate-500">
                        {c.activeSubsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                            {c.activeSubsCount}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${barColor(c.usagePercentage)}`}
                              style={{
                                width: `${Math.min(100, c.usagePercentage).toFixed(1)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 min-w-[42px] text-right">
                            {c.usagePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
