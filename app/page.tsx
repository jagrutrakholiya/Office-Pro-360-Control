"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to enhanced dashboard
    router.replace("/enhanced-dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-600 font-medium animate-pulse">
          Loading dashboard...
        </div>
      </div>
    </div>
  );
}
        api.get("/admin/metrics/company-status-distribution"),
        api.get("/admin/metrics/earnings")
      ]);
      
      setStats(statsRes.data);
      setRevenueTrend(revenueRes.data);
      setCompanyStatus(statusRes.data);
      setEarningsData(earningsRes.data);
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
      className={`
        relative overflow-hidden rounded-2xl p-6 shadow-lg 
        bg-gradient-to-br ${gradient}
        ${onClick ? "cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300" : ""}
        group
      `}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">
              {icon}
            </div>
            <div className="text-sm text-white/90 font-semibold uppercase tracking-wide">
              {title}
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-bold mb-2 text-white drop-shadow-lg">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-white/80 leading-relaxed font-medium">
              {subtitle}
            </div>
          )}
        </div>
        {onClick && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-45">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/0 via-white/50 to-white/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
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
                  <div className="w-4 h-4 border-1 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
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
          subtitle={`MRR from ${stats?.companies.active || 0} active ${
            stats?.companies.active === 1 ? "company" : "companies"
          }`}
          icon="💰"
          gradient="from-green-500 to-emerald-600"
          onClick={() => router.push("/earnings")}
        />
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          subtitle={`Avg ${Math.round(
            stats?.users.avgPerCompany || 0
          )} users per company`}
          icon="👥"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pending Issues"
          value={stats?.queries?.new || 0}
          subtitle="User-reported issues"
          icon="�"
          gradient="from-red-500 to-red-600"
          onClick={() => router.push("/queries")}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Revenue Trend (Last 6 Months)
                </h3>
                {revenueTrend && (
                  <p className="text-sm text-slate-600 mt-1">
                    Total: {formatCurrency(revenueTrend.totalLast6Months)} | Growth: {revenueTrend.growthRate.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
          {revenueTrend ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={revenueTrend.trend.map(item => ({
                  month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
                  revenue: item.revenue
                }))}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Loading revenue data...
            </div>
          )}
        </div>

        {/* Company Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Company Status Distribution
                </h3>
                {companyStatus && (
                  <p className="text-sm text-slate-600 mt-1">
                    Total: {companyStatus.total} companies
                  </p>
                )}
              </div>
            </div>
          </div>
          {companyStatus ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: companyStatus.statuses.active },
                    { name: "View Only", value: companyStatus.statuses.view_only },
                    { name: "Suspended", value: companyStatus.statuses.suspended },
                    { name: "Pending", value: companyStatus.statuses.pending },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2, 3].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Loading company data...
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Plan */}
      {earningsData && earningsData.totalMRR > 0 && (
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Revenue by Plan
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Total MRR: {formatCurrency(earningsData.totalMRR)} from {earningsData.totalCompanies} companies
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(earningsData.byPlan)
                .filter(([_, data]) => data.count > 0)
                .map(([plan, data]) => ({
                  plan: plan.charAt(0).toUpperCase() + plan.slice(1),
                  mrr: data.mrr,
                  companies: data.count
                }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number, name: string) => [
                  name === "mrr" ? formatCurrency(value) : value,
                  name === "mrr" ? "Monthly Revenue" : "Companies"
                ]}
              />
              <Legend />
              <Bar dataKey="mrr" fill="#8b5cf6" name="Monthly Revenue" />
              <Bar dataKey="companies" fill="#3b82f6" name="Companies" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Marketing Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => router.push("/blog")}
          className="card group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl">
              📝
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Blog Posts
              </h4>
              <p className="text-sm text-slate-600">
                Manage marketing content
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/screenshots")}
          className="card group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl">
              📸
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Screenshots
              </h4>
              <p className="text-sm text-slate-600">Upload product images</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/marketing-stats")}
          className="card group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl">
              📊
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Marketing Stats
              </h4>
              <p className="text-sm text-slate-600">Update website stats</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/reviews")}
          className="card group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-yellow-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-3xl">
              ⭐
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Reviews
              </h4>
              <p className="text-sm text-slate-600">Manage testimonials</p>
            </div>
          </div>
        </button>
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
