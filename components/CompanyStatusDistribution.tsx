"use client";
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCompanyStatusDistribution } from '../lib/companyAnalytics';

interface ChartData { name: string; value: number; percentage: number; [key: string]: any }

const COLORS = {
  active: '#16a34a',
  view_only: '#2563eb',
  suspended: '#dc2626',
  pending: '#f59e0b'
};

export default function CompanyStatusDistribution() {
  const [data, setData] = useState<ChartData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(()=> { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await getCompanyStatusDistribution();
    const statuses = res.statuses;
    const total = res.total;
    const chart: ChartData[] = Object.keys(statuses).map(key => ({
      name: key.replace('_',' '),
      value: statuses[key],
      percentage: total ? (statuses[key] / total) * 100 : 0
    }));
    setData(chart);
    setTotal(total);
    setLoading(false);
  }

  if (loading) return <div className="py-6 text-sm text-neutral-500 text-center">Loading company status distribution...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Company Status Distribution</h3>
        <button onClick={load} className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600">↻ Refresh</button>
      </div>
      <div className="h-64 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40} paddingAngle={2}>
              {data.map((entry, index) => {
                const key = entry.name.replace(' ','_');
                return <Cell key={`cell-${index}`} fill={COLORS[key as keyof typeof COLORS] || '#6366f1'} />;
              })}
            </Pie>
            <Tooltip formatter={(v: any, name: any, payload: any)=> [`${v} companies`, name]} />
            <Legend formatter={(value)=> value} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map(d => (
          <div key={d.name} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-medium">{d.name}</div>
            <div className="flex items-end gap-1">
              <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{d.value}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">({d.percentage.toFixed(1)}%)</div>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div style={{ width: `${d.percentage}%`, background: COLORS[d.name.replace(' ','_') as keyof typeof COLORS] || '#6366f1' }} className="h-full rounded-full transition-all"></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Total companies: {total}</p>
    </div>
  );
}
