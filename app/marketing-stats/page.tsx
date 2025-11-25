"use client";
import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Simple toast notifications
const showToast = (message: string, type: "success" | "error" = "success") => {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  } text-white font-medium`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

interface Testimonial {
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  isActive: boolean;
}

interface TrustedByLogo {
  name: string;
  logoUrl: string;
  isActive: boolean;
}

interface MarketingStats {
  activeCompanies: number;
  activeUsers: number;
  dailyUptimeSLA: number;
  integrationsCount: number;
  testimonials: Testimonial[];
  trustedByLogos: TrustedByLogo[];
  autoUpdate: boolean;
  lastUpdated: string;
}

export default function MarketingStatsPage() {
  const [stats, setStats] = useState<MarketingStats>({
    activeCompanies: 0,
    activeUsers: 0,
    dailyUptimeSLA: 99.9,
    integrationsCount: 15,
    testimonials: [],
    trustedByLogos: [],
    autoUpdate: false,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "stats" | "testimonials" | "logos"
  >("stats");

  // New testimonial form
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    name: "",
    company: "",
    role: "",
    content: "",
    rating: 5,
    avatar: "",
    isActive: true,
  });

  // New logo form
  const [newLogo, setNewLogo] = useState<TrustedByLogo>({
    name: "",
    logoUrl: "",
    isActive: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/marketing/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      showToast("Failed to load stats", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/marketing/admin/stats", stats);
      showToast("Stats updated successfully!", "success");
      fetchStats();
    } catch (error) {
      showToast("Error updating stats", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/marketing/admin/stats/refresh");
      showToast("Stats refreshed from database!", "success");
      fetchStats();
    } catch (error) {
      showToast("Error refreshing stats", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const addTestimonial = () => {
    if (
      !newTestimonial.name ||
      !newTestimonial.company ||
      !newTestimonial.content
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setStats({
      ...stats,
      testimonials: [...stats.testimonials, { ...newTestimonial }],
    });

    setNewTestimonial({
      name: "",
      company: "",
      role: "",
      content: "",
      rating: 5,
      avatar: "",
      isActive: true,
    });

    showToast("Testimonial added! Don't forget to save.", "success");
  };

  const removeTestimonial = (index: number) => {
    setStats({
      ...stats,
      testimonials: stats.testimonials.filter((_, i) => i !== index),
    });
    showToast("Testimonial removed! Don't forget to save.", "success");
  };

  const toggleTestimonialStatus = (index: number) => {
    const updated = [...stats.testimonials];
    updated[index].isActive = !updated[index].isActive;
    setStats({ ...stats, testimonials: updated });
  };

  const addLogo = () => {
    if (!newLogo.name || !newLogo.logoUrl) {
      showToast("Please provide logo name and URL", "error");
      return;
    }

    setStats({
      ...stats,
      trustedByLogos: [...stats.trustedByLogos, { ...newLogo }],
    });

    setNewLogo({ name: "", logoUrl: "", isActive: true });
    showToast("Logo added! Don't forget to save.", "success");
  };

  const removeLogo = (index: number) => {
    setStats({
      ...stats,
      trustedByLogos: stats.trustedByLogos.filter((_, i) => i !== index),
    });
    showToast("Logo removed! Don't forget to save.", "success");
  };

  const toggleLogoStatus = (index: number) => {
    const updated = [...stats.trustedByLogos];
    updated[index].isActive = !updated[index].isActive;
    setStats({ ...stats, trustedByLogos: updated });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Marketing Stats Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage public-facing statistics, testimonials, and trusted
                company logos
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {refreshing ? "Refreshing..." : "Refresh from DB"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === "stats"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Statistics
              {activeTab === "stats" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === "testimonials"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Testimonials ({stats.testimonials.length})
              {activeTab === "testimonials" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("logos")}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === "logos"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Trusted By ({stats.trustedByLogos.length})
              {activeTab === "logos" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Companies */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Active Companies
                </label>
                <input
                  type="number"
                  value={stats.activeCompanies}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      activeCompanies: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 text-2xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Active Users */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Active Users
                </label>
                <input
                  type="number"
                  value={stats.activeUsers}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      activeUsers: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 text-2xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Uptime SLA */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Daily Uptime SLA (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={stats.dailyUptimeSLA}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      dailyUptimeSLA: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 text-2xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Integrations */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-600 rounded-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Integrations Count
                </label>
                <input
                  type="number"
                  value={stats.integrationsCount}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      integrationsCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 text-2xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Auto Update Toggle */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Auto-Update from Database
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically sync companies and users count from database
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stats.autoUpdate}
                    onChange={(e) =>
                      setStats({ ...stats, autoUpdate: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Statistics Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Platform Statistics Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Companies", value: stats.activeCompanies },
                      { name: "Users", value: stats.activeUsers },
                      { name: "Integrations", value: stats.integrationsCount },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Testimonials Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Testimonials by Rating
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "5 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 5).length,
                        },
                        {
                          name: "4 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 4).length,
                        },
                        {
                          name: "3 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 3).length,
                        },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        {
                          name: "5 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 5).length,
                        },
                        {
                          name: "4 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 4).length,
                        },
                        {
                          name: "3 Stars",
                          value: stats.testimonials.filter((t) => t.rating === 3).length,
                        },
                      ]
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Uptime SLA Gauge */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 lg:col-span-2">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Content Activity Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { name: "Testimonials", Active: stats.testimonials.filter(t => t.isActive).length, Inactive: stats.testimonials.filter(t => !t.isActive).length },
                      { name: "Logos", Active: stats.trustedByLogos.filter(l => l.isActive).length, Inactive: stats.trustedByLogos.filter(l => !l.isActive).length },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Active" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Inactive" fill={COLORS[3]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            {/* Add New Testimonial */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-4">
                Add New Testimonial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.name}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.company}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="CEO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <select
                    value={newTestimonial.rating}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {"⭐".repeat(rating)} ({rating} stars)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    value={newTestimonial.avatar}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        avatar: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Testimonial Content *
                  </label>
                  <textarea
                    value={newTestimonial.content}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        content: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience with OfficePro360..."
                  />
                </div>
              </div>
              <button
                onClick={addTestimonial}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Add Testimonial
              </button>
            </div>

            {/* Testimonials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-6 border ${
                    testimonial.isActive
                      ? "border-slate-200 dark:border-slate-700"
                      : "border-slate-300 dark:border-slate-600 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {testimonial.avatar && (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTestimonialStatus(index)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title={testimonial.isActive ? "Hide" : "Show"}
                      >
                        {testimonial.isActive ? (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => removeTestimonial(index)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">
                    {testimonial.content}
                  </p>
                </div>
              ))}
            </div>

            {stats.testimonials.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No testimonials yet. Add your first testimonial above!
              </div>
            )}
          </div>
        )}

        {/* Logos Tab */}
        {activeTab === "logos" && (
          <div className="space-y-6">
            {/* Add New Logo */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-4">
                Add New Trusted Company
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newLogo.name}
                    onChange={(e) =>
                      setNewLogo({ ...newLogo, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Logo URL *
                  </label>
                  <input
                    type="url"
                    value={newLogo.logoUrl}
                    onChange={(e) =>
                      setNewLogo({ ...newLogo, logoUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <button
                onClick={addLogo}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Add Company Logo
              </button>
            </div>

            {/* Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.trustedByLogos.map((logo, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-6 border ${
                    logo.isActive
                      ? "border-slate-200 dark:border-slate-700"
                      : "border-slate-300 dark:border-slate-600 opacity-60"
                  } text-center`}
                >
                  <div className="aspect-square mb-3 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                    <img
                      src={logo.logoUrl}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div class="text-slate-400 text-sm">Image Error</div>';
                      }}
                    />
                  </div>
                  <p className="font-medium text-sm mb-3 truncate">
                    {logo.name}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => toggleLogoStatus(index)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title={logo.isActive ? "Hide" : "Show"}
                    >
                      {logo.isActive ? (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => removeLogo(index)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {stats.trustedByLogos.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No company logos yet. Add your first trusted company above!
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
