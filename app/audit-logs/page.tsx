"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type AuditLog = {
 _id: string;
 userId?: string;
 userName?: string;
 action: string;
 resourceType?: string;
 details?: string;
 ipAddress?: string;
 timestamp?: string;
 createdAt?: string;
};

type AuditStats = {
 today?: number;
 thisWeek?: number;
 thisMonth?: number;
};

export default function AuditLogsPage() {
 const router = useRouter();
 const [logs, setLogs] = useState<AuditLog[]>([]);
 const [stats, setStats] = useState<AuditStats>({});
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [actionFilter, setActionFilter] = useState("");
 const [dateFrom, setDateFrom] = useState("");
 const [dateTo, setDateTo] = useState("");
 const [page, setPage] = useState(1);
 const perPage = 25;

 async function loadLogs() {
 setLoading(true);
 try {
 const params: Record<string, string> = {};
 if (search) params.search = search;
 if (actionFilter) params.action = actionFilter;
 if (dateFrom) params.from = dateFrom;
 if (dateTo) params.to = dateTo;

 const [logsRes, statsRes] = await Promise.all([
 api.get("/audit-dashboard/logs", { params }),
 api.get("/audit-dashboard/stats"),
 ]);
 setLogs(logsRes.data.logs || logsRes.data || []);
 setStats(statsRes.data.stats || statsRes.data || {});
 } catch (err) {
 console.error("Failed to load audit logs", err);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadLogs();
 }, []);

 const filtered = useMemo(() => {
 let list = logs;
 if (search) {
 const q = search.toLowerCase();
 list = list.filter(
 (l) =>
 (l.userName || "").toLowerCase().includes(q) ||
 (l.action || "").toLowerCase().includes(q) ||
 (l.details || "").toLowerCase().includes(q)
 );
 }
 if (actionFilter) {
 list = list.filter((l) => l.action === actionFilter);
 }
 if (dateFrom) {
 const from = new Date(dateFrom);
 list = list.filter(
 (l) => new Date(l.timestamp || l.createdAt || "") >= from
 );
 }
 if (dateTo) {
 const to = new Date(dateTo);
 to.setHours(23, 59, 59, 999);
 list = list.filter(
 (l) => new Date(l.timestamp || l.createdAt || "") <= to
 );
 }
 return list;
 }, [logs, search, actionFilter, dateFrom, dateTo]);

 const totalPages = Math.ceil(filtered.length / perPage);
 const paged = filtered.slice((page - 1) * perPage, page * perPage);

 const actionTypes = useMemo(
 () => Array.from(new Set(logs.map((l) => l.action))).sort(),
 [logs]
 );

 async function exportLogs() {
 try {
 const res = await api.get("/audit-dashboard/export", {
 responseType: "blob",
 });
 const url = URL.createObjectURL(new Blob([res.data]));
 const a = document.createElement("a");
 a.href = url;
 a.download = "audit_logs_export.xlsx";
 a.click();
 URL.revokeObjectURL(url);
 } catch (err: any) {
 alert(`Export failed: ${err.response?.data?.message || err.message}`);
 }
 }

 return (
 <Layout>
 <div className="section-header">
 <div className="section-actions">
 <div>
 <h2 className="section-title">Audit Logs</h2>
 <p className="section-subtitle">
 Track all system activity and user actions
 </p>
 </div>
 <button onClick={exportLogs} className="btn-primary">
 Export Excel
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
 <div className="bg-white rounded-xl border border-slate-200 p-5">
 <div className="text-sm text-slate-500 font-medium">Actions Today</div>
 <div className="text-3xl font-bold text-blue-600 mt-1">
 {stats.today ?? 0}
 </div>
 </div>
 <div className="bg-white rounded-xl border border-slate-200 p-5">
 <div className="text-sm text-slate-500 font-medium">This Week</div>
 <div className="text-3xl font-bold text-green-600 mt-1">
 {stats.thisWeek ?? 0}
 </div>
 </div>
 <div className="bg-white rounded-xl border border-slate-200 p-5">
 <div className="text-sm text-slate-500 font-medium">This Month</div>
 <div className="text-3xl font-bold text-purple-600 mt-1">
 {stats.thisMonth ?? 0}
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
 <div className="flex flex-col sm:flex-row gap-3">
 <input
 type="search"
 placeholder="Search logs..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value);
 setPage(1);
 }}
 className="input-small flex-1"
 />
 <select
 value={actionFilter}
 onChange={(e) => {
 setActionFilter(e.target.value);
 setPage(1);
 }}
 className="select-small"
 >
 <option value="">All Actions</option>
 {actionTypes.map((a) => (
 <option key={a} value={a}>
 {a}
 </option>
 ))}
 </select>
 <div className="flex gap-2 items-center">
 <label className="text-sm text-slate-600">From:</label>
 <input
 type="date"
 value={dateFrom}
 onChange={(e) => {
 setDateFrom(e.target.value);
 setPage(1);
 }}
 className="input-small"
 />
 </div>
 <div className="flex gap-2 items-center">
 <label className="text-sm text-slate-600">To:</label>
 <input
 type="date"
 value={dateTo}
 onChange={(e) => {
 setDateTo(e.target.value);
 setPage(1);
 }}
 className="input-small"
 />
 </div>
 <button
 onClick={() => {
 loadLogs();
 setPage(1);
 }}
 className="btn-secondary-small"
 >
 Apply
 </button>
 </div>
 </div>

 {/* Table */}
 <section className="table-wrapper">
 <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
 <div className="flex items-center gap-2">
 <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
 <h3 className="text-lg font-bold text-slate-900">Log Entries</h3>
 <span className="badge badge-pending">{filtered.length} total</span>
 </div>
 </div>

 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
 <div className="text-slate-600 font-medium">Loading logs...</div>
 </div>
 </div>
 ) : (
 <>
 <div className="hidden lg:block table-responsive">
 <table className="w-full">
 <thead className="table-header">
 <tr>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Timestamp
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 User
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Action
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Resource
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 Details
 </th>
 <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
 IP Address
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {paged.map((l) => (
 <tr key={l._id} className="table-row">
 <td className="px-6 py-4 text-sm text-slate-500">
 {new Date(
 l.timestamp || l.createdAt || ""
 ).toLocaleString()}
 </td>
 <td className="px-6 py-4 text-sm font-medium text-slate-900">
 {l.userName || "System"}
 </td>
 <td className="px-6 py-4">
 <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
 {l.action}
 </span>
 </td>
 <td className="px-6 py-4 text-sm text-slate-600">
 {l.resourceType || "N/A"}
 </td>
 <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
 {l.details || "N/A"}
 </td>
 <td className="px-6 py-4 text-sm font-mono text-slate-500">
 {l.ipAddress || "N/A"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Mobile Cards */}
 <div className="lg:hidden p-4 space-y-4">
 {paged.map((l) => (
 <div key={l._id} className="mobile-card">
 <div className="mobile-card-header">
 <span className="text-sm font-medium text-slate-900">
 {l.userName || "System"}
 </span>
 <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
 {l.action}
 </span>
 </div>
 <div className="mobile-card-content">
 <div className="mobile-card-row">
 <span className="mobile-card-label">Time</span>
 <span className="mobile-card-value text-xs">
 {new Date(l.timestamp || l.createdAt || "").toLocaleString()}
 </span>
 </div>
 <div className="mobile-card-row">
 <span className="mobile-card-label">Resource</span>
 <span className="mobile-card-value">{l.resourceType || "N/A"}</span>
 </div>
 {l.details && (
 <div className="mobile-card-row">
 <span className="mobile-card-label">Details</span>
 <span className="mobile-card-value text-xs truncate max-w-[200px]">{l.details}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
 <p className="text-sm text-slate-600">
 Showing {(page - 1) * perPage + 1} -{" "}
 {Math.min(page * perPage, filtered.length)} of {filtered.length}
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

 {/* Note */}
 <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
 <strong>Note:</strong> The audit dashboard API filters by the company of the logged-in user.
 For super_admin accounts, all company logs should be visible if the backend supports it.
 </div>
 </Layout>
 );
}
