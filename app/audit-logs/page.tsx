"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 StatCard,
 Card,
 DataTable,
 Badge,
 Button,
 Input,
 Select,
} from "@/components/ui";

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
 <div className="space-y-6">
 <PageHeader
 title="Audit Logs"
 description="Track all system activity and user actions"
 actions={<Button onClick={exportLogs}>Export Excel</Button>}
 />

 {/* Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Actions Today" value={stats.today ?? 0} accent="primary" />
 <StatCard label="This Week" value={stats.thisWeek ?? 0} accent="success" />
 <StatCard label="This Month" value={stats.thisMonth ?? 0} accent="neutral" />
 </div>

 {/* Filters */}
 <Card padding="md">
 <div className="flex flex-col sm:flex-row flex-wrap gap-3">
 <Input
 type="search"
 placeholder="Search logs..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value);
 setPage(1);
 }}
 className="flex-1 min-w-[180px]"
 />
 <Select
 value={actionFilter}
 onChange={(e) => {
 setActionFilter(e.target.value);
 setPage(1);
 }}
 >
 <option value="">All Actions</option>
 {actionTypes.map((a) => (
 <option key={a} value={a}>
 {a}
 </option>
 ))}
 </Select>
 <Input
 label="From"
 type="date"
 value={dateFrom}
 onChange={(e) => {
 setDateFrom(e.target.value);
 setPage(1);
 }}
 />
 <Input
 label="To"
 type="date"
 value={dateTo}
 onChange={(e) => {
 setDateTo(e.target.value);
 setPage(1);
 }}
 />
 <div className="flex items-end">
 <Button
 variant="secondary"
 onClick={() => {
 loadLogs();
 setPage(1);
 }}
 >
 Apply
 </Button>
 </div>
 </div>
 </Card>

 {/* Table */}
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
 Log Entries
 </h3>
 <Badge variant="neutral">{filtered.length} total</Badge>
 </div>

 <DataTable
 loading={loading}
 data={paged}
 rowKey={(l: AuditLog) => l._id}
 emptyTitle="No logs found"
 emptyDescription="Try adjusting your filters."
 columns={[
 {
 key: "timestamp",
 header: "Timestamp",
 render: (l: AuditLog) => (
 <span className="text-slate-500 dark:text-slate-400">
 {new Date(l.timestamp || l.createdAt || "").toLocaleString()}
 </span>
 ),
 },
 {
 key: "user",
 header: "User",
 render: (l: AuditLog) => (
 <span className="font-medium text-slate-900 dark:text-slate-100">
 {l.userName || "System"}
 </span>
 ),
 },
 {
 key: "action",
 header: "Action",
 render: (l: AuditLog) => <Badge variant="info">{l.action}</Badge>,
 },
 {
 key: "resource",
 header: "Resource",
 render: (l: AuditLog) => l.resourceType || "N/A",
 },
 {
 key: "details",
 header: "Details",
 render: (l: AuditLog) => (
 <span className="max-w-xs truncate block">{l.details || "N/A"}</span>
 ),
 },
 {
 key: "ip",
 header: "IP Address",
 render: (l: AuditLog) => (
 <span className="font-mono text-slate-500 dark:text-slate-400">
 {l.ipAddress || "N/A"}
 </span>
 ),
 },
 ]}
 />

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between">
 <p className="text-sm text-slate-600 dark:text-slate-400">
 Showing {(page - 1) * perPage + 1} -{" "}
 {Math.min(page * perPage, filtered.length)} of {filtered.length}
 </p>
 <div className="flex items-center gap-2">
 <Button
 variant="secondary"
 size="sm"
 disabled={page <= 1}
 onClick={() => setPage((p) => p - 1)}
 >
 Previous
 </Button>
 <span className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
 {page} / {totalPages}
 </span>
 <Button
 variant="secondary"
 size="sm"
 disabled={page >= totalPages}
 onClick={() => setPage((p) => p + 1)}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>

 {/* Note */}
 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-sm text-amber-800 dark:text-amber-300">
 <strong>Note:</strong> The audit dashboard API filters by the company of the logged-in user.
 For super_admin accounts, all company logs should be visible if the backend supports it.
 </div>
 </div>
 </Layout>
 );
}
