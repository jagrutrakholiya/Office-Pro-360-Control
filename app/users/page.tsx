"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type User = {
 _id: string;
 name: string;
 email: string;
 role: string;
 status: string;
 companyId: string;
 companyName?: string;
 lastActive?: string;
 createdAt: string;
};

type Company = {
 _id: string;
 name: string;
 code: string;
};

export default function UsersPage() {
 const router = useRouter();
 const [companies, setCompanies] = useState<Company[]>([]);
 const [allUsers, setAllUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterCompany, setFilterCompany] = useState("");
 const [filterRole, setFilterRole] = useState("");
 const [filterStatus, setFilterStatus] = useState("");
 const [page, setPage] = useState(1);
 const [viewUser, setViewUser] = useState<User | null>(null);
 const perPage = 20;

 async function loadData() {
 setLoading(true);
 try {
 const compRes = await api.get("/admin/companies");
 const comps: Company[] = compRes.data.companies || [];
 setCompanies(comps);

 const userPromises = comps.map(async (c) => {
 try {
 const res = await api.get(`/admin/companies/${c._id}/users`);
 return (res.data.users || []).map((u: any) => ({
 ...u,
 companyId: c._id,
 companyName: c.name,
 }));
 } catch {
 return [];
 }
 });

 const results = await Promise.all(userPromises);
 setAllUsers(results.flat());
 } catch (err) {
 console.error("Failed to load data", err);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadData();
 }, []);

 const filtered = useMemo(() => {
 let list = allUsers;
 if (search) {
 const q = search.toLowerCase();
 list = list.filter(
 (u) =>
 u.name.toLowerCase().includes(q) ||
 u.email.toLowerCase().includes(q)
 );
 }
 if (filterCompany) list = list.filter((u) => u.companyId === filterCompany);
 if (filterRole) list = list.filter((u) => u.role === filterRole);
 if (filterStatus) list = list.filter((u) => u.status === filterStatus);
 return list;
 }, [allUsers, search, filterCompany, filterRole, filterStatus]);

 const totalPages = Math.ceil(filtered.length / perPage);
 const paged = filtered.slice((page - 1) * perPage, page * perPage);

 const roles = useMemo(
 () => Array.from(new Set(allUsers.map((u) => u.role))).sort(),
 [allUsers]
 );

 async function resetPassword(userId: string) {
 if (!confirm("Send password reset for this user?")) return;
 try {
 await api.put(`/users/${userId}`, { passwordReset: true });
 alert("Password reset initiated.");
 } catch (err: any) {
 alert(
 `Failed: ${err.response?.data?.message || err.message}`
 );
 }
 }

 async function toggleStatus(user: User) {
 const newStatus = user.status === "active" ? "inactive" : "active";
 try {
 await api.put(`/users/${user._id}`, { status: newStatus });
 setAllUsers((prev) =>
 prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
 );
 } catch (err: any) {
 alert(
 `Failed: ${err.response?.data?.message || err.message}`
 );
 }
 }

 function exportCSV() {
 const headers = [
 "Name",
 "Email",
 "Role",
 "Company",
 "Status",
 "Created At",
 ];
 const rows = filtered.map((u) => [
 u.name,
 u.email,
 u.role,
 u.companyName || "",
 u.status,
 new Date(u.createdAt).toLocaleDateString(),
 ]);
 const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
 const blob = new Blob([csv], { type: "text/csv" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = "users_export.csv";
 a.click();
 URL.revokeObjectURL(url);
 }

 const roleBadge = (role: string) => {
 const colors: Record<string, string> = {
 admin: "bg-purple-100 text-purple-700",
 super_admin: "bg-red-100 text-red-700",
 manager: "bg-blue-100 text-blue-700",
 employee: "bg-green-100 text-green-700",
 hr: "bg-yellow-100 text-yellow-700",
 };
 return colors[role] || "bg-slate-100 text-slate-700";
 };

 return (
 <Layout>
 <div className="section-header">
 <div className="section-actions">
 <div>
 <h2 className="section-title">All Users</h2>
 <p className="section-subtitle">
 {filtered.length} users across {companies.length} companies
 </p>
 </div>
 <button onClick={exportCSV} className="btn-primary">
 Export CSV
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
 <div className="flex flex-col sm:flex-row gap-3">
 <input
 type="search"
 placeholder="Search by name or email..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value);
 setPage(1);
 }}
 className="input-small flex-1"
 />
 <select
 value={filterCompany}
 onChange={(e) => {
 setFilterCompany(e.target.value);
 setPage(1);
 }}
 className="select-small"
 >
 <option value="">All Companies</option>
 {companies.map((c) => (
 <option key={c._id} value={c._id}>
 {c.name}
 </option>
 ))}
 </select>
 <select
 value={filterRole}
 onChange={(e) => {
 setFilterRole(e.target.value);
 setPage(1);
 }}
 className="select-small"
 >
 <option value="">All Roles</option>
 {roles.map((r) => (
 <option key={r} value={r}>
 {r}
 </option>
 ))}
 </select>
 <select
 value={filterStatus}
 onChange={(e) => {
 setFilterStatus(e.target.value);
 setPage(1);
 }}
 className="select-small"
 >
 <option value="">All Statuses</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>
 </div>

 {/* Table */}
 <section className="table-wrapper">
 <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
 <div className="flex items-center gap-2">
 <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
 <h3 className="text-lg font-bold text-slate-900">Users</h3>
 <span className="badge badge-pending">{filtered.length} total</span>
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
 <div className="text-slate-600 font-medium">Loading users...</div>
 </div>
 </div>
 ) : (
 <>
 <div className="hidden lg:block table-responsive">
 <table className="w-full">
 <thead className="table-header">
 <tr>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Name
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Email
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Role
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Company
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Status
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Last Active
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {paged.map((u) => (
 <tr key={u._id} className="table-row">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
 {u.name.charAt(0).toUpperCase()}
 </div>
 <span className="text-sm font-semibold text-slate-900">
 {u.name}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 text-sm text-slate-600">
 {u.email}
 </td>
 <td className="px-6 py-4">
 <span
 className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(
 u.role
 )}`}
 >
 {u.role}
 </span>
 </td>
 <td className="px-6 py-4 text-sm text-slate-700">
 {u.companyName}
 </td>
 <td className="px-6 py-4">
 <span
 className={`badge ${
 u.status === "active"
 ? "badge-active"
 : "badge-suspended"
 }`}
 >
 {u.status}
 </span>
 </td>
 <td className="px-6 py-4 text-sm text-slate-500">
 {u.lastActive
 ? new Date(u.lastActive).toLocaleDateString()
 : "N/A"}
 </td>
 <td className="px-6 py-4">
 <div className="flex gap-2">
 <button
 onClick={() => setViewUser(u)}
 className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
 >
 View
 </button>
 <button
 onClick={() => resetPassword(u._id)}
 className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
 >
 Reset Pwd
 </button>
 <button
 onClick={() => toggleStatus(u)}
 className={`${
 u.status === "active"
 ? "bg-red-500 hover:bg-red-600"
 : "bg-green-500 hover:bg-green-600"
 } text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors`}
 >
 {u.status === "active" ? "Deactivate" : "Activate"}
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards */}
 <div className="lg:hidden p-4 space-y-4">
 {paged.map((u) => (
 <div key={u._id} className="mobile-card">
 <div className="mobile-card-header">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
 {u.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <h4 className="font-semibold text-slate-900">
 {u.name}
 </h4>
 <p className="text-xs text-slate-500">{u.email}</p>
 </div>
 </div>
 <span
 className={`badge ${
 u.status === "active"
 ? "badge-active"
 : "badge-suspended"
 }`}
 >
 {u.status}
 </span>
 </div>
 <div className="mobile-card-content">
 <div className="mobile-card-row">
 <span className="mobile-card-label">Role</span>
 <span
 className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(
 u.role
 )}`}
 >
 {u.role}
 </span>
 </div>
 <div className="mobile-card-row">
 <span className="mobile-card-label">Company</span>
 <span className="mobile-card-value">
 {u.companyName}
 </span>
 </div>
 <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
 <button
 onClick={() => setViewUser(u)}
 className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
 >
 View
 </button>
 <button
 onClick={() => resetPassword(u._id)}
 className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
 >
 Reset Pwd
 </button>
 <button
 onClick={() => toggleStatus(u)}
 className={`${
 u.status === "active"
 ? "bg-red-500 hover:bg-red-600"
 : "bg-green-500 hover:bg-green-600"
 } text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors`}
 >
 {u.status === "active" ? "Deactivate" : "Activate"}
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
 <p className="text-sm text-slate-600">
 Showing {(page - 1) * perPage + 1} -{" "}
 {Math.min(page * perPage, filtered.length)} of{" "}
 {filtered.length}
 </p>
 <div className="flex gap-2">
 <button
 disabled={page <= 1}
 onClick={() => setPage((p) => p - 1)}
 className="btn-secondary-small disabled:opacity-50"
 >
 Previous
 </button>
 <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
 {page} / {totalPages}
 </span>
 <button
 disabled={page >= totalPages}
 onClick={() => setPage((p) => p + 1)}
 className="btn-secondary-small disabled:opacity-50"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </>
 )}
 </section>

 {/* View User Modal */}
 {viewUser && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
 <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-bold text-slate-900">
 User Details
 </h3>
 <button
 onClick={() => setViewUser(null)}
 className="text-slate-400 hover:text-slate-600 transition-colors"
 >
 <svg
 className="w-6 h-6"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 </div>
 </div>
 <div className="p-6 space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
 {viewUser.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="text-lg font-bold text-slate-900">
 {viewUser.name}
 </div>
 <div className="text-sm text-slate-600">{viewUser.email}</div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
 <div>
 <div className="text-xs text-slate-500 uppercase font-semibold">
 Role
 </div>
 <span
 className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(
 viewUser.role
 )}`}
 >
 {viewUser.role}
 </span>
 </div>
 <div>
 <div className="text-xs text-slate-500 uppercase font-semibold">
 Status
 </div>
 <span
 className={`inline-block mt-1 badge ${
 viewUser.status === "active"
 ? "badge-active"
 : "badge-suspended"
 }`}
 >
 {viewUser.status}
 </span>
 </div>
 <div>
 <div className="text-xs text-slate-500 uppercase font-semibold">
 Company
 </div>
 <div className="text-sm font-medium text-slate-900 mt-1">
 {viewUser.companyName}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 uppercase font-semibold">
 Joined
 </div>
 <div className="text-sm font-medium text-slate-900 mt-1">
 {new Date(viewUser.createdAt).toLocaleDateString()}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 uppercase font-semibold">
 Last Active
 </div>
 <div className="text-sm font-medium text-slate-900 mt-1">
 {viewUser.lastActive
 ? new Date(viewUser.lastActive).toLocaleDateString()
 : "N/A"}
 </div>
 </div>
 </div>
 </div>
 <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
 <button
 onClick={() => {
 resetPassword(viewUser._id);
 }}
 className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
 >
 Reset Password
 </button>
 <button
 onClick={() => {
 toggleStatus(viewUser);
 setViewUser(null);
 }}
 className={`${
 viewUser.status === "active"
 ? "bg-red-500 hover:bg-red-600"
 : "bg-green-500 hover:bg-green-600"
 } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
 >
 {viewUser.status === "active" ? "Deactivate" : "Activate"}
 </button>
 <button
 onClick={() => setViewUser(null)}
 className="btn-secondary ml-auto"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}
 </Layout>
 );
}
