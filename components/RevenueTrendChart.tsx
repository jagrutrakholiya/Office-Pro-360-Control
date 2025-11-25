"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { getRevenueTrend, updateRevenueTrend, RevenuePoint } from '../lib/companyAnalytics';

interface Props { editable?: boolean }

export default function RevenueTrendChart({ editable = false }: Props) {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [growthRate, setGrowthRate] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<RevenuePoint[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await getRevenueTrend();
    setData(res.trend);
    setDraft(res.trend);
    setGrowthRate(res.growthRate);
    setTotal(res.totalLast6Months);
    setLoading(false);
  }

  function handleChange(idx: number, value: string) {
    const v = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setDraft(d => d.map((p,i)=> i===idx ? { ...p, revenue: v } : p));
  }

  async function save() {
    setSaving(true);
    const res = await updateRevenueTrend(draft);
    setData(res.trend);
    setGrowthRate(res.growthRate);
    setTotal(res.totalLast6Months);
    setEditMode(false);
    setSaving(false);
  }

  if (loading) return <div className="py-8 text-center text-sm text-neutral-500">Loading revenue trend...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Revenue Trend (Last 6 Months)</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Total: ₹{total.toLocaleString()} • Growth: {growthRate.toFixed(1)}%</p>
        </div>
        {editable && (
          <div className="flex gap-2">
            {!editMode && <button onClick={()=> setEditMode(true)} className="px-3 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700">✏️ Edit</button>}
            {editMode && (
              <>
                <button onClick={save} disabled={saving} className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{saving? 'Saving…':'💾 Save'}</button>
                <button onClick={()=> { setEditMode(false); setDraft(data); }} className="px-3 py-2 text-sm rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600">Cancel</button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="h-64 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={60} />
            <Tooltip formatter={(v: any)=> `₹${Number(v).toLocaleString()}`} labelFormatter={(l)=> `Month: ${l}`} />
            <ReferenceArea ifOverflow="extendDomain" y1={0} y2={Math.max(...data.map(d=>d.revenue))} />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, stroke: '#1d4ed8', strokeWidth:2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {editMode && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {draft.map((p,i)=> (
            <div key={p.month} className="flex flex-col gap-1 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{p.month}</label>
              <input type="number" value={p.revenue} onChange={e=>handleChange(i, e.target.value)} className="px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
