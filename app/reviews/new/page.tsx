'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../../components/Layout'
import api from '../../../lib/api'

export default function NewReviewPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    author: '', 
    role: '', 
    company: '', 
    rating: 5, 
    quote: '' 
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
      await api.post('/marketing/admin/reviews', { ...form, status: 'published' })
      setSuccess(true)
      setTimeout(() => {
        router.push('/reviews')
      }, 1500)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create New Review</h2>
            <p className="text-slate-600">Add a testimonial to display on the marketing site</p>
          </div>
          <button 
            onClick={() => router.push('/reviews')}
            className="btn-secondary"
          >
            ← Back to Reviews
          </button>
        </div>
      </div>

      <section className="card mb-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Author Name *
              </label>
              <input 
                placeholder="e.g. John Doe" 
                value={form.author} 
                onChange={e => setForm({ ...form, author: e.target.value })} 
                className="input" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role (optional)
              </label>
              <input 
                placeholder="e.g. CEO, HR Manager" 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })} 
                className="input" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company (optional)
              </label>
              <input 
                placeholder="e.g. Acme Corp" 
                value={form.company} 
                onChange={e => setForm({ ...form, company: e.target.value })} 
                className="input" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rating (1-5) *
              </label>
              <input 
                type="number" 
                min={1} 
                max={5} 
                value={form.rating} 
                onChange={e => setForm({ ...form, rating: Number(e.target.value) || 5 })} 
                className="input" 
                required 
              />
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <span 
                    key={n}
                    className={`text-xl cursor-pointer ${n <= form.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                    onClick={() => setForm({ ...form, rating: n })}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Testimonial Quote *
            </label>
            <textarea 
              placeholder="Enter the testimonial quote here..." 
              value={form.quote} 
              onChange={e => setForm({ ...form, quote: e.target.value })} 
              className="input min-h-[120px]" 
              required 
            />
            <p className="mt-1 text-xs text-slate-500">
              This will be displayed on the marketing website
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Review created successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="submit" 
              disabled={loading || success} 
              className="btn-primary"
            >
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Review'}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/reviews')}
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

