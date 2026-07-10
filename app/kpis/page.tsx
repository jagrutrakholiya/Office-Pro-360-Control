"use client";

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  Card,
  Select,
  EmptyState,
  Modal,
} from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import api from "../../lib/api";

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
      const params: any = {};

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (selectedPeriod !== "all") {
        params.period = selectedPeriod;
      }

      const response = await api.get("/analytics/kpis", { params });
      setKpis(response.data.data || []);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      achieved: "bg-success-500",
      on_track: "bg-primary-500",
      at_risk: "bg-warning-500",
      off_track: "bg-danger-500",
    };
    return colors[status] || "bg-slate-500";
  };

  const getStatusVariant = (status: string): BadgeProps["variant"] => {
    const map: Record<string, BadgeProps["variant"]> = {
      achieved: "success",
      on_track: "info",
      at_risk: "warning",
      off_track: "danger",
    };
    return map[status] || "neutral";
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
        <PageHeader
          title="KPI Dashboard"
          description="Track and monitor key performance indicators"
          actions={
            <Button onClick={() => setShowCreateModal(true)}>Create KPI</Button>
          }
        />

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <Select
              wrapperClassName="min-w-[12rem]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {kpiCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>

            <Select
              wrapperClassName="min-w-[12rem]"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {kpiPeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total KPIs" value={kpis.length} accent="primary" />
          <StatCard
            label="Achieved"
            value={kpis.filter((k) => k.status === "achieved").length}
            accent="success"
          />
          <StatCard
            label="On Track"
            value={kpis.filter((k) => k.status === "on_track").length}
            accent="primary"
          />
          <StatCard
            label="At Risk"
            value={kpis.filter((k) => k.status === "at_risk" || k.status === "off_track").length}
            accent="warning"
          />
        </div>

        {/* KPI Cards Grid */}
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Loading KPIs...
          </div>
        ) : filteredKpis.length === 0 ? (
          <EmptyState
            title="No KPIs found"
            description="Create your first KPI to get started."
            action={<Button onClick={() => setShowCreateModal(true)}>Create KPI</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredKpis.map((kpi) => {
              const progress = calculateProgress(kpi.currentValue, kpi.targetValue);

              return (
                <Card key={kpi._id}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {kpi.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {kpi.description || "No description"}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(kpi.status)}>
                      {getStatusLabel(kpi.status)}
                    </Badge>
                  </div>

                  {/* Values */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Current</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {kpi.currentValue}
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-1">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Target</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {kpi.targetValue}
                        <span className="text-sm font-normal text-slate-600 dark:text-slate-400 ml-1">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(kpi.status)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                    <Button variant="outline" fullWidth size="sm">
                      Update Value
                    </Button>
                    <Button variant="outline" fullWidth size="sm">
                      View History
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create KPI Modal (placeholder) */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New KPI"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button>Create</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          KPI creation form would go here...
        </p>
      </Modal>
    </Layout>
  );
}
