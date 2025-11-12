"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type Query = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  companyId: {
    _id: string;
    name: string;
    code: string;
  };
  subject: string;
  description: string;
  screenshot: string | null;
  status: "new" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  adminNotes: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: {
    name: string;
    email: string;
  } | null;
};

type Stats = {
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
};

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState<Stats>({
    new: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  async function loadQueries() {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== "all") {
        params.status = filter;
      }

      const res = await api.get("/queries/all", { params });
      setQueries(res.data.queries || []);
      setStats(
        res.data.stats || { new: 0, in_progress: 0, resolved: 0, closed: 0 }
      );
    } catch (error) {
      console.error("Failed to load queries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueries();
  }, [filter]);

  async function updateQueryStatus(
    queryId: string,
    newStatus: string,
    newPriority?: string
  ) {
    setUpdatingStatus(true);
    try {
      const payload: any = { status: newStatus };
      if (adminNotes) payload.adminNotes = adminNotes;
      if (newPriority) payload.priority = newPriority;

      await api.patch(`/queries/${queryId}/status`, payload);
      await loadQueries();

      // Update selected query if it's the one being updated
      if (selectedQuery && selectedQuery._id === queryId) {
        const updated = queries.find((q) => q._id === queryId);
        if (updated) {
          setSelectedQuery({ ...updated, status: newStatus as any });
        }
      }

      setAdminNotes("");
      alert("Query updated successfully!");
    } catch (error: any) {
      console.error("Failed to update query:", error);
      alert(
        `Failed to update: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "badge-pending";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "badge-active";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "badge-pending";
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case "low":
        return "🟢";
      case "medium":
        return "🟡";
      case "high":
        return "🟠";
      case "critical":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">User Queries & Issues</h2>
            <p className="section-subtitle">
              Manage and resolve user-reported issues
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">New Issues</p>
              <p className="text-3xl font-bold text-red-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
              🆕
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.in_progress}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.resolved}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Closed</p>
              <p className="text-3xl font-bold text-slate-600">
                {stats.closed}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
              🔒
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Queries", count: queries.length },
            { key: "new", label: "New", count: stats.new },
            {
              key: "in_progress",
              label: "In Progress",
              count: stats.in_progress,
            },
            { key: "resolved", label: "Resolved", count: stats.resolved },
            { key: "closed", label: "Closed", count: stats.closed },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Queries Table */}
      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">
              {filter === "all"
                ? "All Queries"
                : `${filter.replace("_", " ").toUpperCase()} Queries`}
            </h3>
            <span className="badge badge-pending">{queries.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl font-semibold">No queries found</p>
            <p className="text-sm mt-2">
              {filter === "all"
                ? "No user queries have been submitted yet"
                : `No ${filter.replace("_", " ")} queries found`}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left px-6 py-4">Priority</th>
                  <th className="text-left px-6 py-4">Subject</th>
                  <th className="text-left px-6 py-4">User</th>
                  <th className="text-left px-6 py-4">Company</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Created</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queries.map((query) => (
                  <tr key={query._id} className="table-row">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                          query.priority
                        )}`}
                      >
                        {getPriorityEmoji(query.priority)} {query.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">
                        {query.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">
                          {query.userId.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {query.userId.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {query.companyId.name}
                      </div>
                      <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {query.companyId.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusColor(query.status)}`}>
                        {query.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(query.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setAdminNotes(query.adminNotes || "");
                        }}
                        className="btn-primary-small"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedQuery(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityColor(
                        selectedQuery.priority
                      )}`}
                    >
                      {getPriorityEmoji(selectedQuery.priority)}{" "}
                      {selectedQuery.priority}
                    </span>
                    <span
                      className={`badge ${getStatusColor(
                        selectedQuery.status
                      )}`}
                    >
                      {selectedQuery.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedQuery.subject}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Reported by <strong>{selectedQuery.userId.name}</strong> (
                    {selectedQuery.userId.email}) from{" "}
                    <strong>{selectedQuery.companyId.name}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(selectedQuery.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Description
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedQuery.description}
                </div>
              </div>

              {/* Screenshot */}
              {selectedQuery.screenshot && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Screenshot
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={selectedQuery.screenshot}
                      alt="Issue screenshot"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-lg font-semibold text-slate-900 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this query..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Status Update */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Update Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["new", "in_progress", "resolved", "closed"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateQueryStatus(selectedQuery._id, status)
                        }
                        disabled={
                          updatingStatus || selectedQuery.status === status
                        }
                        className={`px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedQuery.status === status
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-white border-1 border-slate-200 text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {status.replace("_", " ").toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Resolution Info */}
              {selectedQuery.resolvedAt && selectedQuery.resolvedBy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-1">
                    Resolved
                  </h4>
                  <p className="text-sm text-green-700">
                    Resolved by <strong>{selectedQuery.resolvedBy.name}</strong>{" "}
                    on {new Date(selectedQuery.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setSelectedQuery(null)}
                className="btn-secondary w-full sm:w-auto"
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
