'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../../components/Layout'
import api from '../../lib/api'

type Review = { _id: string; author: string; role?: string; company?: string; rating: number; quote: string; status: string; createdAt?: string }

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const res = await api.get('/marketing/admin/reviews')
      setReviews(res.data.reviews || [])
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function deleteReview(id: string) {
    if (!confirm('Delete review?')) return
    await api.delete(`/marketing/admin/reviews/${id}`)
    await load()
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Reviews</h2>
            <p className="text-slate-600">Manage testimonials displayed on the marketing site</p>
          </div>
          <button 
            onClick={() => router.push('/reviews/new')}
            className="btn-primary"
          >
            + Add New Review
          </button>
        </div>
      </div>

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">All Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Author</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Quote</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No reviews yet. <button onClick={() => router.push('/reviews/new')} className="text-blue-600 hover:text-blue-700">Create one →</button>
                  </td>
                </tr>
              ) : (
                reviews.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.author}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{r.role || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{r.company || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                      <span className="text-slate-300 ml-1">{'★'.repeat(5 - r.rating)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`badge ${r.status === 'published' ? 'badge-active' : 'badge-view-only'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-md truncate">{r.quote}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteReview(r._id)} className="btn-danger text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  )
}

