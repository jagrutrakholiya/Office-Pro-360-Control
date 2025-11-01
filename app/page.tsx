'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

type DashboardStats = {
  companies: {
    total: number
    active: number
    suspended: number
    thisMonth: number
  }
  plans: {
    total: number
  }
  users: {
    total: number
    avgPerCompany: number
  }
  inquiries: {
    pending: number
  }
  earnings: {
    monthly: number
    byPlan: Record<string, { count: number; mrr: number }>
  }
  recentCompanies: Array<{
    _id: string
    name: string
    code: string
    plan: string
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard/stats')
      setStats(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadStats()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const StatCard = ({ title, value, subtitle, icon, gradient, onClick }: {
    title: string
    value: string | number
    subtitle?: string
    icon: string
    gradient: string
    onClick?: () => void
  }) => (
    <div 
      onClick={onClick}
      className={`card bg-gradient-to-br ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm opacity-90 mb-1">{title}</div>
          <div className="text-3xl font-bold mb-1">{value}</div>
          {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  )

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-600">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">
              Welcome back, <span className="font-semibold">{user?.name || 'Super Admin'}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
                id="auto-refresh"
              />
              <label htmlFor="auto-refresh" className="cursor-pointer">
                Auto-refresh (30s)
              </label>
            </div>
            {lastUpdated && (
              <div className="text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={loadStats}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Companies"
          value={stats?.companies.total || 0}
          subtitle={`${stats?.companies.active || 0} active`}
          icon="🏢"
          gradient="from-blue-500 to-blue-600"
          onClick={() => router.push('/companies')}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.earnings.monthly || 0)}
          subtitle={`MRR from ${stats?.companies.active || 0} active companies`}
          icon="💰"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          subtitle={`~${Math.round(stats?.users.avgPerCompany || 0)} per company`}
          icon="👥"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pending Inquiries"
          value={stats?.inquiries.pending || 0}
          subtitle="Awaiting response"
          icon="📬"
          gradient="from-orange-500 to-orange-600"
          onClick={() => router.push('/inquiries')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Company Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Active</span>
              <span className="text-lg font-bold text-green-600">{stats?.companies.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Suspended</span>
              <span className="text-lg font-bold text-red-600">{stats?.companies.suspended || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">This Month</span>
              <span className="text-lg font-bold text-blue-600">{stats?.companies.thisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Plans Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Total Plans</span>
              <span className="text-lg font-bold text-slate-900">{stats?.plans.total || 0}</span>
            </div>
            {stats?.earnings.byPlan && Object.entries(stats.earnings.byPlan).map(([plan, data]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-slate-700 capitalize">{plan}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{data.count} companies</div>
                  <div className="text-xs text-slate-500">{formatCurrency(data.mrr)}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/companies/new')}
              className="w-full btn-primary text-sm"
            >
              + Add New Company
            </button>
            <button
              onClick={() => router.push('/plans/new')}
              className="w-full btn-secondary text-sm"
            >
              + Add New Plan
            </button>
            <button
              onClick={() => router.push('/companies')}
              className="w-full btn-secondary text-sm"
            >
              View All Companies
            </button>
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Companies</h3>
          <button
            onClick={() => router.push('/companies')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All →
          </button>
        </div>
        {stats?.recentCompanies && stats.recentCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Code</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Plan</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{company.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{company.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 capitalize">{company.plan}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`badge ${
                        company.status === 'active' ? 'badge-active' : 
                        company.status === 'suspended' ? 'badge-suspended' : 
                        'badge-view-only'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(company.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No companies yet. <button onClick={() => router.push('/companies/new')} className="text-blue-600 hover:text-blue-700">Create one →</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
