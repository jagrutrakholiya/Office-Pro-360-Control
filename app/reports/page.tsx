"use client";

import { useState, useEffect } from "react";

interface Report {
  _id: string;
  name: string;
  description?: string;
  type: string;
  createdAt: string;
}

interface Execution {
  _id: string;
  reportConfigId?: { name: string };
  status: string;
  createdAt: string;
  duration?: number;
}

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: string;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
}

const reportTypes = [
  { value: "task_summary", label: "Task Summary" },
  { value: "project_summary", label: "Project Summary" },
  { value: "team_performance", label: "Team Performance" },
  { value: "productivity", label: "Productivity Report" },
  { value: "completion_trends", label: "Completion Trends" },
];

const datePresets = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("last_30_days");

  useEffect(() => {
    fetchReports();
    fetchExecutions();
    fetchAnalytics();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/reports/configs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/reports/executions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExecutions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching executions:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/analytics?type=overview&period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const executeReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/reports/configs/${reportId}/execute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchExecutions();
        alert("Report executed successfully!");
      }
    } catch (error) {
      console.error("Error executing report:", error);
      alert("Failed to execute report");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500",
      processing: "bg-blue-500",
      failed: "bg-red-500",
      pending: "bg-yellow-500",
    };

    const color = statusColors[status] || "bg-gray-500";

    return (
      <span className={`px-2 py-1 rounded text-white text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  const filteredReports = reports.filter(
    (report) => selectedType === "all" || report.type === selectedType
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Generate insights and track performance
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          📊 Create Report
        </button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Tasks
            </div>
            <div className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Completion Rate
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.completionRate}%
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Active Projects
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.activeProjects}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Overdue Tasks
            </div>
            <div className="text-2xl font-bold text-red-600">
              {analytics.overdueTasks}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {datePresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Saved Reports</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports found. Create your first report to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const typeConfig = reportTypes.find((t) => t.value === report.type);

                return (
                  <div
                    key={report._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-600">
                            {report.description || "No description"} • {typeConfig?.label || report.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => executeReport(report._id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          ▶️ Run
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors">
                          ⬇️ Export
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Executions</h2>
        </div>
        <div className="p-6">
          {executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No report executions yet
            </div>
          ) : (
            <div className="space-y-3">
              {executions.slice(0, 10).map((execution) => (
                <div
                  key={execution._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {execution.reportConfigId?.name || "Unknown Report"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(execution.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(execution.status)}
                    {execution.duration && (
                      <span className="text-sm text-gray-600">
                        {(execution.duration / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
