"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 Card,
 CardTitle,
 CardDescription,
 Button,
 Badge,
 Select,
 DataTable,
 Modal,
 Skeleton,
} from "@/components/ui";
import type { Column } from "@/components/ui";

type Company = {
 _id: string;
 name: string;
 code: string;
 plan: string;
 status: string;
 createdAt: string;
 features?: Record<string, boolean>;
 analytics?: {
 totalUsers?: number;
 totalProjects?: number;
 totalTasks?: number;
 completedTasks?: number;
 completionRate?: number;
 activeUsers?: number;
 };
 usage?: {
 storageUsed?: number;
 storageQuota?: number;
 apiCallsThisMonth?: number;
 apiQuota?: number;
 };
 limits?: Record<string, number>;
};
type Plan = { _id: string; name: string; code: string };
type CompanyUser = {
 _id: string;
 name: string;
 email: string;
 role: string;
 status: string;
 createdAt: string;
};

type Service = { key: string; label: string; description: string; category?: string };

// NO hardcoded services. Everything comes from GET /api/public/services
// which reads from backend/utils/services.js (single source of truth).

export default function CompaniesPage() {
 const router = useRouter();
 const [availableServices, setAvailableServices] = useState<Service[]>([]);
 const [servicesLoading, setServicesLoading] = useState(true);
 const [companies, setCompanies] = useState<Company[]>([]);
 const [plans, setPlans] = useState<Plan[]>([]);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editServices, setEditServices] = useState<Record<string, boolean>>({});
 const [viewingUsers, setViewingUsers] = useState<string | null>(null);
 const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
 const [loadingUsers, setLoadingUsers] = useState(false);
 const [plansLoading, setPlansLoading] = useState(false);
 const [plansError, setPlansError] = useState<string>("");

 async function loadCompanies() {
 try {
 const res = await api.get("/admin/companies");
 setCompanies(res.data.companies || []);
 } catch {}
 }

 async function loadPlans() {
 setPlansLoading(true);
 setPlansError("");
 try {
 const res = await api.get("/admin/plans");
 setPlans(res.data.plans || []);
 } catch (err: any) {
 console.error("Failed to load plans", err);
 setPlansError("Failed to load plans. Plan changes are disabled.");
 setPlans([]);
 } finally {
 setPlansLoading(false);
 }
 }

 async function loadServices() {
 setServicesLoading(true);
 try {
 const res = await api.get("/public/services");
 if (res.data.services?.length > 0) setAvailableServices(res.data.services);
 } catch (e) {
 console.error("Failed to load services:", e);
 } finally {
 setServicesLoading(false);
 }
 }

 useEffect(() => {
 loadCompanies();
 loadPlans();
 loadServices();
 }, []);

 // Group services by category — 100% from API, zero hardcoding
 const getServicesByCategory = () => {
 const categorized: Record<string, Service[]> = {};
 availableServices.forEach((svc) => {
 const cat = svc.category || "Other";
 if (!categorized[cat]) categorized[cat] = [];
 categorized[cat].push(svc);
 });
 return categorized;
 };

 const openEditServices = (c: Company) => {
 setEditingId(c._id);
 const current = (c.features || {}) as Record<string, boolean>;
 
 // Show current features as-is — missing ones default to OFF (not selected)
 const updatedFeatures: Record<string, boolean> = {};

 // First set all available services to false
 availableServices.forEach(svc => {
 updatedFeatures[svc.key] = false;
 });

 // Then overlay with company's actual current features
 Object.entries(current).forEach(([key, value]) => {
 updatedFeatures[key] = !!value;
 });

 setEditServices(updatedFeatures);
 };

 const saveEditServices = async () => {
 if (!editingId) return;
 // Send ALL features (both true and false) so disabled features are properly saved
 await api.patch(`/admin/companies/${editingId}/features`, {
 features: editServices,
 });
 setEditingId(null);
 setEditServices({});
 await loadCompanies();
 };

 async function changeStatus(id: string, status: string) {
 await api.patch(`/admin/companies/${id}/status`, { status });
 loadCompanies();
 }

 async function deleteCompany(id: string, name: string) {
 if (
 !confirm(
 `Are you sure you want to delete "${name}"?\n\nThis will permanently delete:\n• The company\n• All users in this company\n• All company data (tasks, projects, attendance, etc.)\n\nThis action cannot be undone!`
 )
 ) {
 return;
 }

 try {
 const res = await api.delete(`/admin/companies/${id}`);
 alert(`Successfully deleted company and ${res.data.deleted.users} users`);
 loadCompanies();
 } catch (err: any) {
 alert(
 `Failed to delete company: ${
 err.response?.data?.message || err.message
 }`
 );
 }
 }

 async function changePlan(id: string, plan: string) {
 try {
 await api.patch(`/admin/companies/${id}/plan`, { plan });
 await loadCompanies();
 } catch (err: any) {
 console.error("Failed to change plan", err);
 alert(
 `Failed to change plan: ${err?.response?.data?.message || err?.message || "Unknown error"}`
 );
 await loadCompanies();
 }
 }

 async function loadCompanyUsers(companyId: string) {
 setLoadingUsers(true);
 try {
 const res = await api.get(`/admin/companies/${companyId}/users`);
 setCompanyUsers(res.data.users || []);
 setViewingUsers(companyId);
 } catch (err) {
 console.error("Failed to load users:", err);
 alert("Failed to load company users");
 } finally {
 setLoadingUsers(false);
 }
 }

 const categorizedServices = getServicesByCategory();
 const selectedCount = editingId
 ? Object.values(editServices).filter(Boolean).length
 : 0;

 function statusVariant(status: string): "success" | "warning" | "danger" | "neutral" {
 if (status === "active") return "success";
 if (status === "view_only") return "warning";
 if (status === "suspended") return "danger";
 return "neutral";
 }

 const columns: Column<Company>[] = [
 {
 key: "company",
 header: "Company",
 render: (c) => (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
 {c.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 {c.name}
 </div>
 <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
 {c.code}
 </code>
 </div>
 </div>
 ),
 },
 {
 key: "plan",
 header: "Plan",
 render: (c) => (
 <Select
 defaultValue={c.plan}
 onChange={(e) => changePlan(c._id, e.target.value)}
 disabled={plansLoading || plans.length === 0}
 wrapperClassName="w-32"
 >
 {plans.length > 0 ? (
 plans.map((p) => (
 <option key={p._id} value={p.code}>
 {p.name}
 </option>
 ))
 ) : (
 <option value={c.plan}>{c.plan}</option>
 )}
 </Select>
 ),
 },
 {
 key: "users",
 header: "Users",
 render: (c) => (
 <div className="min-w-[90px]">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 {c.analytics?.totalUsers || 0}
 </span>
 {c.limits?.maxUsers && c.limits.maxUsers !== -1 ? (
 <>
 <span className="text-slate-400 dark:text-slate-600">/</span>
 <span className="text-sm text-slate-600 dark:text-slate-400">
 {c.limits.maxUsers}
 </span>
 </>
 ) : null}
 </div>
 {c.limits?.maxUsers && c.limits.maxUsers !== -1 ? (
 <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1">
 <div
 className={`h-1.5 rounded-full transition-all ${
 (c.analytics?.totalUsers || 0) / c.limits.maxUsers > 0.9
 ? "bg-danger-500"
 : (c.analytics?.totalUsers || 0) / c.limits.maxUsers > 0.7
 ? "bg-warning-500"
 : "bg-success-500"
 }`}
 style={{
 width: `${Math.min(
 ((c.analytics?.totalUsers || 0) / c.limits.maxUsers) * 100,
 100
 )}%`,
 }}
 />
 </div>
 ) : null}
 </div>
 ),
 },
 {
 key: "storage",
 header: "Storage",
 render: (c) => (
 <div className="min-w-[110px]">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 {((c.usage?.storageUsed || 0) / 1024).toFixed(1)}GB
 </span>
 <span className="text-slate-400 dark:text-slate-600">/</span>
 <span className="text-sm text-slate-600 dark:text-slate-400">
 {((c.usage?.storageQuota || 5120) / 1024).toFixed(0)}GB
 </span>
 </div>
 <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1">
 <div
 className={`h-1.5 rounded-full transition-all ${
 (c.usage?.storageUsed || 0) / (c.usage?.storageQuota || 5120) > 0.9
 ? "bg-danger-500"
 : (c.usage?.storageUsed || 0) / (c.usage?.storageQuota || 5120) > 0.7
 ? "bg-warning-500"
 : "bg-success-500"
 }`}
 style={{
 width: `${Math.min(
 ((c.usage?.storageUsed || 0) / (c.usage?.storageQuota || 5120)) * 100,
 100
 )}%`,
 }}
 />
 </div>
 </div>
 ),
 },
 {
 key: "services",
 header: "Services",
 render: (c) => (
 <div className="flex items-center gap-2">
 <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
 {c.features ? Object.values(c.features).filter(Boolean).length : 0}
 </span>
 <span className="text-sm text-slate-500 dark:text-slate-400">features</span>
 </div>
 ),
 },
 {
 key: "status",
 header: "Status",
 render: (c) => (
 <Select
 defaultValue={c.status}
 onChange={(e) => changeStatus(c._id, e.target.value)}
 wrapperClassName="w-32"
 >
 <option value="active">Active</option>
 <option value="view_only">View Only</option>
 <option value="suspended">Suspended</option>
 </Select>
 ),
 },
 {
 key: "actions",
 header: "Actions",
 render: (c) => (
 <div className="flex gap-2">
 <Button size="sm" variant="secondary" onClick={() => loadCompanyUsers(c._id)}>
 View Users
 </Button>
 <Button size="sm" onClick={() => openEditServices(c)}>
 Edit Services
 </Button>
 <Button size="sm" variant="danger" onClick={() => deleteCompany(c._id, c.name)}>
 Delete
 </Button>
 </div>
 ),
 },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Companies"
 description="Manage companies, plans, and subscriptions"
 actions={
 <Button
 onClick={() => router.push("/companies/new")}
 leadingIcon={<span className="text-base leading-none">+</span>}
 >
 Add New Company
 </Button>
 }
 />

 <div className="flex items-center gap-2">
 <CardTitle>All Companies</CardTitle>
 <Badge variant="neutral">{companies.length} total</Badge>
 </div>

 <DataTable<Company>
 columns={columns}
 data={companies}
 rowKey={(c) => c._id}
 emptyTitle="No companies yet"
 emptyDescription="Create your first company to get started."
 emptyAction={
 <Button onClick={() => router.push("/companies/new")}>
 Add New Company
 </Button>
 }
 />

 {/* Edit Services Section */}
 {editingId && (
 <Card>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <CardTitle>Edit Services / Features</CardTitle>
 <CardDescription>
 {selectedCount} of {availableServices.length} services selected
 </CardDescription>
 </div>
 <div className="flex gap-2">
 <Button
 type="button"
 variant="secondary"
 size="sm"
 onClick={() => {
 const allEnabled = Object.fromEntries(
 availableServices.map((s) => [s.key, true])
 );
 setEditServices(allEnabled);
 }}
 >
 Select All
 </Button>
 <Button
 type="button"
 variant="secondary"
 size="sm"
 onClick={() => setEditServices({})}
 >
 Clear All
 </Button>
 </div>
 </div>

 <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-h-96 overflow-y-auto">
 <div className="space-y-6">
 {Object.entries(categorizedServices).map(
 ([category, services]) => (
 <div key={category} className="space-y-3">
 <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
 <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
 <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
 {category}
 </h5>
 <Badge variant="neutral" size="sm">
 {services.length} services
 </Badge>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {services.map((svc) => (
 <label
 key={svc.key}
 className="group flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/20 has-[:checked]:border-primary-300 dark:has-[:checked]:border-primary-700"
 >
 <input
 type="checkbox"
 checked={!!editServices[svc.key]}
 onChange={(e) =>
 setEditServices({
 ...editServices,
 [svc.key]: e.target.checked,
 })
 }
 className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-600 rounded focus:ring-primary-500 mt-0.5"
 />
 <div className="flex-1 min-w-0">
 <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
 {svc.label || svc.key}
 </div>
 {svc.description && (
 <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
 {svc.description}
 </div>
 )}
 </div>
 </label>
 ))}
 </div>
 </div>
 )
 )}
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 mt-6">
 <Button onClick={saveEditServices}>Save Changes</Button>
 <Button
 variant="secondary"
 onClick={() => {
 setEditingId(null);
 setEditServices({});
 }}
 >
 Cancel
 </Button>
 </div>
 </Card>
 )}
 </div>

 {/* Users Modal */}
 {viewingUsers && (
 <Modal
 open
 size="lg"
 onClose={() => {
 setViewingUsers(null);
 setCompanyUsers([]);
 }}
 title={
 <span>
 Company Users
 <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
 {companies.find((c) => c._id === viewingUsers)?.name || ""} · {companyUsers.length} users
 </span>
 </span>
 }
 footer={
 <Button
 variant="secondary"
 onClick={() => {
 setViewingUsers(null);
 setCompanyUsers([]);
 }}
 >
 Close
 </Button>
 }
 >
 {loadingUsers ? (
 <div className="space-y-3">
 {[0, 1, 2].map((i) => (
 <Skeleton key={i} variant="rounded" className="h-20" />
 ))}
 </div>
 ) : companyUsers.length > 0 ? (
 <div className="space-y-3">
 {companyUsers.map((user) => (
 <div
 key={user._id}
 className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl"
 >
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
 {user.name}
 </div>
 <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
 {user.email}
 </div>
 <div className="flex flex-wrap items-center gap-2 mt-2">
 <Badge variant="neutral" size="sm">
 {user.role}
 </Badge>
 <Badge
 variant={user.status === "active" ? "success" : "danger"}
 size="sm"
 >
 {user.status}
 </Badge>
 <span className="text-xs text-slate-500 dark:text-slate-400">
 Joined: {new Date(user.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-slate-500 dark:text-slate-400">
 <p className="text-lg font-medium">No users found</p>
 <p className="text-sm mt-2">
 This company doesn&apos;t have any users yet
 </p>
 </div>
 )}
 </Modal>
 )}
 </Layout>
 );
}
