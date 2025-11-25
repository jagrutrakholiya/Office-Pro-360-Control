import api from './api';

export interface RevenuePoint {
  month: string; // e.g. '2025-06'
  revenue: number; // numeric value (INR)
}

export interface RevenueTrendResponse {
  trend: RevenuePoint[];
  totalLast6Months: number;
  growthRate: number; // percentage compared to previous 6 months
}

export interface StatusDistributionResponse {
  statuses: Record<string, number>; // e.g. { active: 10, suspended: 2 }
  total: number;
}

export async function getRevenueTrend(): Promise<RevenueTrendResponse> {
  try {
    const { data } = await api.get('/admin/metrics/revenue-trend');
    return data;
  } catch (err) {
    // Fallback with placeholder months if API not ready
    const now = new Date();
    const trend: RevenuePoint[] = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: Math.round(50000 + Math.random() * 50000)
      };
    });
    return {
      trend,
      totalLast6Months: trend.reduce((a, b) => a + b.revenue, 0),
      growthRate: 12.5
    };
  }
}

export async function updateRevenueTrend(trend: RevenuePoint[]): Promise<RevenueTrendResponse> {
  try {
    const { data } = await api.patch('/admin/metrics/revenue-trend', { trend });
    return data;
  } catch {
    return { trend, totalLast6Months: trend.reduce((a,b)=>a+b.revenue,0), growthRate: 0 };
  }
}

export async function getCompanyStatusDistribution(): Promise<StatusDistributionResponse> {
  try {
    const { data } = await api.get('/admin/metrics/company-status-distribution');
    return data;
  } catch {
    // Fallback placeholder
    const statuses = { active: 24, view_only: 6, suspended: 3 };
    return { statuses, total: Object.values(statuses).reduce((a,b)=>a+b,0) };
  }
}
