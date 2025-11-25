'use client'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import RevenueTrendChart from '../../components/RevenueTrendChart'
import CompanyStatusDistribution from '../../components/CompanyStatusDistribution'

type EarningsData = { totalMRR: number; byPlan: Record<string, { count: number; mrr: number }> }

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)

  async function load() {
    try {
      const res = await api.get('/admin/metrics/earnings')
      setData(res.data)
    } catch {}
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Earnings</h2>
        <p className="text-slate-600">Revenue metrics and subscription analytics</p>
      </div>
      <section className="card mb-8 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
        <div className="text-sm opacity-90 mb-2">Total Monthly Recurring Revenue</div>
        <div className="text-5xl font-bold">₹{data?.totalMRR || 0}</div>
      </section>
      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <RevenueTrendChart editable />
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <CompanyStatusDistribution />
        </div>
      </div>
      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Revenue by Plan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Companies</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data && Object.keys(data.byPlan).map(plan => (
                <tr key={plan} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{plan}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{data.byPlan[plan].count}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{data.byPlan[plan].mrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  )
}

