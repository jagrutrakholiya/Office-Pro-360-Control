"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import api from "../../../lib/api";

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

const FEATURE_CATEGORIES: Record<string, string[]> = {
 Core: ["tasks", "calendar", "performance", "timesheet"],
 "Time & Attendance": ["attendance", "shifts", "overtime", "clock_logs"],
 HR: [
 "leave",
 "payroll",
 "holidays",
 "onboarding",
 "offboarding",
 "expenses",
 "invoices",
 "documents",
 "assets",
 ],
 Communication: [
 "chat",
 "messages",
 "announcements",
 "polls",
 "slack_integration",
 "whatsapp_integration",
 ],
 AI: [
 "ai_assistant",
 ],
 Management: [
 "users",
 "teams",
 "projects",
 "sprints",
 "reports",
 "analytics",
 "offices",
 ],
 Admin: [
 "roles",
 "statuses",
 "api_access",
 "audit_trail",
 "webhooks",
 "bulk_operations",
 ],
};

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

 useEffect(() => {
 async function init() {
 setLoading(true);
 await Promise.all([loadCompany(), loadPlans()]);
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
 const styles: Record<string, string> = {
 active: "bg-emerald-100 text-emerald-700",
 trial: "bg-blue-100 text-blue-700",
 suspended: "bg-red-100 text-red-700",
 expired: "bg-slate-100 text-slate-600",
 lifetime: "bg-purple-100 text-purple-700",
 };
 return (
 <span
 className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
 styles[status] || styles.expired
 }`}
 >
 {status}
 </span>
 );
 }

 if (loading) {
 return (
 <Layout>
 <div className="flex items-center justify-center py-32">
 <div className="flex flex-col items-center gap-4">
 <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 <div className="text-slate-600 font-medium">Loading company...</div>
 </div>
 </div>
 </Layout>
 );
 }

 if (!company) {
 return (
 <Layout>
 <div className="text-center py-32">
 <h2 className="text-xl font-bold text-slate-900 mb-2">
 Company not found
 </h2>
 <button
 onClick={() => router.push("/companies")}
 className="btn-primary mt-4"
 >
 Back to Companies
 </button>
 </div>
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
 {/* Header */}
 <div className="mb-8">
 <button
 onClick={() => router.push("/companies")}
 className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-1 transition-colors"
 >
 &larr; Back to Companies
 </button>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
 {company.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center gap-3">
 <h2 className="text-3xl font-bold text-slate-900">
 {company.name}
 </h2>
 {getStatusBadge(subStatus)}
 </div>
 <p className="text-slate-500 mt-1">
 <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
 {company.code}
 </code>
 <span className="mx-2">|</span>
 {planName} Plan
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="border-b border-slate-200 mb-8">
 <nav className="flex gap-0 -mb-px">
 {tabs.map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
 activeTab === tab.key
 ? "border-blue-600 text-blue-600"
 : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </nav>
 </div>

 {/* Tab Content */}

 {/* ─── Overview ─── */}
 {activeTab === "overview" && (
 <div className="space-y-6">
 {/* Company Info */}
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Company Information
 </h3>
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
 <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
 {item.label}
 </div>
 <div className="text-sm font-medium text-slate-900">
 {item.value}
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Usage Stats */}
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Usage Statistics
 </h3>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 {
 label: "Users",
 value:
 company.usage?.users ??
 company.analytics?.totalUsers ??
 0,
 color: "from-blue-500 to-blue-600",
 },
 {
 label: "Projects",
 value:
 company.usage?.projects ??
 company.analytics?.totalProjects ??
 0,
 color: "from-purple-500 to-purple-600",
 },
 {
 label: "Tasks",
 value:
 company.usage?.tasks ??
 company.analytics?.totalTasks ??
 0,
 color: "from-emerald-500 to-emerald-600",
 },
 {
 label: "Storage",
 value: `${company.usage?.storage ?? 0} GB`,
 color: "from-amber-500 to-amber-600",
 },
 ].map((stat) => (
 <div
 key={stat.label}
 className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5"
 >
 <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
 {stat.label}
 </div>
 <div className="text-2xl font-bold text-slate-900">
 {stat.value}
 </div>
 </div>
 ))}
 </div>
 </section>
 </div>
 )}

 {/* ─── Subscription ─── */}
 {activeTab === "subscription" && (
 <div className="space-y-6">
 {/* Current Plan */}
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Current Plan
 </h3>
 <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
 {planName.charAt(0)}
 </div>
 <div>
 <div className="text-lg font-bold text-slate-900">
 {planName}
 </div>
 <div className="text-sm text-slate-600">
 Status: {subStatus}
 </div>
 </div>
 </div>
 </section>

 {/* Change Plan */}
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Change Plan
 </h3>
 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Plan
 </label>
 <select
 value={selectedPlan}
 onChange={(e) => setSelectedPlan(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
 >
 <option value="">Select a plan</option>
 {plans.map((p) => (
 <option key={p._id} value={p.code}>
 {p.name}
 </option>
 ))}
 </select>
 </div>
 <div className="w-40">
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Billing Cycle
 </label>
 <select
 value={selectedCycle}
 onChange={(e) => setSelectedCycle(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
 >
 <option value="monthly">Monthly</option>
 <option value="yearly">Yearly</option>
 </select>
 </div>
 <div className="flex items-end">
 <button
 onClick={handleChangePlan}
 disabled={changingPlan || !selectedPlan}
 className="btn-primary disabled:opacity-50"
 >
 {changingPlan ? "Applying..." : "Apply"}
 </button>
 </div>
 </div>
 </section>

 {/* Lifetime Access */}
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Lifetime Access
 </h3>
 {subStatus === "lifetime" ? (
 <div className="space-y-4">
 <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
 <p className="text-sm text-purple-700 font-medium">
 This company has lifetime access.
 </p>
 </div>
 <button
 onClick={handleRevokeLifetime}
 className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
 >
 Revoke Lifetime Access
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1">
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Plan
 </label>
 <select
 value={lifetimePlan}
 onChange={(e) => setLifetimePlan(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
 >
 <option value="">Select a plan</option>
 {plans.map((p) => (
 <option key={p._id} value={p.code}>
 {p.name}
 </option>
 ))}
 </select>
 </div>
 <div className="flex-1">
 <label className="block text-sm font-medium text-slate-700 mb-1">
 Reason
 </label>
 <input
 type="text"
 value={lifetimeReason}
 onChange={(e) => setLifetimeReason(e.target.value)}
 placeholder="Reason for granting lifetime access..."
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
 />
 </div>
 </div>
 <button
 onClick={handleGrantLifetime}
 disabled={grantingLifetime || !lifetimePlan}
 className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
 >
 {grantingLifetime
 ? "Granting..."
 : "Grant Lifetime Access"}
 </button>
 </div>
 )}
 </section>

 {/* Subscription History */}
 {company.subscription?.history &&
 company.subscription.history.length > 0 && (
 <section className="table-wrapper p-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">
 Subscription History
 </h3>
 <div className="space-y-4">
 {company.subscription.history.map(
 (entry: HistoryEntry, idx: number) => (
 <div key={entry._id || idx} className="flex items-start gap-4 relative">
 {idx <
 (company.subscription?.history?.length ?? 0) - 1 && (
 <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200" />
 )}
 <div className="relative z-10 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
 <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
 </div>
 <div className="flex-1 pb-4">
 <p className="text-sm font-medium text-slate-900">
 {entry.action ||
 entry.description ||
 `Changed to ${entry.planName || entry.plan}`}
 </p>
 <p className="text-xs text-slate-500 mt-0.5">
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
 </section>
 )}
 </div>
 )}

 {/* ─── Features ─── */}
 {activeTab === "features" && (
 <div className="space-y-6">
 <section className="table-wrapper p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-slate-900">
 Feature Toggles
 </h3>
 <button
 onClick={handleSaveFeatures}
 disabled={savingFeatures}
 className="btn-primary disabled:opacity-50"
 >
 {savingFeatures ? "Saving..." : "Save Features"}
 </button>
 </div>

 <div className="space-y-8">
 {Object.entries(FEATURE_CATEGORIES).map(
 ([category, featureKeys]) => (
 <div key={category}>
 <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
 <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
 {category}
 </h4>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {featureKeys.map((key) => (
 <label
 key={key}
 className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
 >
 <span className="text-sm font-medium text-slate-700 capitalize">
 {key.replace(/_/g, " ")}
 </span>
 <div className="relative">
 <input
 type="checkbox"
 checked={!!features[key]}
 onChange={(e) =>
 setFeatures({
 ...features,
 [key]: e.target.checked,
 })
 }
 className="sr-only peer"
 />
 <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
 <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
 </div>
 </label>
 ))}
 </div>
 </div>
 )
 )}
 </div>
 </section>
 </div>
 )}

 {/* ─── Limits ─── */}
 {activeTab === "limits" && (
 <div className="space-y-6">
 <section className="table-wrapper p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-slate-900">
 Resource Limits
 </h3>
 <button
 onClick={handleSaveLimits}
 disabled={savingLimits}
 className="btn-primary disabled:opacity-50"
 >
 {savingLimits ? "Saving..." : "Save Limits"}
 </button>
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
 className="p-4 border border-slate-200 rounded-xl"
 >
 <label className="block text-sm font-semibold text-slate-900 mb-1">
 {field.label}
 </label>
 <p className="text-xs text-slate-500 mb-3">
 {field.description}
 </p>
 <input
 type="number"
 min={0}
 value={limits[field.key]}
 onChange={(e) =>
 setLimits({
 ...limits,
 [field.key]: parseInt(e.target.value) || 0,
 })
 }
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
 />
 </div>
 ))}
 </div>
 </section>
 </div>
 )}
 </Layout>
 );
}
