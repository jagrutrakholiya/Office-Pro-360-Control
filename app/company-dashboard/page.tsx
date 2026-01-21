"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type CompanyDashboard = {
  company: {
    _id: string;
    name: string;
    code: string;
    status: string;
    createdAt: string;
  };
  plan: {
    name: string;
    code: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    recommendedLimits: Record<string, number>;
  } | null;
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    maxApiCalls: number;
    maxFileUploadSize: number;
  };
  usage: {
    users: number;
    projects: number;
    storage: number;
    apiCalls: number;
  };
  usagePercentages: {
    users: number;
    projects: number;
    storage: number;
    apiCalls: number;
  };
  warnings: {
    users: boolean;
    projects: boolean;
    storage: boolean;
    apiCalls: boolean;
  };
  hasWarnings: boolean;
  activeFeatures: string[];
  featureCount: number;
  summary: {
    totalUsers: number;
    totalProjects: number;
    storageUsedGB: string;
    storageQuotaGB: string;
    apiCallsThisMonth: number;
    apiQuota: string | number;
  };
};

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<CompanyDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const res = await api.get("/my-company/dashboard");
      setDashboard(res.data);
      setError("");
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  function getProgressColor(percentage: number): string {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 70) return "bg-yellow-500";
    return "bg-green-500";
  }

  function getProgressBgColor(percentage: number): string {
    if (percentage > 90) return "bg-red-50";
    if (percentage > 70) return "bg-yellow-50";
    return "bg-green-50";
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !dashboard) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error || "Failed to load dashboard"}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {dashboard.company.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Company Code: {dashboard.company.code} • Status:{" "}
            <span
              className={`font-semibold ${
                dashboard.company.status === "active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dashboard.company.status}
            </span>
          </p>
        </div>

        {/* Warnings Alert */}
        {dashboard.hasWarnings && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Approaching Limits
                </h3>
                <p className="text-yellow-800 text-sm">
                  You are approaching one or more limits. Consider upgrading
                  your plan.
                </p>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {dashboard.warnings.users && (
                    <li>
                      • Users: {dashboard.usage.users}/{dashboard.limits.maxUsers}{" "}
                      ({dashboard.usagePercentages.users.toFixed(0)}%)
                    </li>
                  )}
                  {dashboard.warnings.storage && (
                    <li>
                      • Storage: {dashboard.summary.storageUsedGB}GB/
                      {dashboard.summary.storageQuotaGB}GB (
                      {dashboard.usagePercentages.storage.toFixed(0)}%)
                    </li>
                  )}
                  {dashboard.warnings.projects && (
                    <li>
                      • Projects: {dashboard.usage.projects}/
                      {dashboard.limits.maxProjects} (
                      {dashboard.usagePercentages.projects.toFixed(0)}%)
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Plan Details */}
        {dashboard.plan && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Current Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Plan Name</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboard.plan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Monthly Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{dashboard.plan.priceMonthly.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Yearly Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{dashboard.plan.priceYearly.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Users */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${getProgressBgColor(
              dashboard.usagePercentages.users
            )}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600">Users</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              {dashboard.usage.users}
              {dashboard.limits.maxUsers !== -1 && (
                <span className="text-lg text-slate-500">
                  /{dashboard.limits.maxUsers}
                </span>
              )}
            </p>
            {dashboard.limits.maxUsers !== -1 && (
              <>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(
                      dashboard.usagePercentages.users
                    )}`}
                    style={{
                      width: `${Math.min(dashboard.usagePercentages.users, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {dashboard.usagePercentages.users.toFixed(1)}% used
                </p>
              </>
            )}
          </div>

          {/* Storage */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${getProgressBgColor(
              dashboard.usagePercentages.storage
            )}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600">Storage</h3>
              <span className="text-2xl">💾</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              {dashboard.summary.storageUsedGB}GB
              <span className="text-lg text-slate-500">
                /{dashboard.summary.storageQuotaGB}GB
              </span>
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(
                  dashboard.usagePercentages.storage
                )}`}
                style={{
                  width: `${Math.min(dashboard.usagePercentages.storage, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-600">
              {dashboard.usagePercentages.storage.toFixed(1)}% used
            </p>
          </div>

          {/* Projects */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${getProgressBgColor(
              dashboard.usagePercentages.projects
            )}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600">Projects</h3>
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              {dashboard.usage.projects}
              {dashboard.limits.maxProjects !== -1 && (
                <span className="text-lg text-slate-500">
                  /{dashboard.limits.maxProjects}
                </span>
              )}
            </p>
            {dashboard.limits.maxProjects !== -1 && (
              <>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(
                      dashboard.usagePercentages.projects
                    )}`}
                    style={{
                      width: `${Math.min(dashboard.usagePercentages.projects, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {dashboard.usagePercentages.projects.toFixed(1)}% used
                </p>
              </>
            )}
          </div>

          {/* API Calls */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${getProgressBgColor(
              dashboard.usagePercentages.apiCalls
            )}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600">
                API Calls
              </h3>
              <span className="text-2xl">🔌</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-2">
              {dashboard.usage.apiCalls.toLocaleString()}
              {dashboard.limits.maxApiCalls !== -1 && (
                <span className="text-lg text-slate-500">
                  /{(dashboard.limits.maxApiCalls / 1000).toFixed(0)}K
                </span>
              )}
            </p>
            {dashboard.limits.maxApiCalls !== -1 && (
              <>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(
                      dashboard.usagePercentages.apiCalls
                    )}`}
                    style={{
                      width: `${Math.min(dashboard.usagePercentages.apiCalls, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {dashboard.usagePercentages.apiCalls.toFixed(1)}% used this
                  month
                </p>
              </>
            )}
          </div>
        </div>

        {/* Active Features */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Active Features ({dashboard.featureCount})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dashboard.activeFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
              >
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {feature.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
