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
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-slate-600 font-medium animate-pulse">
              Loading dashboard...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalSales = stats?.earnings?.monthly || 0;
  const totalCompanies = stats?.companies?.total || 0;
  const activeCompanies = stats?.companies?.active || 0;
  const activeUsers = stats?.users?.total || 0;
  const thisMonthCompanies = stats?.companies?.thisMonth || 0;
  const suspendedCompanies = stats?.companies?.suspended || 0;
  const avgUsersPerCompany = stats?.users?.avgPerCompany || 0;
  
  // Calculate growth percentages
  const monthGrowth = revenueTrend?.growthRate || 0;
  const companiesGrowthPercentage = totalCompanies > 0 ? ((thisMonthCompanies / totalCompanies) * 100) : 0;
  const visitorGrowth = -2.0; // You can calculate this from your analytics
  
  // Product stats
  const totalProducts = activeCompanies * 10; // Assuming 10 products per company
  const productsGrowth = 15.1;
  
  // Get revenue trend data
  const revenueChartData = revenueTrend?.trend?.map((item: any) => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    seen: Math.floor(Math.random() * 40) + 30, // Replace with real data
    sales: item.revenue / 10000 // Scale for display
  })) || [];
  
  // Calculate product statistics
  const productStats = earningsData?.byPlan ? Object.entries(earningsData.byPlan).map(([plan, data]: [string, any], index) => ({
    label: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: data.count * 100, // Estimated products
    color: ['#3b82f6', '#8b5cf6', '#ec4899'][index] || '#3b82f6',
    percentage: ((data.count / earningsData.totalCompanies) * 100)
  })) : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 -m-6 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Sales Report
              </h1>
              <p className="text-slate-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 hover:bg-white rounded-xl transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-3 hover:bg-white rounded-xl transition-colors relative">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-xs text-slate-600">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Sales Card - Large */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-green-400/30 backdrop-blur-sm text-white text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +{monthGrowth}%
                  </span>
                </div>
                
                <div>
                  <div className="text-white/90 text-sm font-medium mb-2">Total Sales</div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {formatCurrency(totalSales)}
                  </div>
                  <div className="text-white/70 text-xs">Revenue vs last month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Companies Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className={`px-3 py-1.5 rounded-full ${companiesGrowthPercentage > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'} text-sm font-semibold flex items-center gap-1`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{companiesGrowthPercentage.toFixed(1)}%
              </span>
            </div>
            
            <div>
              <div className="text-slate-600 text-sm font-medium mb-2">Total Companies</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {totalCompanies.toLocaleString()}
              </div>
              <div className="text-slate-500 text-xs">{activeCompanies} active · {thisMonthCompanies} this month</div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold">
                Avg {Math.round(avgUsersPerCompany)}/company
              </span>
            </div>
            
            <div>
              <div className="text-slate-600 text-sm font-medium mb-2">Total Users</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {activeUsers.toLocaleString()}
              </div>
              <div className="text-slate-500 text-xs">Across all companies</div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Active Plans */}
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold">
                {stats?.plans?.total || 0} plans
              </span>
            </div>
            
            <div>
              <div className="text-slate-600 text-sm font-medium mb-2">Monthly Revenue</div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {formatCurrency(earningsData?.totalMRR || totalSales)}
              </div>
              <div className="text-slate-500 text-xs">From {earningsData?.totalCompanies || activeCompanies} paying companies</div>
            </div>
          </div>

          {/* Customer Habits Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Habits</h3>
                <p className="text-sm text-slate-600">Track your customer habits</p>
              </div>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-sm text-slate-600">Seen product</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-slate-600">Sales</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={revenueChartData.length > 0 ? revenueChartData : [
                  { month: 'Jan', seen: 30, sales: 45 },
                  { month: 'Feb', seen: 50, sales: 25 },
                  { month: 'Mar', seen: 40, sales: 35 },
                  { month: 'Apr', seen: 70, sales: 55 },
                  { month: 'May', seen: 45, sales: 30 },
                  { month: 'Jun', seen: 60, sales: 40 },
                ]}
              >
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
                  label={{ value: '60K', position: 'top', fill: '#64748b', fontSize: 12, offset: 10 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#fff', fontSize: '14px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="seen" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

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
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Statistics */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Product Statistic</h3>
              <select className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Today</option>
                <option>Week</option>
                <option>Month</option>
              </select>
            </div>
            <p className="text-sm text-slate-600 mb-6">Track your product sales</p>

            <div className="flex items-center justify-center mb-6">
              {productStats.length > 0 ? (
                <MultiCircularProgress
                  data={productStats.slice(0, 3)}
                  centerValue={totalCompanies.toLocaleString()}
                  centerLabel="Total Companies"
                />
              ) : (
                <MultiCircularProgress
                  data={[
                    { label: 'Starter', value: activeCompanies, color: '#3b82f6', percentage: 45 },
                    { label: 'Pro', value: Math.floor(activeCompanies * 0.3), color: '#8b5cf6', percentage: 30 },
                    { label: 'Enterprise', value: Math.floor(activeCompanies * 0.25), color: '#ec4899', percentage: 25 },
                  ]}
                  centerValue={totalCompanies.toLocaleString()}
                  centerLabel="Total Companies"
                />
              )}
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Customer Growth</h3>
              <select className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Today</option>
                <option>Week</option>
                <option>Month</option>
              </select>
            </div>
            <p className="text-sm text-slate-600 mb-6">Track customer by locations</p>

            <div className="space-y-4">
              {[
                { country: 'Active Companies', value: activeCompanies, color: '#3b82f6', flag: '✅' },
                { country: 'Total Users', value: activeUsers, color: '#10b981', flag: '👥' },
                { country: 'This Month', value: thisMonthCompanies, color: '#f59e0b', flag: '📅' },
                { country: 'Suspended', value: suspendedCompanies, color: '#ef4444', flag: '⚠️' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.flag}</span>
                      <span className="text-sm font-medium text-slate-700">{item.country}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
          </div>

          {/* Upgrade Pro Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Upgrade Pro</h3>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Discover the benefits of an upgraded account
              </p>
              
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
                Upgrade $30
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
