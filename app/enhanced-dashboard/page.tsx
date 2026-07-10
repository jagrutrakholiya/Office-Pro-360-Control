"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import CircularProgress from "../../components/CircularProgress";
import MultiCircularProgress from "../../components/MultiCircularProgress";
import ProgressBar from "../../components/ProgressBar";
import {
 PageHeader,
 StatCard,
 Card,
 CardTitle,
 CardDescription,
 Select,
 EmptyState,
 Skeleton,
} from "@/components/ui";
import {
 AreaChart,
 Area,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

export default function EnhancedDashboard() {
 const router = useRouter();
 const { user } = useAuth();
 const [stats, setStats] = useState<any>(null);
 const [revenueTrend, setRevenueTrend] = useState<any>(null);
 const [companyStatus, setCompanyStatus] = useState<any>(null);
 const [earningsData, setEarningsData] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [selectedPeriod, setSelectedPeriod] = useState("today");
 const [autoRefresh, setAutoRefresh] = useState(true);

 const loadStats = async () => {
 try {
 const [statsRes, revenueRes, statusRes, earningsRes] = await Promise.all([
 api.get("/admin/dashboard/stats"),
 api.get("/admin/metrics/revenue-trend"),
 api.get("/admin/metrics/company-status-distribution"),
 api.get("/admin/metrics/earnings")
 ]);
 
 setStats(statsRes.data);
 setRevenueTrend(revenueRes.data);
 setCompanyStatus(statusRes.data);
 setEarningsData(earningsRes.data);
 } catch (err) {
 console.error("Failed to load dashboard stats:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadStats();
 
 if (autoRefresh) {
 const interval = setInterval(() => {
 loadStats();
 }, 30000);
 return () => clearInterval(interval);
 }
 }, [autoRefresh]);

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat("en-IN", {
 style: "currency",
 currency: "INR",
 maximumFractionDigits: 0,
 }).format(amount);
 };

 if (loading) {
 return (
 <Layout>
 <div className="space-y-6">
 <Skeleton className="h-9 w-56" />
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[0, 1, 2, 3].map((i) => (
 <Skeleton key={i} variant="rounded" className="h-28" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Skeleton variant="rounded" className="h-72" />
 <Skeleton variant="rounded" className="h-72 lg:col-span-2" />
 </div>
 </div>
 </Layout>
 );
 }

 // ─── Real values from APIs (no fakes, no Math.random, no hardcoded fallbacks) ─
 const totalMRR = earningsData?.totalMRR || 0;
 const payingCompanies = earningsData?.totalCompanies || 0;
 const totalCompanies = stats?.companies?.total || 0;
 const activeCompanies = stats?.companies?.active || 0;
 const activeUsers = stats?.users?.total || 0;
 const thisMonthCompanies = stats?.companies?.thisMonth || 0;
 const suspendedCompanies = stats?.companies?.suspended || 0;
 const avgUsersPerCompany = stats?.users?.avgPerCompany || 0;

 // Real growth from trend (last vs first month). 0 if there's no data yet.
 const monthGrowth = revenueTrend?.growthRate || 0;
 const companiesGrowthPercentage = totalCompanies > 0
 ? ((thisMonthCompanies / totalCompanies) * 100)
 : 0;

 // Revenue trend chart — pure real data, no synthetic "seen" series.
 // Each point is { month: "Jan", revenue: 12345, activeCompanies: 4 }.
 const revenueChartData = (revenueTrend?.trend || []).map((item: any) => ({
 month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
 revenue: item.revenue,
 activeCompanies: item.activeCompanies || 0,
 }));

 // Plan distribution donut — real counts, palette is fixed but mapped in order.
 const PLAN_PALETTE = ['#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0'];
 const planEntries = earningsData?.byPlan
 ? Object.entries(earningsData.byPlan)
 : [];
 const productStats = planEntries.map(([planCode, data]: [string, any], index) => ({
 label: data.name || (planCode.charAt(0).toUpperCase() + planCode.slice(1)),
 value: data.count,
 color: PLAN_PALETTE[index % PLAN_PALETTE.length],
 percentage: payingCompanies > 0 ? (data.count / payingCompanies) * 100 : 0,
 }));

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Sales Report"
 description={new Date().toLocaleDateString('en-US', {
 weekday: 'long',
 month: 'long',
 day: 'numeric',
 year: 'numeric',
 })}
 actions={
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
 {user?.name?.charAt(0) || 'A'}
 </div>
 <div className="hidden sm:block">
 <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 {user?.name || 'Admin'}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Admin</div>
 </div>
 </div>
 }
 />

 {/* Main Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard
 label="Total MRR"
 value={formatCurrency(totalMRR)}
 delta={{ value: `${monthGrowth}%`, trend: 'up' }}
 description={`From ${payingCompanies} paying companies`}
 accent="primary"
 />
 <StatCard
 label="Total Companies"
 value={totalCompanies.toLocaleString()}
 delta={{ value: `${companiesGrowthPercentage.toFixed(1)}%`, trend: 'up' }}
 description={`${activeCompanies} active · ${thisMonthCompanies} this month`}
 accent="success"
 />
 <StatCard
 label="Total Users"
 value={activeUsers.toLocaleString()}
 description={`Avg ${Math.round(avgUsersPerCompany)}/company`}
 accent="primary"
 />
 <StatCard
 label="Monthly Revenue"
 value={formatCurrency(totalMRR)}
 description={`${stats?.plans?.total || 0} plans · ${payingCompanies} paying`}
 accent="warning"
 />
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Customer Habits Chart */}
 <Card className="lg:col-span-2">
 <div className="flex items-center justify-between mb-6">
 <div>
 <CardTitle>Customer Habits</CardTitle>
 <CardDescription>Track your customer habits</CardDescription>
 </div>
 <Select
 value={selectedPeriod}
 onChange={(e) => setSelectedPeriod(e.target.value)}
 className="w-36"
 >
 <option value="today">Today</option>
 <option value="week">This Week</option>
 <option value="month">This Month</option>
 <option value="year">This Year</option>
 </Select>
 </div>

 <div className="flex items-center gap-6 mb-6">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-slate-100"></div>
 <span className="text-sm text-slate-500 dark:text-slate-400">Monthly recurring revenue (₹)</span>
 </div>
 </div>

 {revenueChartData.length === 0 ? (
 <EmptyState
 size="compact"
 title="No subscription data yet"
 description="This chart will populate once companies start paying."
 />
 ) : (
 <ResponsiveContainer width="100%" height={240}>
 <BarChart data={revenueChartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
 <XAxis
 dataKey="month"
 axisLine={false}
 tickLine={false}
 tick={{ fill: '#94a3b8', fontSize: 12 }}
 />
 <YAxis
 axisLine={false}
 tickLine={false}
 tick={{ fill: '#94a3b8', fontSize: 12 }}
 tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: '#0f172a',
 border: 'none',
 borderRadius: '8px',
 padding: '8px 12px',
 }}
 labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: '4px', fontSize: '12px' }}
 itemStyle={{ color: '#fff', fontSize: '13px' }}
 cursor={{ fill: '#f1f5f9' }}
 formatter={(value) => [formatCurrency(Number(value) || 0), 'MRR']}
 />
 <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 )}

 <div className="flex items-center justify-center gap-8 mt-4 p-4 bg-slate-900 rounded-2xl">
 <div className="text-center">
 <div className="text-2xl font-bold text-white">{activeCompanies.toLocaleString()}</div>
 <div className="text-sm text-slate-400">Active</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-white">{suspendedCompanies.toLocaleString()}</div>
 <div className="text-sm text-slate-400">Suspended</div>
 </div>
 </div>
 </Card>

 {/* Plan Distribution */}
 <Card>
 <CardTitle>Plan Distribution</CardTitle>
 <CardDescription className="mb-6">Active subscriptions by plan</CardDescription>

 <div className="flex items-center justify-center mb-6">
 {productStats.length > 0 ? (
 <MultiCircularProgress
 data={productStats.slice(0, 4)}
 centerValue={payingCompanies.toLocaleString()}
 centerLabel="Paying"
 />
 ) : (
 <EmptyState size="compact" title="No paying subscriptions yet" className="w-full" />
 )}
 </div>
 </Card>
 </div>

 {/* Bottom Row */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Customer Growth */}
 <Card className="lg:col-span-2">
 <div className="flex items-center justify-between mb-6">
 <CardTitle>Customer Growth</CardTitle>
 <Select className="w-28">
 <option>Today</option>
 <option>Week</option>
 <option>Month</option>
 </Select>
 </div>
 <CardDescription className="mb-6">Track customer by locations</CardDescription>

 <div className="space-y-4">
 {[
 { country: 'Active Companies', value: activeCompanies, color: '#3b82f6', flag: '' },
 { country: 'Total Users', value: activeUsers, color: '#10b981', flag: '' },
 { country: 'This Month', value: thisMonthCompanies, color: '#f59e0b', flag: '' },
 { country: 'Suspended', value: suspendedCompanies, color: '#ef4444', flag: '' },
 ].map((item, index) => (
 <div key={index} className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-2xl">{item.flag}</span>
 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.country}</span>
 </div>
 <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
 {item.value.toLocaleString()}
 </span>
 </div>
 <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-all duration-1000"
 style={{
 width: `${totalCompanies > 0 ? (item.value / totalCompanies) * 100 : 0}%`,
 backgroundColor: item.color
 }}
 />
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Finance Quick Links — replaces the old "Upgrade Pro" promo
 card. These three pages are the new dynamic finance suite:
 Costs (track what you spend), P&L (revenue minus costs), and
 Calculator (what-if scenarios at N users on plan X). */}
 <div className="bg-slate-900 rounded-3xl p-6 shadow-lg flex flex-col">
 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </div>
 <h3 className="text-lg font-bold text-white mb-1">Finance</h3>
 <p className="text-white/60 text-xs mb-5">Track costs, profit & scenarios</p>
 <div className="space-y-2 mt-auto">
 <a
 href="/costs"
 className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
 >
 <span>Platform costs</span>
 <span className="text-white/40">→</span>
 </a>
 <a
 href="/pnl"
 className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
 >
 <span>Profit & Loss</span>
 <span className="text-white/40">→</span>
 </a>
 <a
 href="/calculator"
 className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
 >
 <span>Profit calculator</span>
 <span className="text-white/40">→</span>
 </a>
 </div>
 </div>
 </div>
 </div>
 </Layout>
 );
}
