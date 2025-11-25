"use client";

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";

interface KPI {
  _id: string;
  name: string;
  description?: string;
  category: string;
  metric: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  status: string;
  period: string;
  startDate: string;
  endDate: string;
  history: Array<{ date: string; value: number; notes?: string }>;
}

const kpiCategories = [
  { value: "all", label: "All Categories" },
  { value: "productivity", label: "Productivity" },
  { value: "quality", label: "Quality" },
  { value: "efficiency", label: "Efficiency" },
  { value: "performance", label: "Performance" },
  { value: "custom", label: "Custom" },
];

const kpiPeriods = [
  { value: "all", label: "All Periods" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function KPIDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchKPIs();
  }, [selectedCategory, selectedPeriod]);

  const fetchKPIs = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/kpis?`;
      
      if (selectedCategory !== "all") {
        url += `category=${selectedCategory}&`;
      }
      
      if (selectedPeriod !== "all") {
        url += `period=${selectedPeriod}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKpis(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      achieved: "bg-green-500",
      on_track: "bg-blue-500",
      at_risk: "bg-yellow-500",
      off_track: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      achieved: "Achieved",
      on_track: "On Track",
      at_risk: "At Risk",
      off_track: "Off Track",
    };
    return labels[status] || status;
  };

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const filteredKpis = kpis;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track and monitor key performance indicators
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📈 Create KPI
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {kpiCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {kpiPeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Total KPIs</div>
          <div className="text-2xl font-bold text-gray-900">{kpis.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Achieved</div>
          <div className="text-2xl font-bold text-green-600">
            {kpis.filter((k) => k.status === "achieved").length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">On Track</div>
          <div className="text-2xl font-bold text-blue-600">
            {kpis.filter((k) => k.status === "on_track").length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">At Risk</div>
          <div className="text-2xl font-bold text-yellow-600">
            {kpis.filter((k) => k.status === "at_risk" || k.status === "off_track").length}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Loading KPIs...
          </div>
        ) : filteredKpis.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No KPIs found. Create your first KPI to get started.
          </div>
        ) : (
          filteredKpis.map((kpi) => {
            const progress = calculateProgress(kpi.currentValue, kpi.targetValue);
            
            return (
              <div
                key={kpi._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {kpi.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpi.description || "No description"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(
                        kpi.status
                      )}`}
                    >
                      {getStatusLabel(kpi.status)}
                    </span>
                  </div>

                  {/* Values */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Current</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {kpi.currentValue}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Target</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {kpi.targetValue}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(kpi.status)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div>
                      <span className="font-medium">{kpi.category}</span> •{" "}
                      <span>{kpi.period}</span>
                    </div>
                    <div>
                      {new Date(kpi.startDate).toLocaleDateString()} -{" "}
                      {new Date(kpi.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
                      📝 Update Value
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
                      📊 View History
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create KPI Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New KPI</h2>
            <p className="text-gray-600 mb-4">
              KPI creation form would go here...
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
