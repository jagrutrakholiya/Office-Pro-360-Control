"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

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

  const actionColors: Record<string, string> = {
    bot_installed: "bg-green-100 text-green-800",
    installation_approved: "bg-blue-100 text-blue-800",
    installation_rejected: "bg-red-100 text-red-800",
    message_sent: "bg-indigo-100 text-indigo-800",
    tenant_mismatch: "bg-orange-100 text-orange-800",
    service_url_mismatch: "bg-orange-100 text-orange-800",
    security_violation: "bg-red-100 text-red-800",
    rate_limit_exceeded: "bg-yellow-100 text-yellow-800",
    message_failed: "bg-red-100 text-red-800",
  };

  const statusIcons: Record<string, string> = {
    success: "✅",
    failure: "❌",
    warning: "⚠️",
  };

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">📊 Bot Audit Logs</h2>
            <p className="section-subtitle">
              View all Microsoft Teams bot activities and security events
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              className="select-small w-full"
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="select-small w-full"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterAction("");
                setFilterStatus("");
                setPage(1);
                loadLogs();
              }}
              className="btn-secondary w-full"
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      </div>

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-900">Audit Logs</h3>
              <span className="badge badge-pending">{total} total</span>
            </div>
            <button
              onClick={loadLogs}
              className="btn-secondary-small"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-lg font-medium text-slate-900">No Logs Found</p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Timestamp
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Company
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Action
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.companyId ? (
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {log.companyId.name}
                          </div>
                          <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {log.companyId.code}
                          </code>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actionColors[log.action] ||
                          "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {statusIcons[log.status] || "🔵"}
                        </span>
                        <span className="text-sm capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.userName ? (
                        <div>
                          <div className="text-sm text-slate-900">
                            {log.userName}
                          </div>
                          {log.userEmail && (
                            <div className="text-xs text-slate-500">
                              {log.userEmail}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-md truncate">
                        {log.details || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && total > 50 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {(page - 1) * 50 + 1}-{Math.min(page * 50, total)} of{" "}
                {total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-slate-700">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 50 >= total}
                  className="btn-secondary-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Security Alerts */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🚨</span>
            <h4 className="font-semibold text-red-900">Security Violations</h4>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.action === "security_violation").length}
          </p>
          <p className="text-xs text-red-700 mt-1">In current view</p>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <h4 className="font-semibold text-orange-900">Failed Actions</h4>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {logs.filter((l) => l.status === "failure").length}
          </p>
          <p className="text-xs text-orange-700 mt-1">In current view</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✅</span>
            <h4 className="font-semibold text-green-900">Successful Actions</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter((l) => l.status === "success").length}
          </p>
          <p className="text-xs text-green-700 mt-1">In current view</p>
        </div>
      </div>
    </Layout>
  );
}
