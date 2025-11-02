"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

type DashboardStats = {
  companies: {
    total: number;
    active: number;
    suspended: number;
    thisMonth: number;
  };
  plans: {
    total: number;
  };
  users: {
    total: number;
    avgPerCompany: number;
  };
  inquiries: {
    pending: number;
  };
  earnings: {
    monthly: number;
    byPlan: Record<string, { count: number; mrr: number }>;
  };
  recentCompanies: Array<{
    _id: string;
    name: string;
    code: string;
    plan: string;
    status: string;
    createdAt: string;
  }>;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard/stats");
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    gradient,
    onClick,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    gradient: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`card-gradient ${gradient} ${
        onClick ? "card-interactive" : ""
      } group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white/80 mb-2 font-medium">{title}</div>
          <div className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-white/70 leading-relaxed">
              {subtitle}
            </div>
          )}
        </div>
        <div className="text-4xl sm:text-5xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 ml-4">
          {icon}
        </div>
      </div>
      {onClick && (
        <div className="absolute bottom-4 right-4 text-white/60 group-hover:text-white/80 transition-colors duration-300">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-slate-600 font-medium">
              Loading dashboard...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="section-subtitle">
              Welcome back,{" "}
              <span className="font-semibold">
                {user?.name || "Super Admin"}
              </span>
            </p>
          </div>
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                id="auto-refresh"
              />
              <label
                htmlFor="auto-refresh"
                className="cursor-pointer font-medium"
              >
                Auto-refresh (30s)
              </label>
            </div>
            {lastUpdated && (
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={loadStats}
              disabled={loading}
              className="btn-secondary-small"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>🔄 Refresh</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="responsive-grid-4 mb-8">
        <StatCard
          title="Total Companies"
          value={stats?.companies.total || 0}
          subtitle={`${stats?.companies.active || 0} active`}
          icon="🏢"
          gradient="from-blue-500 to-blue-600"
          onClick={() => router.push("/companies")}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.earnings.monthly || 0)}
          subtitle={`MRR from ${stats?.companies.active || 0} active companies`}
          icon="💰"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          subtitle={`~${Math.round(
            stats?.users.avgPerCompany || 0
          )} per company`}
          icon="👥"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pending Inquiries"
          value={stats?.inquiries.pending || 0}
          subtitle="Awaiting response"
          icon="📬"
          gradient="from-orange-500 to-orange-600"
          onClick={() => router.push("/inquiries")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="responsive-grid-3 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-900">
              Company Status
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="status-dot-active"></div>
                <span className="text-slate-700 font-medium">Active</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats?.companies.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="status-dot-suspended"></div>
                <span className="text-slate-700 font-medium">Suspended</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats?.companies.suspended || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-700 font-medium">This Month</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.companies.thisMonth || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-900">
              Plans Overview
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-700 font-medium">Total Plans</span>
              <span className="text-2xl font-bold text-slate-900">
                {stats?.plans.total || 0}
              </span>
            </div>
            {stats?.earnings.byPlan &&
              Object.entries(stats.earnings.byPlan).map(([plan, data]) => (
                <div
                  key={plan}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                >
                  <span className="text-slate-700 font-medium capitalize">
                    {plan}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {data.count} companies
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatCurrency(data.mrr)}/mo
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-900">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/companies/new")}
              className="w-full btn-primary text-sm justify-center"
            >
              <span className="mr-2">+</span>
              Add New Company
            </button>
            <button
              onClick={() => router.push("/plans/new")}
              className="w-full btn-secondary text-sm justify-center"
            >
              <span className="mr-2">+</span>
              Add New Plan
            </button>
            <button
              onClick={() => router.push("/companies")}
              className="w-full btn-secondary text-sm justify-center"
            >
              <span className="mr-2">👁️</span>
              View All Companies
            </button>
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-900">
              Recent Companies
            </h3>
          </div>
          <button
            onClick={() => router.push("/companies")}
            className="btn-secondary-small self-start sm:self-auto"
          >
            View All →
          </button>
        </div>

        {stats?.recentCompanies && stats.recentCompanies.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block table-responsive">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentCompanies.map((company) => (
                    <tr key={company._id} className="table-row">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {company.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">
                          {company.code}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 capitalize font-medium">
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            company.status === "active"
                              ? "badge-active"
                              : company.status === "suspended"
                              ? "badge-suspended"
                              : "badge-view-only"
                          }`}
                        >
                          <div
                            className={`status-dot ${
                              company.status === "active"
                                ? "status-dot-active"
                                : company.status === "suspended"
                                ? "status-dot-suspended"
                                : "status-dot-pending"
                            }`}
                          ></div>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(company.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-4">
              {stats.recentCompanies.map((company) => (
                <div key={company._id} className="mobile-card">
                  <div className="mobile-card-header">
                    <h4 className="font-semibold text-slate-900">
                      {company.name}
                    </h4>
                    <span
                      className={`badge ${
                        company.status === "active"
                          ? "badge-active"
                          : company.status === "suspended"
                          ? "badge-suspended"
                          : "badge-view-only"
                      }`}
                    >
                      <div
                        className={`status-dot ${
                          company.status === "active"
                            ? "status-dot-active"
                            : company.status === "suspended"
                            ? "status-dot-suspended"
                            : "status-dot-pending"
                        }`}
                      ></div>
                      {company.status}
                    </span>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Code</span>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {company.code}
                      </code>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Plan</span>
                      <span className="mobile-card-value capitalize">
                        {company.plan}
                      </span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Created</span>
                      <span className="mobile-card-value">
                        {formatDate(company.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-lg font-medium mb-2">No companies yet</p>
            <button
              onClick={() => router.push("/companies/new")}
              className="btn-primary-small"
            >
              Create your first company →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
