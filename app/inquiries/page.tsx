'use client'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'

type Inquiry = { _id: string; name: string; email: string; phone?: string; company?: string; topic?: string; message: string; planCode?: string; status: string; createdAt: string }

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  async function load() {
    try {
      const res = await api.get('/marketing/admin/inquiries')
      setInquiries(res.data.inquiries || [])
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function changeStatus(id: string, status: string) {
    await api.patch(`/marketing/admin/inquiries/${id}`, { status })
    await load()
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Inquiries</h2>
        <p className="text-slate-600">Leads and contact submissions from the marketing site</p>
      </div>
      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">All Inquiries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Topic</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquiries.map(inq => (
                <tr key={inq._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{inq.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{inq.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{inq.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{inq.company || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {inq.planCode ? (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md font-medium">
                        {inq.planCode}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{inq.topic || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">{inq.message}</td>
                  <td className="px-6 py-4">
                    <select defaultValue={inq.status} onChange={e => changeStatus(inq._id, e.target.value)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="new">new</option>
                      <option value="in_progress">in progress</option>
                      <option value="closed">closed</option>
                    </select>
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

