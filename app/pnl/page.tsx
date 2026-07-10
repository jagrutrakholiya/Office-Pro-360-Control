"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  DataTable,
  Select,
  Skeleton,
} from "../../components/ui";
import type { Column } from "../../components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * P&L page — joins Subscription revenue with PlatformCost expenses.
 *
 * Data comes from a single endpoint: GET /admin/finance/pnl. The response
 * carries both the current month's headline detail AND a 12-month trend, so
 * we render everything in one round trip.
 *
 * Layout:
 * 1. Three headline cards: Revenue, Costs, Profit (with margin)
 * 2. Stacked bar chart of revenue vs costs over the trend window
 * 3. Two side-by-side tables: revenue by plan + costs by category
 */

type PnL = {
  period: string;
  current: {
    month: string;
    revenue: { total: number; byPlan: Record<string, { name: string; amount: number; count: number }> };
    costs: { total: number; byCategory: Record<string, number> };
    profit: number;
    margin: number;
  };
  trend: { month: string; revenue: number; costs: number; profit: number }[];
};

type PlanRow = { code: string; name: string; amount: number; count: number };
type CategoryRow = { cat: string; amount: number };

export default function PnLPage() {
  const [data, setData] = useState<PnL | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/finance/pnl?months=${months}`);
        if (!cancelled) setData(res.data);
      } catch (e) {
        console.error("Failed to load P&L:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [months]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const isProfit = (data?.current.profit || 0) >= 0;

  // Format trend data for display
  const trendChart = (data?.trend || []).map((t) => ({
    month: new Date(t.month + "-01").toLocaleDateString("en-US", { month: "short" }),
    Revenue: t.revenue,
    Costs: t.costs,
    Profit: t.profit,
  }));

  const planEntries = data ? Object.entries(data.current.revenue.byPlan) : [];
  const categoryEntries = data ? Object.entries(data.current.costs.byCategory) : [];

  const planRows: PlanRow[] = planEntries.map(([code, p]) => ({
    code,
    name: p.name,
    amount: p.amount,
    count: p.count,
  }));

  const categoryRows: CategoryRow[] = categoryEntries
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({ cat, amount }));

  const planColumns: Column<PlanRow>[] = [
    {
      key: "name",
      header: "Plan",
      render: (p) => <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>,
    },
    {
      key: "count",
      header: "Subs",
      className: "text-right",
      render: (p) => <span className="tabular-nums">{p.count}</span>,
    },
    {
      key: "amount",
      header: "MRR",
      className: "text-right",
      render: (p) => (
        <span className="tabular-nums font-semibold text-success-600 dark:text-success-400">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
  ];

  const categoryColumns: Column<CategoryRow>[] = [
    {
      key: "cat",
      header: "Category",
      className: "capitalize",
      render: (c) => <span className="font-medium text-slate-900 dark:text-slate-100">{c.cat}</span>,
    },
    {
      key: "amount",
      header: "Monthly",
      className: "text-right",
      render: (c) => (
        <span className="tabular-nums font-semibold text-danger-600 dark:text-danger-400">
          {formatCurrency(c.amount)}
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Profit & Loss"
          description="Real-time P&L computed from live Subscription revenue minus tracked Platform Costs."
          actions={
            <Select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              wrapperClassName="w-48"
            >
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={24}>Last 24 months</option>
            </Select>
          }
        />

        {/* Headline cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Revenue (this month)"
            value={loading || !data ? <Skeleton className="h-8 w-28" /> : formatCurrency(data.current.revenue.total)}
            description="From active subscriptions"
            accent="success"
          />
          <StatCard
            label="Costs (this month)"
            value={loading || !data ? <Skeleton className="h-8 w-28" /> : formatCurrency(data.current.costs.total)}
            description="From tracked platform costs"
            accent="warning"
          />
          <StatCard
            label={isProfit ? "Profit (this month)" : "Loss (this month)"}
            value={
              loading || !data ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(Math.abs(data.current.profit))
              )
            }
            description={data ? `${data.current.margin.toFixed(1)}% margin` : ""}
            accent={isProfit ? "success" : "danger"}
          />
        </div>

        {/* Stacked trend chart */}
        <Card padding="lg">
          <CardHeader className="mb-4">
            <CardTitle>Revenue vs Costs</CardTitle>
            <CardDescription>
              {months}-month trend. Profit = Revenue − Costs (yearly subs amortized to monthly).
            </CardDescription>
          </CardHeader>
          {loading || trendChart.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              {loading ? "Loading…" : "No data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "none", borderRadius: 6, padding: "8px 12px" }}
                  labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 4, fontSize: 12 }}
                  itemStyle={{ fontSize: 13 }}
                  cursor={{ fill: "#f1f5f9" }}
                  formatter={(value) => formatCurrency(Number(value) || 0)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costs" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Revenue by Plan</h3>
            <DataTable
              columns={planColumns}
              data={planRows}
              rowKey={(p) => p.code}
              emptyTitle="No paying subscriptions"
              emptyDescription="No paying subscriptions this month."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Costs by Category</h3>
              <a
                href="/costs"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Manage costs →
              </a>
            </div>
            <DataTable
              columns={categoryColumns}
              data={categoryRows}
              rowKey={(c) => c.cat}
              emptyTitle="No tracked costs"
              emptyDescription="No tracked costs this month."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
