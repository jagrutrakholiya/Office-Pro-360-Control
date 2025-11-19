'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
	totalUsers: number;
	totalProjects: number;
	totalTasks: number;
	completedTasks: number;
	completionRate: number;
	activeUsers: number;
	lastCalculated: string;
}

interface CompanyAnalyticsProps {
	companyId: string;
}

export default function CompanyAnalytics({ companyId }: CompanyAnalyticsProps) {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [calculating, setCalculating] = useState(false);

	useEffect(() => {
		loadAnalytics();
	}, [companyId]);

	const loadAnalytics = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/companies/${companyId}/analytics`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			const data = await response.json();
			setAnalytics(data.analytics);
		} catch (error) {
			console.error('Failed to load analytics:', error);
		} finally {
			setLoading(false);
		}
	};

	const calculateAnalytics = async () => {
		try {
			setCalculating(true);
			const response = await fetch(`/api/companies/${companyId}/analytics/calculate`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			setAnalytics(data.analytics);
		} catch (error) {
			console.error('Failed to calculate analytics:', error);
		} finally {
			setCalculating(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!analytics) {
		return (
			<div className="text-center py-12">
				<p className="text-neutral-600 dark:text-neutral-400 mb-4">No analytics data available</p>
				<button
					onClick={calculateAnalytics}
					disabled={calculating}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
				>
					{calculating ? 'Calculating...' : 'Calculate Analytics'}
				</button>
			</div>
		);
	}

	const stats = [
		{
			label: 'Total Users',
			value: analytics.totalUsers,
			icon: '👥',
			color: 'bg-blue-500',
			textColor: 'text-blue-600 dark:text-blue-400'
		},
		{
			label: 'Active Users',
			value: analytics.activeUsers,
			subtitle: 'Last 7 days',
			icon: '🟢',
			color: 'bg-green-500',
			textColor: 'text-green-600 dark:text-green-400'
		},
		{
			label: 'Total Projects',
			value: analytics.totalProjects,
			icon: '📁',
			color: 'bg-purple-500',
			textColor: 'text-purple-600 dark:text-purple-400'
		},
		{
			label: 'Total Tasks',
			value: analytics.totalTasks,
			icon: '📋',
			color: 'bg-orange-500',
			textColor: 'text-orange-600 dark:text-orange-400'
		},
		{
			label: 'Completed Tasks',
			value: analytics.completedTasks,
			icon: '✅',
			color: 'bg-emerald-500',
			textColor: 'text-emerald-600 dark:text-emerald-400'
		},
		{
			label: 'Completion Rate',
			value: `${analytics.completionRate}%`,
			icon: '📊',
			color: 'bg-amber-500',
			textColor: 'text-amber-600 dark:text-amber-400'
		}
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Company Analytics
					</h2>
					{analytics.lastCalculated && (
						<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
							Last updated: {new Date(analytics.lastCalculated).toLocaleString()}
						</p>
					)}
				</div>
				<button
					onClick={calculateAnalytics}
					disabled={calculating}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
				>
					{calculating ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							Calculating...
						</>
					) : (
						<>
							🔄 Refresh Analytics
						</>
					)}
				</button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{stats.map((stat, index) => (
				<div
					key={stat.label}
					className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
									{stat.label}
								</p>
								<p className={`text-3xl font-bold ${stat.textColor}`}>
									{stat.value}
								</p>
								{stat.subtitle && (
									<p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
										{stat.subtitle}
									</p>
								)}
							</div>
							<div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center text-2xl`}>
								{stat.icon}
						</div>
					</div>
				</div>
			))}
			</div>			{/* Completion Rate Progress Bar */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					Task Completion Progress
				</h3>
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-neutral-600 dark:text-neutral-400">
							{analytics.completedTasks} of {analytics.totalTasks} tasks completed
						</span>
						<span className="font-semibold text-neutral-900 dark:text-neutral-100">
							{analytics.completionRate}%
						</span>
					</div>
				<div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-4">
					<div
						style={{ width: `${analytics.completionRate}%` }}
						className={`h-4 rounded-full transition-all duration-1000 ${
							analytics.completionRate >= 80
								? 'bg-green-500'
								: analytics.completionRate >= 50
								? 'bg-yellow-500'
								: 'bg-red-500'
						}`}
					></div>
					</div>
				</div>
			</div>

			{/* User Activity */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					User Activity
				</h3>
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">Active Users</p>
						<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
							{analytics.activeUsers}
						</p>
					</div>
					<div>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">Total Users</p>
						<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
							{analytics.totalUsers}
						</p>
					</div>
					<div>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">Activity Rate</p>
						<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
							{analytics.totalUsers > 0 
								? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) 
								: 0}%
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
