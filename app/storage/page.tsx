"use client";
/**
 * Platform Storage — Control Panel page (super_admin only).
 *
 * Two responsibilities:
 * 1. Storage Add-on Pricing: edit the platform-wide per-GB monthly/yearly
 * prices that every customer sees in the Task-Manager "Buy More Storage"
 * modal. Backed by PlatformSettings (auto-seeded on first read).
 * 2. All Companies storage usage: real-time aggregation showing which
 * tenant uses how much, sorted by hoarders descending, with platform
 * totals at the top.
 *
 * Backend routes (all super_admin gated via requireSuperAdmin middleware):
 * GET /api/admin/storage/pricing
 * PUT /api/admin/storage/pricing
 * GET /api/admin/storage/all-companies
 */

import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import { toast } from "react-toastify";
import {
 FiHardDrive, FiRefreshCw, FiAlertTriangle, FiEdit3, FiSave, FiX,
} from "react-icons/fi";
import {
 PageHeader,
 Button,
 Badge,
 StatCard,
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 DataTable,
 Input,
 Skeleton,
 type Column,
} from "@/components/ui";

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
 if (percent >= 95) return "bg-danger-500";
 if (percent >= 80) return "bg-amber-500";
 if (percent >= 60) return "bg-yellow-500";
 return "bg-success-500";
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
 <div className="space-y-6">
 <Skeleton className="h-20 w-full" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-64 w-full" />
 </div>
 </Layout>
 );
 }

 const companyColumns: Column<CompanyRow>[] = [
 {
 key: "name",
 header: "Company",
 render: (c) => (
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {c.code} · {c.status}
 </div>
 </div>
 ),
 },
 {
 key: "plan",
 header: "Plan",
 render: (c) => (
 <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{c.plan}</span>
 ),
 },
 {
 key: "used",
 header: "Used",
 className: "text-right",
 render: (c) => (
 <span className="font-mono text-slate-900 dark:text-slate-100">{formatBytes(c.usedBytes)}</span>
 ),
 },
 {
 key: "quota",
 header: "Quota",
 className: "text-right",
 render: (c) => (
 <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{formatMB(c.quotaMB)}</span>
 ),
 },
 {
 key: "files",
 header: "Files",
 className: "text-right",
 render: (c) => (
 <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{c.fileCount.toLocaleString()}</span>
 ),
 },
 {
 key: "addons",
 header: "Add-ons",
 className: "text-right",
 render: (c) =>
 c.activeSubsCount > 0 ? (
 <Badge variant="success" size="sm">{c.activeSubsCount}</Badge>
 ) : (
 <span className="text-slate-300 dark:text-slate-600">—</span>
 ),
 },
 {
 key: "usage",
 header: "Usage",
 width: "25%",
 render: (c) => (
 <div className="flex items-center gap-3">
 <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
 <div
 className={`h-full ${barColor(c.usagePercentage)}`}
 style={{ width: `${Math.min(100, c.usagePercentage).toFixed(1)}%` }}
 />
 </div>
 <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[42px] text-right">
 {c.usagePercentage.toFixed(1)}%
 </span>
 </div>
 ),
 },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 {/* ─── Header ───────────────────────────────────────────── */}
 <PageHeader
 icon={<FiHardDrive className="w-5 h-5" />}
 title="Platform Storage"
 description="Storage pricing & all-company usage across the platform"
 actions={
 <Button
 variant="outline"
 onClick={loadAll}
 disabled={refreshing}
 leadingIcon={<FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />}
 >
 Refresh
 </Button>
 }
 />

 {/* ─── Platform totals ─────────────────────────────────── */}
 {allCompanies && (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Companies" value={allCompanies.totalCompanies} accent="primary" />
 <StatCard label="Used" value={`${allCompanies.platformTotal.usedGB} GB`} accent="warning" />
 <StatCard label="Allocated" value={`${allCompanies.platformTotal.quotaGB} GB`} accent="neutral" />
 <StatCard
 label="Total Files"
 value={allCompanies.platformTotal.totalFiles.toLocaleString()}
 accent="success"
 />
 </div>
 )}

 {/* ─── Pricing Management ──────────────────────────────── */}
 {pricing && (
 <Card padding="lg">
 <div className="flex items-start justify-between gap-3 mb-4">
 <CardHeader>
 <CardTitle className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Storage Add-on Pricing
 </CardTitle>
 <CardDescription className="text-xs">
 Platform-wide pricing for storage subscriptions. Auto-seeded
 from env defaults on first run, then editable here. Changes
 apply immediately to NEW purchases. Existing subscriptions
 stay at their original locked-in price for life.
 </CardDescription>
 </CardHeader>
 {!editingPricing && (
 <Button
 variant="outline"
 size="sm"
 onClick={startEditPricing}
 leadingIcon={<FiEdit3 className="w-3.5 h-3.5" />}
 >
 Edit Prices
 </Button>
 )}
 </div>

 {!editingPricing ? (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Monthly</div>
 <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
 {pricing.monthly?.pricePerGB} {pricing.currency}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">per GB / month</div>
 </div>
 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Yearly</div>
 <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
 {pricing.yearly?.pricePerGB} {pricing.currency}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 per GB / year ({pricing.yearly?.effectivePerMonth}/mo · save {pricing.yearly?.savingsPercent}%)
 </div>
 </div>
 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Currency</div>
 <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
 {pricing.currency}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">platform-wide</div>
 </div>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Input
 label="Monthly per GB"
 type="number"
 min="0.01"
 step="0.01"
 value={pricingForm.monthly}
 onChange={(e) =>
 setPricingForm((p) => ({ ...p, monthly: e.target.value }))
 }
 />
 <Input
 label="Yearly per GB"
 type="number"
 min="0.01"
 step="0.01"
 value={pricingForm.yearly}
 onChange={(e) =>
 setPricingForm((p) => ({ ...p, yearly: e.target.value }))
 }
 helperText={`Tip: keep below ${
 Number(pricingForm.monthly) > 0
 ? (Number(pricingForm.monthly) * 12).toFixed(0)
 : "..."
 } for a real discount`}
 />
 <Input
 label="Currency"
 type="text"
 maxLength={5}
 value={pricingForm.currency}
 onChange={(e) =>
 setPricingForm((p) => ({
 ...p,
 currency: e.target.value.toUpperCase(),
 }))
 }
 placeholder="INR"
 className="uppercase"
 />
 </div>
 <div className="flex items-center justify-end gap-2">
 <Button
 variant="outline"
 onClick={cancelEditPricing}
 disabled={savingPricing}
 leadingIcon={<FiX className="w-4 h-4" />}
 >
 Cancel
 </Button>
 <Button
 variant="primary"
 onClick={savePricing}
 disabled={savingPricing}
 loading={savingPricing}
 leadingIcon={<FiSave className="w-4 h-4" />}
 >
 {savingPricing ? "Saving…" : "Save Pricing"}
 </Button>
 </div>
 <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
 <FiAlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
 <span>
 New prices apply only to <strong>future purchases</strong>.
 All existing subscriptions keep their original locked-in
 price for the lifetime of that subscription.
 </span>
 </div>
 </div>
 )}
 </Card>
 )}

 {/* ─── All Companies table ─────────────────────────────── */}
 {allCompanies && (
 <div className="space-y-3">
 <div>
 <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 All Companies — Storage Usage
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 {allCompanies.totalCompanies} companies · Platform total:{" "}
 <span className="font-semibold text-slate-700 dark:text-slate-300">
 {allCompanies.platformTotal.usedGB} GB used
 </span>{" "}
 of {allCompanies.platformTotal.quotaGB} GB allocated ·{" "}
 {allCompanies.platformTotal.totalFiles.toLocaleString()} files
 </p>
 </div>
 <DataTable
 columns={companyColumns}
 data={allCompanies.companies}
 rowKey={(c) => c.companyId}
 emptyTitle="No companies"
 emptyDescription="No company storage usage to display yet."
 />
 </div>
 )}
 </div>
 </Layout>
 );
}
