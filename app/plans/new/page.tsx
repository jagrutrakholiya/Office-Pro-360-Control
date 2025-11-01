'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import api from '../../../lib/api'

export default function NewPlanPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    name: '', 
    code: '', 
    priceMonthly: 0, 
    priceYearly: 0 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      await api.post('/admin/plans', form)
      setSuccess(true)
      setTimeout(() => {
        router.push('/plans')
      }, 1500)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create New Plan</h2>
            <p className="text-slate-600">Add a new subscription plan and configure pricing</p>
          </div>
          <button 
            onClick={() => router.push('/plans')}
            className="btn-secondary"
          >
            ← Back to Plans
          </button>
        </div>
      </div>

      <section className="card mb-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan Name *
              </label>
              <input 
                placeholder="e.g. Starter" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                className="input" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan Code *
              </label>
              <input 
                placeholder="e.g. starter" 
                value={form.code} 
                onChange={e => setForm({ ...form, code: e.target.value.trim().toLowerCase() })} 
                className="input" 
                required 
              />
              <p className="mt-1 text-xs text-slate-500">
                Short, unique identifier. Lowercase letters only.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Price (₹)
              </label>
              <input 
                type="number" 
                min={0} 
                step="0.01"
                placeholder="0" 
                value={form.priceMonthly || ''} 
                onChange={e => setForm({ ...form, priceMonthly: Number(e.target.value) || 0 })} 
                className="input" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Yearly Price (₹)
              </label>
              <input 
                type="number" 
                min={0} 
                step="0.01"
                placeholder="0" 
                value={form.priceYearly || ''} 
                onChange={e => setForm({ ...form, priceYearly: Number(e.target.value) || 0 })} 
                className="input" 
              />
              <p className="mt-1 text-xs text-slate-500">
                Keep 0 if not applicable.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Plan created successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              disabled={loading || success} 
              className="btn-primary"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Plan'}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/plans')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </Layout>
  )
}

