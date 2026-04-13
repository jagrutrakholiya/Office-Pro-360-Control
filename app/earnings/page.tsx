'use client'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'
import RevenueTrendChart from '../../components/RevenueTrendChart'
import CompanyStatusDistribution from '../../components/CompanyStatusDistribution'

type EarningsData = { totalMRR: number; byPlan: Record<string, { count: number; mrr: number; name?: string }> }

export default function EarningsPage() {
 const [data, setData] = useState<EarningsData | null>(null)
 const [loading, setLoading] = useState(true)

 async function load() {
 try {
 const res = await api.get('/admin/metrics/earnings')
 setData(res.data)
 } catch {} finally {
 setLoading(false)
 }
 }

 useEffect(() => { load() }, [])

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 maximumFractionDigits: 0,
 }).format(amount)
 }

 const totalCompanies = data ? Object.values(data.byPlan).reduce((sum, p) => sum + p.count, 0) : 0

 return (
 <Layout>
 <div className="mb-8">
 <h2 className="text-3xl font-bold text-slate-900 mb-2">Earnings</h2>
 <p className="text-slate-600">Revenue metrics and subscription analytics</p>
 </div>

 {/* MRR Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
 <div className="text-sm font-medium text-white/80 mb-2">Monthly Recurring Revenue</div>
 <div className="text-4xl font-bold">{formatCurrency(data?.totalMRR || 0)}</div>
 <div className="text-sm text-white/70 mt-2">From {totalCompanies} paying companies</div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
 <div className="text-sm font-medium text-slate-600 mb-2">Annual Run Rate</div>
 <div className="text-4xl font-bold text-slate-900">{formatCurrency((data?.totalMRR || 0) * 12)}</div>
 <div className="text-sm text-slate-500 mt-2">Projected yearly revenue</div>
 </div>
 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
 <div className="text-sm font-medium text-slate-600 mb-2">Avg Revenue Per Company</div>
 <div className="text-4xl font-bold text-slate-900">{formatCurrency(totalCompanies > 0 ? (data?.totalMRR || 0) / totalCompanies : 0)}</div>
 <div className="text-sm text-slate-500 mt-2">ARPC this month</div>
 </div>
 </div>

 {/* Dynamic Charts */}
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
 <RevenueTrendChart editable />
 </div>
 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
 <CompanyStatusDistribution />
 </div>
 </div>

 {/* Revenue by Plan Table */}
 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">% of Revenue</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
 ) : data && Object.keys(data.byPlan).length > 0 ? (
 Object.entries(data.byPlan).map(([plan, info]) => (
 <tr key={plan} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{info.name || plan}</td>
 <td className="px-6 py-4 text-sm text-slate-700">{info.count}</td>
 <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(info.mrr)}</td>
 <td className="px-6 py-4 text-sm text-slate-600">
 {data.totalMRR > 0 ? ((info.mrr / data.totalMRR) * 100).toFixed(1) : 0}%
 </td>
 </tr>
 ))
 ) : (
 <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No plan data available</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </Layout>
 )
}

