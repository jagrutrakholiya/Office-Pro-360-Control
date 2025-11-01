'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import api from '../../lib/api'

type Company = { _id: string; name: string; code: string; plan: string; status: string; createdAt: string; features?: Record<string, boolean> }
type Plan = { _id: string; name: string; code: string }

type Service = { key: string; label: string; description: string }

const SERVICE_CATEGORIES = {
  'Core Features': ['tasks', 'calendar', 'attendance', 'performance'],
  'Management': ['users', 'teams', 'projects'],
  'Administration': ['leave', 'payroll', 'roles', 'statuses', 'holidays', 'overtime'],
  'Office Management': ['offices', 'shifts'],
  'Communication': ['chat', 'messages'],
  'Personal': ['profile', 'settings']
}

export default function CompaniesPage() {
  const router = useRouter()
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editServices, setEditServices] = useState<Record<string, boolean>>({})

  async function loadCompanies() {
    try {
      const res = await api.get('/admin/companies')
      setCompanies(res.data.companies || [])
    } catch {}
  }

  async function loadPlans() {
    try {
      const res = await api.get('/admin/plans')
      setPlans(res.data.plans || [])
    } catch {}
  }

  useEffect(() => { 
    loadCompanies()
    loadPlans()
    api.get('/public/services').then(({ data }) => {
      setAvailableServices(data?.services || [])
    }).catch(() => {
      setAvailableServices([])
    })
  }, [])

  const getServicesByCategory = () => {
    const categorized: Record<string, Service[]> = {}
    
    availableServices.forEach(svc => {
      for (const [category, keys] of Object.entries(SERVICE_CATEGORIES)) {
        if (keys.includes(svc.key)) {
          if (!categorized[category]) categorized[category] = []
          categorized[category].push(svc)
          return
        }
      }
      if (!categorized['Other']) categorized['Other'] = []
      categorized['Other'].push(svc)
    })
    
    return categorized
  }

  const openEditServices = (c: Company) => {
    setEditingId(c._id)
    const current = (c.features || {}) as Record<string, boolean>
    setEditServices({ ...current })
  }

  const saveEditServices = async () => {
    if (!editingId) return
    await api.patch(`/admin/companies/${editingId}/features`, { 
      features: Object.fromEntries(Object.entries(editServices).filter(([_, v]) => v)) 
    })
    setEditingId(null)
    setEditServices({})
    await loadCompanies()
  }

  async function changeStatus(id: string, status: string) {
    await api.patch(`/admin/companies/${id}/status`, { status })
    await loadCompanies()
  }

  async function changePlan(id: string, plan: string) {
    await api.patch(`/admin/companies/${id}/plan`, { plan })
    await loadCompanies()
  }

  const categorizedServices = getServicesByCategory()
  const selectedCount = editingId ? Object.values(editServices).filter(Boolean).length : 0

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Companies</h2>
            <p className="text-slate-600">Manage companies, plans, and subscriptions</p>
          </div>
          <button 
            onClick={() => router.push('/companies/new')}
            className="btn-primary"
          >
            + Add New Company
          </button>
        </div>
      </div>

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">All Companies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Services</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{c.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 capitalize">{c.plan}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{c.features ? Object.values(c.features).filter(Boolean).length : 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`badge ${c.status === 'active' ? 'badge-active' : c.status === 'view_only' ? 'badge-view-only' : 'badge-suspended'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <select defaultValue={c.plan} onChange={e => changePlan(c._id, e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="starter">starter</option>
                      <option value="growth">growth</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                    <select defaultValue={c.status} onChange={e => changeStatus(c._id, e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="active">active</option>
                      <option value="view_only">view_only</option>
                      <option value="suspended">suspended</option>
                    </select>
                    <button onClick={() => openEditServices(c)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-100">Edit Services</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingId && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Edit Services / Features
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({selectedCount} selected)
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  const allEnabled = Object.fromEntries(availableServices.map(s => [s.key, true]))
                  setEditServices(allEnabled)
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
            </div>
            <div className="space-y-4 p-4 border border-slate-200 rounded-md bg-white max-h-96 overflow-y-auto">
              {Object.entries(categorizedServices).map(([category, services]) => (
                <div key={category} className="space-y-2">
                  <h5 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1">
                    {category}
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {services.map(svc => (
                      <label 
                        key={svc.key} 
                        className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!!editServices[svc.key]}
                          onChange={e => setEditServices({ ...editServices, [svc.key]: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">{svc.label || svc.key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 mb-3">
              Select features to enable for this company. These control what appears in the sidebar.
            </p>
            <div className="flex gap-2">
              <button onClick={saveEditServices} className="btn-primary">Save Changes</button>
              <button 
                onClick={() => { setEditingId(null); setEditServices({}); }} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}


