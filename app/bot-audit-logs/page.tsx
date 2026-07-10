"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 Card,
 DataTable,
 Badge,
 Button,
 Select,
} from "@/components/ui";

type AuditLog = {
 _id: string;
 createdAt: string;
 action: string;
 status: string;
 companyId?: {
 name: string;
 code: string;
 };
 userName?: string;
 userEmail?: string;
 details?: string;
 tenantId?: string;
};

export default function BotAuditLogsPage() {
 const [logs, setLogs] = useState<AuditLog[]>([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState(0);
 const [filterAction, setFilterAction] = useState("");
 const [filterStatus, setFilterStatus] = useState("");

 useEffect(() => {
 loadLogs();
 }, [page, filterAction, filterStatus]);

 async function loadLogs() {
 setLoading(true);
 try {
 const params: any = { page, limit: 50 };
 if (filterAction) params.action = filterAction;
 if (filterStatus) params.status = filterStatus;

 const res = await api.get("/teams-bot/admin/audit-logs", { params });
 setLogs(res.data.logs || []);
 setTotal(res.data.pagination?.total || 0);
 } catch (err) {
 console.error("Failed to load logs:", err);
 } finally {
 setLoading(false);
 }
 }

 const actionVariants: Record<
 string,
 "success" | "info" | "danger" | "warning" | "neutral"
 > = {
 bot_installed: "success",
 installation_approved: "info",
 installation_rejected: "danger",
 message_sent: "info",
 tenant_mismatch: "warning",
 service_url_mismatch: "warning",
 security_violation: "danger",
 rate_limit_exceeded: "warning",
 message_failed: "danger",
 };

 const statusVariants: Record<
 string,
 "success" | "danger" | "warning" | "neutral"
 > = {
 success: "success",
 failure: "danger",
 warning: "warning",
 };

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Bot Audit Logs"
 description="View all Microsoft Teams bot activities and security events"
 />

 {/* Filters */}
 <Card padding="md">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Select
 label="Filter by Action"
 value={filterAction}
 onChange={(e) => {
 setFilterAction(e.target.value);
 setPage(1);
 }}
 >
 <option value="">All Actions</option>
 <option value="bot_installed">Bot Installed</option>
 <option value="installation_approved">Installation Approved</option>
 <option value="installation_rejected">Installation Rejected</option>
 <option value="message_sent">Message Sent</option>
 <option value="message_failed">Message Failed</option>
 <option value="tenant_mismatch">Tenant Mismatch</option>
 <option value="service_url_mismatch">Service URL Mismatch</option>
 <option value="security_violation">Security Violation</option>
 <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
 </Select>
 <Select
 label="Filter by Status"
 value={filterStatus}
 onChange={(e) => {
 setFilterStatus(e.target.value);
 setPage(1);
 }}
 >
 <option value="">All Statuses</option>
 <option value="success">Success</option>
 <option value="failure">Failure</option>
 <option value="warning">Warning</option>
 </Select>
 <div className="flex items-end">
 <Button
 variant="secondary"
 fullWidth
 onClick={() => {
 setFilterAction("");
 setFilterStatus("");
 setPage(1);
 loadLogs();
 }}
 >
 Reset Filters
 </Button>
 </div>
 </div>
 </Card>

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
 Audit Logs
 </h3>
 <Badge variant="neutral">{total} total</Badge>
 </div>
 <Button variant="secondary" size="sm" onClick={loadLogs}>
 Refresh
 </Button>
 </div>

 <DataTable
 loading={loading}
 data={logs}
 rowKey={(log: AuditLog) => log._id}
 emptyTitle="No Logs Found"
 emptyDescription="Try adjusting your filters"
 columns={[
 {
 key: "timestamp",
 header: "Timestamp",
 render: (log: AuditLog) => (
 <div>
 <div className="text-sm text-slate-900 dark:text-slate-100">
 {new Date(log.createdAt).toLocaleDateString()}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {new Date(log.createdAt).toLocaleTimeString()}
 </div>
 </div>
 ),
 },
 {
 key: "company",
 header: "Company",
 render: (log: AuditLog) =>
 log.companyId ? (
 <div>
 <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
 {log.companyId.name}
 </div>
 <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
 {log.companyId.code}
 </code>
 </div>
 ) : (
 <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
 ),
 },
 {
 key: "action",
 header: "Action",
 render: (log: AuditLog) => (
 <Badge variant={actionVariants[log.action] || "neutral"}>
 {log.action.replace(/_/g, " ")}
 </Badge>
 ),
 },
 {
 key: "status",
 header: "Status",
 render: (log: AuditLog) => (
 <Badge variant={statusVariants[log.status] || "neutral"}>
 <span className="capitalize">{log.status}</span>
 </Badge>
 ),
 },
 {
 key: "user",
 header: "User",
 render: (log: AuditLog) =>
 log.userName ? (
 <div>
 <div className="text-sm text-slate-900 dark:text-slate-100">
 {log.userName}
 </div>
 {log.userEmail && (
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {log.userEmail}
 </div>
 )}
 </div>
 ) : (
 <span className="text-sm text-slate-400 dark:text-slate-500">
 System
 </span>
 ),
 },
 {
 key: "details",
 header: "Details",
 render: (log: AuditLog) => (
 <div className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">
 {log.details || "-"}
 </div>
 ),
 },
 ]}
 />

 {/* Pagination */}
 {!loading && total > 50 && (
 <div className="flex items-center justify-between">
 <div className="text-sm text-slate-600 dark:text-slate-400">
 Showing {(page - 1) * 50 + 1}-{Math.min(page * 50, total)} of{" "}
 {total} logs
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 >
 Previous
 </Button>
 <span className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
 Page {page}
 </span>
 <Button
 variant="secondary"
 size="sm"
 onClick={() => setPage((p) => p + 1)}
 disabled={page * 50 >= total}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>

 {/* Security Alerts */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg">
 <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">
 Security Violations
 </h4>
 <p className="text-2xl font-bold text-red-600 dark:text-red-400">
 {logs.filter((l) => l.action === "security_violation").length}
 </p>
 <p className="text-xs text-red-700 dark:text-red-400/80 mt-1">
 In current view
 </p>
 </div>

 <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/40 rounded-lg">
 <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
 Failed Actions
 </h4>
 <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
 {logs.filter((l) => l.status === "failure").length}
 </p>
 <p className="text-xs text-orange-700 dark:text-orange-400/80 mt-1">
 In current view
 </p>
 </div>

 <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-lg">
 <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
 Successful Actions
 </h4>
 <p className="text-2xl font-bold text-green-600 dark:text-green-400">
 {logs.filter((l) => l.status === "success").length}
 </p>
 <p className="text-xs text-green-700 dark:text-green-400/80 mt-1">
 In current view
 </p>
 </div>
 </div>
 </div>
 </Layout>
 );
}
