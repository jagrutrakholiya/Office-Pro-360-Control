'use client'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { PageHeader, StatCard, Card, CardTitle, DataTable } from '@/components/ui'
import api from '../../lib/api'
import RevenueTrendChart from '../../components/RevenueTrendChart'
import CompanyStatusDistribution from '../../components/CompanyStatusDistribution'

type EarningsData = { totalMRR: number; byPlan: Record<string, { count: number; mrr: number; name?: string }> }

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api.get('/admin/metrics/earnings')
      setData(res.data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalCompanies = data ? Object.values(data.byPlan).reduce((sum, p) => sum + p.count, 0) : 0

  const planRows = data
    ? Object.entries(data.byPlan).map(([plan, info]) => ({ plan, ...info }))
    : []

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Earnings"
          description="Revenue metrics and subscription analytics"
        />

        {/* MRR Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Monthly Recurring Revenue"
            value={formatCurrency(data?.totalMRR || 0)}
            description={`From ${totalCompanies} paying companies`}
            accent="success"
          />
          <StatCard
            label="Annual Run Rate"
            value={formatCurrency((data?.totalMRR || 0) * 12)}
            description="Projected yearly revenue"
            accent="primary"
          />
          <StatCard
            label="Avg Revenue Per Company"
            value={formatCurrency(totalCompanies > 0 ? (data?.totalMRR || 0) / totalCompanies : 0)}
            description="ARPC this month"
            accent="primary"
          />
        </div>

        {/* Dynamic Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <RevenueTrendChart editable />
          </Card>
          <Card>
            <CompanyStatusDistribution />
          </Card>
        </div>

        {/* Revenue by Plan Table */}
        <div className="space-y-3">
          <CardTitle>Revenue by Plan</CardTitle>
          <DataTable<{ plan: string; count: number; mrr: number; name?: string }>
            data={planRows}
            loading={loading}
            rowKey={(row) => row.plan}
            emptyTitle="No plan data available"
            columns={[
              {
                key: 'plan',
                header: 'Plan',
                render: (row) => (
                  <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {row.name || row.plan}
                  </span>
                ),
              },
              { key: 'count', header: 'Companies', render: (row) => row.count },
              {
                key: 'mrr',
                header: 'MRR',
                render: (row) => (
                  <span className="font-semibold text-success-600 dark:text-success-400">
                    {formatCurrency(row.mrr)}
                  </span>
                ),
              },
              {
                key: 'pct',
                header: '% of Revenue',
                render: (row) =>
                  `${data && data.totalMRR > 0 ? ((row.mrr / data.totalMRR) * 100).toFixed(1) : 0}%`,
              },
            ]}
          />
        </div>
      </div>
    </Layout>
  )
}
