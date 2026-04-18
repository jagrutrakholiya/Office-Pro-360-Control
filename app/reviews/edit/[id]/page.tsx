'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '../../../../components/Layout'
import api from '../../../../lib/api'

export default function EditReviewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [form, setForm] = useState({
    author: '',
    role: '',
    company: '',
    rating: 5,
    quote: '',
    status: 'published',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await api.get('/marketing/admin/reviews')
        const reviews = res.data?.reviews || []
        const review = reviews.find((r: any) => r._id === id)
        if (!review) {
          setError('Review not found')
          return
        }
        setForm({
          author: review.author || '',
          role: review.role || '',
          company: review.company || '',
          rating: review.rating || 5,
          quote: review.quote || '',
          status: review.status || 'published',
        })
      } catch (err: any) {
        setError('Failed to load review')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await api.patch(`/marketing/admin/reviews/${id}`, form)
      setSuccess(true)
      setTimeout(() => router.push('/reviews'), 1200)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Edit Review</h2>
            <p className="text-slate-600">Update testimonial displayed on the marketing site</p>
          </div>
          <button onClick={() => router.push('/reviews')} className="btn-secondary">
            ← Back to Reviews
          </button>
        </div>
      </div>

      <section className="card mb-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Author Name *</label>
              <input
                placeholder="e.g. John Doe"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role (optional)</label>
              <input
                placeholder="e.g. CEO, HR Manager"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company (optional)</label>
              <input
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5) *</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 5 })}
                className="input"
                required
              />
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Testimonial Quote *</label>
            <textarea
              placeholder="Enter the testimonial quote here..."
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              className="input min-h-[120px]"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Review updated successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={saving || success} className="btn-primary">
              {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/reviews')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </section>
    </Layout>
  )
}
