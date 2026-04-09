"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
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
 *   1. Three headline cards: Revenue, Costs, Profit (with margin)
 *   2. Stacked bar chart of revenue vs costs over the trend window
 *   3. Two side-by-side tables: revenue by plan + costs by category
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

  return (
    <Layout>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profit &amp; Loss</h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time P&amp;L computed from live Subscription revenue minus tracked Platform Costs.
          </p>
        </div>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
          <option value={24}>Last 24 months</option>
        </select>
      </div>

      {/* Headline cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          label="Revenue (this month)"
          value={loading || !data ? "—" : formatCurrency(data.current.revenue.total)}
          tone="positive"
          sub="From active subscriptions"
        />
        <Card
          label="Costs (this month)"
          value={loading || !data ? "—" : formatCurrency(data.current.costs.total)}
          tone="negative"
          sub="From tracked platform costs"
        />
        <Card
          label={isProfit ? "Profit (this month)" : "Loss (this month)"}
          value={loading || !data ? "—" : formatCurrency(Math.abs(data.current.profit))}
          tone={isProfit ? "highlight-positive" : "highlight-negative"}
          sub={data ? `${data.current.margin.toFixed(1)}% margin` : ""}
        />
      </div>

      {/* Stacked trend chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Revenue vs Costs</h3>
            <p className="text-xs text-slate-500">
              {months}-month trend. Profit = Revenue − Costs (yearly subs amortized to monthly).
            </p>
          </div>
        </div>
        {loading || trendChart.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded">
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
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Revenue by Plan</h3>
          </div>
          {planEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">No paying subscriptions this month.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-slate-600 uppercase">Subs</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-slate-600 uppercase">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planEntries.map(([code, p]) => (
                  <tr key={code}>
                    <td className="px-5 py-3 text-sm text-slate-900 font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-700 text-right tabular-nums">{p.count}</td>
                    <td className="px-5 py-3 text-sm text-emerald-700 text-right tabular-nums font-semibold">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Costs by Category</h3>
            <a href="/costs" className="text-xs text-slate-500 hover:text-slate-900">
              Manage costs →
            </a>
          </div>
          {categoryEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">
              No tracked costs this month.{" "}
              <a href="/costs" className="underline">
                Add one
              </a>
              .
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2 text-xs font-semibold text-slate-600 uppercase">Category</th>
                  <th className="text-right px-5 py-2 text-xs font-semibold text-slate-600 uppercase">Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryEntries
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <tr key={cat}>
                      <td className="px-5 py-3 text-sm text-slate-900 font-medium capitalize">{cat}</td>
                      <td className="px-5 py-3 text-sm text-red-600 text-right tabular-nums font-semibold">
                        {formatCurrency(amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Card({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "positive" | "negative" | "highlight-positive" | "highlight-negative";
}) {
  const styles = {
    positive: { bg: "bg-white border-slate-200", value: "text-slate-900" },
    negative: { bg: "bg-white border-slate-200", value: "text-slate-900" },
    "highlight-positive": { bg: "bg-emerald-50 border-emerald-200", value: "text-emerald-700" },
    "highlight-negative": { bg: "bg-red-50 border-red-200", value: "text-red-700" },
  }[tone];
  return (
    <div className={`rounded-lg border p-5 ${styles.bg}`}>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${styles.value}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
