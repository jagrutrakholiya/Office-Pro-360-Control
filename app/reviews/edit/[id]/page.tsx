'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '../../../../components/Layout'
import { PageHeader, Card, Button, Input, Textarea, Select, Skeleton } from '@/components/ui'
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
        <div className="space-y-6">
          <Skeleton variant="rounded" height={40} width={280} />
          <Skeleton variant="rounded" height={360} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Edit Review"
          description="Update testimonial displayed on the marketing site"
          actions={
            <Button variant="outline" onClick={() => router.push('/reviews')}>
              ← Back to Reviews
            </Button>
          }
        />

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author Name *"
                placeholder="e.g. John Doe"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
              />
              <Input
                label="Role (optional)"
                placeholder="e.g. CEO, HR Manager"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company (optional)"
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              <div>
                <Input
                  type="number"
                  label="Rating (1-5) *"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) || 5 })}
                  required
                />
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`text-xl cursor-pointer ${n <= form.rating ? 'text-warning-400' : 'text-slate-300 dark:text-slate-600'}`}
                      onClick={() => setForm({ ...form, rating: n })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </Select>

            <Textarea
              label="Testimonial Quote *"
              placeholder="Enter the testimonial quote here..."
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              className="min-h-[120px]"
              required
            />

            {error && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md text-danger-700 dark:text-danger-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-md text-success-700 dark:text-success-400 text-sm">
                Review updated successfully! Redirecting...
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" disabled={saving || success} loading={saving}>
                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/reviews')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
