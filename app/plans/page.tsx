'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import api from '../../lib/api'

type Plan = { _id: string; name: string; code: string; priceMonthly: number; priceYearly: number; status: string }

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])

  async function loadPlans() {
    try {
      const res = await api.get('/admin/plans')
      setPlans(res.data.plans || [])
    } catch {}
  }

  useEffect(() => { loadPlans() }, [])

  async function deletePlan(id: string) {
    if (!confirm('Delete plan?')) return
    await api.delete(`/admin/plans/${id}`)
    await loadPlans()
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Plans</h2>
            <p className="text-slate-600">Configure subscription plans and pricing</p>
          </div>
          <button 
            onClick={() => router.push('/plans/new')}
            className="btn-primary"
          >
            + Add New Plan
          </button>
        </div>
      </div>

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">All Plans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Monthly</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Yearly</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{p.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">₹{p.priceMonthly}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">₹{p.priceYearly}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deletePlan(p._id)} className="btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  )
}

