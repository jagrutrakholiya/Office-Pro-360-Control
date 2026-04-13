'use client'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../lib/api'

type Inquiry = { _id: string; name: string; email: string; phone?: string; company?: string; topic?: string; message: string; planCode?: string; status: string; createdAt: string }

export default function InquiriesPage() {
 const [inquiries, setInquiries] = useState<Inquiry[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState('all')

 async function load() {
 try {
 const res = await api.get('/marketing/admin/inquiries')
 setInquiries(res.data.inquiries || [])
 } catch {} finally {
 setLoading(false)
 }
 }

 useEffect(() => { load() }, [])

 async function changeStatus(id: string, status: string) {
 await api.patch(`/marketing/admin/inquiries/${id}`, { status })
 await load()
 }

 const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter)
 const newCount = inquiries.filter(i => i.status === 'new').length
 const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length

 return (
 <Layout>
 <div className="mb-8">
 <h2 className="text-3xl font-bold text-slate-900 mb-2">Inquiries</h2>
 <p className="text-slate-600">Leads and contact submissions from the marketing site</p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
 <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
 <div className="text-sm font-medium text-slate-600">Total</div>
 <div className="text-3xl font-bold text-slate-900 mt-1">{inquiries.length}</div>
 </div>
 <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
 <div className="text-sm font-medium text-slate-600">New</div>
 <div className="text-3xl font-bold text-blue-600 mt-1">{newCount}</div>
 </div>
 <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
 <div className="text-sm font-medium text-slate-600">In Progress</div>
 <div className="text-3xl font-bold text-amber-600 mt-1">{inProgressCount}</div>
 </div>
 </div>

 {/* Filter */}
 <div className="mb-4 flex gap-2">
 {['all', 'new', 'in_progress', 'closed'].map(f => (
 <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
 {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
 </button>
 ))}
 </div>

 {/* Table */}
 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
 <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
 ) : filtered.length === 0 ? (
 <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No inquiries found</td></tr>
 ) : filtered.map(inq => (
 <tr key={inq._id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4">
 <div className="text-sm font-medium text-slate-900">{inq.name}</div>
 {inq.phone && <div className="text-xs text-slate-500 mt-0.5">{inq.phone}</div>}
 </td>
 <td className="px-6 py-4 text-sm text-slate-600">{inq.email}</td>
 <td className="px-6 py-4 text-sm text-slate-700">{inq.company || '—'}</td>
 <td className="px-6 py-4 text-sm">
 {inq.planCode ? (
 <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{inq.planCode}</span>
 ) : '—'}
 </td>
 <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">{inq.message}</td>
 <td className="px-6 py-4">
 <select defaultValue={inq.status} onChange={e => changeStatus(inq._id, e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
 <option value="new">New</option>
 <option value="in_progress">In Progress</option>
 <option value="closed">Closed</option>
 </select>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </Layout>
 )
}

