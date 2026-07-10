"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import api from "../../../lib/api";
import {
 PageHeader,
 Card,
 CardTitle,
 Button,
 Badge,
 StatCard,
 Tabs,
 Input,
 Select,
 EmptyState,
 Skeleton,
} from "@/components/ui";

type Company = {
 _id: string;
 name: string;
 code: string;
 status: string;
 plan?: { name: string; code: string };
 planName?: string;
 planCode?: string;
 createdAt: string;
 features?: Record<string, boolean>;
 limits?: {
 maxUsers?: number;
 maxProjects?: number;
 maxStorage?: number;
 maxApiCalls?: number;
 };
 usage?: {
 users?: number;
 projects?: number;
 tasks?: number;
 storage?: number;
 };
 analytics?: {
 totalUsers?: number;
 totalProjects?: number;
 totalTasks?: number;
 };
 subscription?: {
 status?: string;
 history?: HistoryEntry[];
 };
};

type HistoryEntry = {
 _id?: string;
 action?: string;
 description?: string;
 planName?: string;
 plan?: string;
 date?: string;
 createdAt?: string;
 amount?: number;
};

type Plan = { _id: string; name: string; code: string };

type ServiceEntry = { key: string; label: string; description?: string; category?: string };

export default function CompanyDetailPage() {
 const params = useParams();
 const router = useRouter();
 const companyId = params.id as string;

 const [company, setCompany] = useState<Company | null>(null);
 const [plans, setPlans] = useState<Plan[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState("overview");

 // Subscription tab state
 const [selectedPlan, setSelectedPlan] = useState("");
 const [selectedCycle, setSelectedCycle] = useState("monthly");
 const [changingPlan, setChangingPlan] = useState(false);
 const [lifetimePlan, setLifetimePlan] = useState("");
 const [lifetimeReason, setLifetimeReason] = useState("");
 const [grantingLifetime, setGrantingLifetime] = useState(false);

 // Features tab state
 const [features, setFeatures] = useState<Record<string, boolean>>({});
 const [savingFeatures, setSavingFeatures] = useState(false);
 const [availableServices, setAvailableServices] = useState<ServiceEntry[]>([]);

 // Limits tab state
 const [limits, setLimits] = useState({
 maxUsers: 0,
 maxProjects: 0,
 maxStorage: 0,
 maxApiCalls: 0,
 });
 const [savingLimits, setSavingLimits] = useState(false);

 async function loadCompany() {
 try {
 const res = await api.get(`/admin/companies/${companyId}`);
 const data = res.data.company || res.data;
 setCompany(data);
 setFeatures(data.features || {});
 setLimits({
 maxUsers: data.limits?.maxUsers || 0,
 maxProjects: data.limits?.maxProjects || 0,
 maxStorage: data.limits?.maxStorage || 0,
 maxApiCalls: data.limits?.maxApiCalls || 0,
 });
 setSelectedPlan(data.plan?.code || data.planCode || "");
 } catch {
 // silent
 }
 }

 async function loadPlans() {
 try {
 const res = await api.get("/admin/plans");
 setPlans(res.data.plans || []);
 } catch {}
 }

 async function loadServices() {
 try {
 const res = await api.get("/public/services");
 setAvailableServices(res.data.services || []);
 } catch {}
 }

 useEffect(() => {
 async function init() {
 setLoading(true);
 await Promise.all([loadCompany(), loadPlans(), loadServices()]);
 setLoading(false);
 }
 init();
 }, [companyId]);

 async function handleChangePlan() {
 if (!selectedPlan) return;
 setChangingPlan(true);
 try {
 await api.post("/subscription/change-plan", {
 companyId,
 planCode: selectedPlan,
 billingCycle: selectedCycle,
 });
 await loadCompany();
 } catch {}
 setChangingPlan(false);
 }

 async function handleGrantLifetime() {
 if (!lifetimePlan) return;
 setGrantingLifetime(true);
 try {
 await api.post("/subscription/lifetime", {
 companyId,
 planCode: lifetimePlan,
 reason: lifetimeReason,
 });
 setLifetimePlan("");
 setLifetimeReason("");
 await loadCompany();
 } catch {}
 setGrantingLifetime(false);
 }

 async function handleRevokeLifetime() {
 if (!confirm("Revoke lifetime access for this company?")) return;
 try {
 await api.post("/subscription/revoke-lifetime", { companyId });
 await loadCompany();
 } catch {}
 }

 async function handleSaveFeatures() {
 setSavingFeatures(true);
 try {
 await api.put(`/company/${companyId}/features`, { features });
 await loadCompany();
 } catch {}
 setSavingFeatures(false);
 }

 async function handleSaveLimits() {
 setSavingLimits(true);
 try {
 await api.put(`/company/${companyId}/limits`, { limits });
 await loadCompany();
 } catch {}
 setSavingLimits(false);
 }

 function getStatusBadge(status: string) {
 const variants: Record<string, "success" | "info" | "danger" | "neutral" | "default"> = {
 active: "success",
 trial: "info",
 suspended: "danger",
 expired: "neutral",
 lifetime: "default",
 };
 return (
 <Badge variant={variants[status] || "neutral"} className="capitalize">
 {status}
 </Badge>
 );
 }

 if (loading) {
 return (
 <Layout>
 <div className="space-y-6">
 <Skeleton className="h-8 w-64" />
 <Skeleton variant="rounded" className="h-10 w-full max-w-md" />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[0, 1, 2, 3].map((i) => (
 <Skeleton key={i} variant="rounded" className="h-24" />
 ))}
 </div>
 <Skeleton variant="rounded" className="h-48" />
 </div>
 </Layout>
 );
 }

 if (!company) {
 return (
 <Layout>
 <EmptyState
 size="large"
 title="Company not found"
 description="This company may have been deleted or the link is incorrect."
 action={
 <Button onClick={() => router.push("/companies")}>Back to Companies</Button>
 }
 />
 </Layout>
 );
 }

 const subStatus =
 company.subscription?.status || company.status || "active";
 const planName =
 company.plan?.name || company.planName || company.planCode || "-";

 const tabs = [
 { key: "overview", label: "Overview" },
 { key: "subscription", label: "Subscription" },
 { key: "features", label: "Features" },
 { key: "limits", label: "Limits" },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 {/* Header */}
 <PageHeader
 breadcrumbs={[{ label: "Companies", href: "/companies" }, { label: company.name }]}
 icon={
 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
 {company.name.charAt(0).toUpperCase()}
 </div>
 }
 title={
 <span className="inline-flex items-center gap-3">
 {company.name}
 {getStatusBadge(subStatus)}
 </span>
 }
 description={
 <span className="inline-flex items-center gap-2">
 <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
 {company.code}
 </code>
 <span className="text-slate-300 dark:text-slate-600">|</span>
 {planName} Plan
 </span>
 }
 actions={
 <Button variant="secondary" onClick={() => router.push("/companies")}>
 ← Back to Companies
 </Button>
 }
 />

 {/* Tabs */}
 <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

 {/* Tab Content */}

 {/* ─── Overview ─── */}
 {activeTab === "overview" && (
 <div className="space-y-6">
 {/* Company Info */}
 <Card>
 <CardTitle className="mb-4">Company Information</CardTitle>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {[
 { label: "Name", value: company.name },
 { label: "Code", value: company.code },
 { label: "Status", value: subStatus },
 { label: "Plan", value: planName },
 {
 label: "Created",
 value: new Date(company.createdAt).toLocaleDateString(
 "en-IN",
 { year: "numeric", month: "long", day: "numeric" }
 ),
 },
 ].map((item) => (
 <div key={item.label}>
 <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
 {item.label}
 </div>
 <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
 {item.value}
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Usage Stats */}
 <div>
 <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
 Usage Statistics
 </h3>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 {
 label: "Users",
 value:
 company.usage?.users ??
 company.analytics?.totalUsers ??
 0,
 accent: "primary" as const,
 },
 {
 label: "Projects",
 value:
 company.usage?.projects ??
 company.analytics?.totalProjects ??
 0,
 accent: "primary" as const,
 },
 {
 label: "Tasks",
 value:
 company.usage?.tasks ??
 company.analytics?.totalTasks ??
 0,
 accent: "success" as const,
 },
 {
 label: "Storage",
 value: `${company.usage?.storage ?? 0} GB`,
 accent: "warning" as const,
 },
 ].map((stat) => (
 <StatCard
 key={stat.label}
 label={stat.label}
 value={stat.value}
 accent={stat.accent}
 />
 ))}
 </div>
 </div>
 </div>
 )}

 {/* ─── Subscription ─── */}
 {activeTab === "subscription" && (
 <div className="space-y-6">
 {/* Current Plan */}
 <Card>
 <CardTitle className="mb-4">Current Plan</CardTitle>
 <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
 <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
 {planName.charAt(0)}
 </div>
 <div>
 <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
 {planName}
 </div>
 <div className="text-sm text-slate-500 dark:text-slate-400">
 Status: {subStatus}
 </div>
 </div>
 </div>
 </Card>

 {/* Change Plan */}
 <Card>
 <CardTitle className="mb-4">Change Plan</CardTitle>
 <div className="flex flex-col sm:flex-row gap-4">
 <Select
 label="Plan"
 value={selectedPlan}
 onChange={(e) => setSelectedPlan(e.target.value)}
 wrapperClassName="flex-1"
 >
 <option value="">Select a plan</option>
 {plans.map((p) => (
 <option key={p._id} value={p.code}>
 {p.name}
 </option>
 ))}
 </Select>
 <Select
 label="Billing Cycle"
 value={selectedCycle}
 onChange={(e) => setSelectedCycle(e.target.value)}
 wrapperClassName="w-full sm:w-40"
 >
 <option value="monthly">Monthly</option>
 <option value="yearly">Yearly</option>
 </Select>
 <div className="flex items-end">
 <Button
 onClick={handleChangePlan}
 disabled={changingPlan || !selectedPlan}
 loading={changingPlan}
 >
 {changingPlan ? "Applying..." : "Apply"}
 </Button>
 </div>
 </div>
 </Card>

 {/* Lifetime Access */}
 <Card>
 <CardTitle className="mb-4">Lifetime Access</CardTitle>
 {subStatus === "lifetime" ? (
 <div className="space-y-4">
 <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
 <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
 This company has lifetime access.
 </p>
 </div>
 <Button variant="danger" onClick={handleRevokeLifetime}>
 Revoke Lifetime Access
 </Button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row gap-4">
 <Select
 label="Plan"
 value={lifetimePlan}
 onChange={(e) => setLifetimePlan(e.target.value)}
 wrapperClassName="flex-1"
 >
 <option value="">Select a plan</option>
 {plans.map((p) => (
 <option key={p._id} value={p.code}>
 {p.name}
 </option>
 ))}
 </Select>
 <Input
 label="Reason"
 type="text"
 value={lifetimeReason}
 onChange={(e) => setLifetimeReason(e.target.value)}
 placeholder="Reason for granting lifetime access..."
 wrapperClassName="flex-1"
 />
 </div>
 <Button
 onClick={handleGrantLifetime}
 disabled={grantingLifetime || !lifetimePlan}
 loading={grantingLifetime}
 >
 {grantingLifetime ? "Granting..." : "Grant Lifetime Access"}
 </Button>
 </div>
 )}
 </Card>

 {/* Subscription History */}
 {company.subscription?.history &&
 company.subscription.history.length > 0 && (
 <Card>
 <CardTitle className="mb-4">Subscription History</CardTitle>
 <div className="space-y-4">
 {company.subscription.history.map(
 (entry: HistoryEntry, idx: number) => (
 <div key={entry._id || idx} className="flex items-start gap-4 relative">
 {idx <
 (company.subscription?.history?.length ?? 0) - 1 && (
 <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
 )}
 <div className="relative z-10 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
 <div className="w-2.5 h-2.5 rounded-full bg-primary-600 dark:bg-primary-400" />
 </div>
 <div className="flex-1 pb-4">
 <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
 {entry.action ||
 entry.description ||
 `Changed to ${entry.planName || entry.plan}`}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {new Date(
 entry.date || entry.createdAt || ""
 ).toLocaleDateString("en-IN", {
 year: "numeric",
 month: "long",
 day: "numeric",
 })}
 {entry.amount ? ` | ₹${entry.amount}` : ""}
 </p>
 </div>
 </div>
 )
 )}
 </div>
 </Card>
 )}
 </div>
 )}

 {/* ─── Features ─── */}
 {activeTab === "features" && (
 <div className="space-y-6">
 <Card>
 <div className="flex items-center justify-between mb-6">
 <CardTitle>Feature Toggles</CardTitle>
 <Button
 onClick={handleSaveFeatures}
 disabled={savingFeatures}
 loading={savingFeatures}
 >
 {savingFeatures ? "Saving..." : "Save Features"}
 </Button>
 </div>

 <div className="space-y-8">
 {(() => {
 const grouped: Record<string, ServiceEntry[]> = {};
 for (const svc of availableServices) {
 const cat = svc.category || "Other";
 if (!grouped[cat]) grouped[cat] = [];
 grouped[cat].push(svc);
 }
 return Object.entries(grouped).map(([category, services]) => (
 <div key={category}>
 <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
 <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
 <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
 {category}
 </h4>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {services.map((svc) => (
 <label
 key={svc.key}
 className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
 title={svc.description || ""}
 >
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
 {svc.label}
 </div>
 {svc.description && (
 <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
 {svc.description}
 </div>
 )}
 </div>
 <div className="relative ml-3 flex-shrink-0">
 <input
 type="checkbox"
 checked={!!features[svc.key]}
 onChange={(e) =>
 setFeatures({
 ...features,
 [svc.key]: e.target.checked,
 })
 }
 className="sr-only peer"
 />
 <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary-600 transition-colors" />
 <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
 </div>
 </label>
 ))}
 </div>
 </div>
 ));
 })()}
 </div>
 </Card>
 </div>
 )}

 {/* ─── Limits ─── */}
 {activeTab === "limits" && (
 <div className="space-y-6">
 <Card>
 <div className="flex items-center justify-between mb-6">
 <CardTitle>Resource Limits</CardTitle>
 <Button
 onClick={handleSaveLimits}
 disabled={savingLimits}
 loading={savingLimits}
 >
 {savingLimits ? "Saving..." : "Save Limits"}
 </Button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {[
 {
 key: "maxUsers" as const,
 label: "Max Users",
 description:
 "Maximum number of users allowed in this company",
 },
 {
 key: "maxProjects" as const,
 label: "Max Projects",
 description: "Maximum number of projects allowed",
 },
 {
 key: "maxStorage" as const,
 label: "Max Storage (GB)",
 description: "Maximum storage quota in gigabytes",
 },
 {
 key: "maxApiCalls" as const,
 label: "Max API Calls / Month",
 description: "Monthly API call limit (0 = unlimited)",
 },
 ].map((field) => (
 <div
 key={field.key}
 className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl"
 >
 <Input
 type="number"
 min={0}
 label={field.label}
 helperText={field.description}
 value={limits[field.key]}
 onChange={(e) =>
 setLimits({
 ...limits,
 [field.key]: parseInt(e.target.value) || 0,
 })
 }
 />
 </div>
 ))}
 </div>
 </Card>
 </div>
 )}
 </div>
 </Layout>
 );
}
