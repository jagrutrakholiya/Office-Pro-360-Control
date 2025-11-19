'use client';

import { useState, useEffect } from 'react';

interface UsageData {
	storageUsed: number;
	storageQuota: number;
	apiCallsThisMonth: number;
	apiQuota: number;
	filesUploaded: number;
	lastResetDate: string;
	storagePercentage: number;
	apiPercentage: number;
	storageAlert: 'none' | 'warning' | 'critical';
	apiAlert: 'none' | 'warning' | 'critical';
}

interface UsageStatisticsProps {
	companyId: string;
}

export default function UsageStatistics({ companyId }: UsageStatisticsProps) {
	const [usage, setUsage] = useState<UsageData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadUsageData();
	}, [companyId]);

	const loadUsageData = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:3000/api/companies/${companyId}/usage`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to fetch usage data');

			const data = await response.json();
			setUsage(data);
		} catch (error) {
			console.error('Error loading usage data:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const formatNumber = (num: number): string => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};

	const getAlertColor = (alert: 'none' | 'warning' | 'critical'): string => {
		switch (alert) {
			case 'critical':
				return 'text-red-600 dark:text-red-400';
			case 'warning':
				return 'text-yellow-600 dark:text-yellow-400';
			default:
				return 'text-green-600 dark:text-green-400';
		}
	};

	const getProgressColor = (percentage: number): string => {
		if (percentage >= 95) return 'bg-red-500';
		if (percentage >= 80) return 'bg-yellow-500';
		return 'bg-blue-500';
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!usage) {
		return (
			<div className="text-center p-12">
				<p className="text-neutral-600 dark:text-neutral-400">No usage data available</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Usage Statistics
					</h2>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
						Monitor your company's resource usage and quotas
					</p>
				</div>
				<button
					onClick={loadUsageData}
					disabled={loading}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			{/* Usage Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Storage Usage Card */}
				<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
							Storage Usage
						</h3>
						{usage.storageAlert !== 'none' && (
							<span
								className={`px-2 py-1 text-xs font-medium rounded-full ${
									usage.storageAlert === 'critical'
										? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
										: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
								}`}
							>
								{usage.storageAlert === 'critical' ? 'Critical' : 'Warning'}
							</span>
						)}
					</div>

					{/* Circular Progress */}
					<div className="flex items-center justify-center mb-6">
						<div className="relative w-40 h-40">
							<svg className="transform -rotate-90 w-40 h-40">
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="transparent"
									className="text-neutral-200 dark:text-neutral-700"
								/>
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="transparent"
									strokeDasharray={`${2 * Math.PI * 70}`}
									strokeDashoffset={`${2 * Math.PI * 70 * (1 - usage.storagePercentage / 100)}`}
									className={`transition-all duration-1000 ${
										usage.storagePercentage >= 95
											? 'text-red-500'
											: usage.storagePercentage >= 80
											? 'text-yellow-500'
											: 'text-blue-500'
									}`}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
									{usage.storagePercentage.toFixed(1)}%
								</span>
								<span className="text-sm text-neutral-600 dark:text-neutral-400">Used</span>
							</div>
						</div>
					</div>

					{/* Storage Details */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Used:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatBytes(usage.storageUsed)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Quota:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatBytes(usage.storageQuota)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Available:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatBytes(usage.storageQuota - usage.storageUsed)}
							</span>
						</div>
						<div className="flex justify-between text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
							<span className="text-neutral-600 dark:text-neutral-400">Files Uploaded:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{usage.filesUploaded.toLocaleString()}
							</span>
						</div>
					</div>
				</div>

				{/* API Usage Card */}
				<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
							API Usage
						</h3>
						{usage.apiAlert !== 'none' && (
							<span
								className={`px-2 py-1 text-xs font-medium rounded-full ${
									usage.apiAlert === 'critical'
										? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
										: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
								}`}
							>
								{usage.apiAlert === 'critical' ? 'Critical' : 'Warning'}
							</span>
						)}
					</div>

					{/* Circular Progress */}
					<div className="flex items-center justify-center mb-6">
						<div className="relative w-40 h-40">
							<svg className="transform -rotate-90 w-40 h-40">
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="transparent"
									className="text-neutral-200 dark:text-neutral-700"
								/>
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="transparent"
									strokeDasharray={`${2 * Math.PI * 70}`}
									strokeDashoffset={`${2 * Math.PI * 70 * (1 - usage.apiPercentage / 100)}`}
									className={`transition-all duration-1000 ${
										usage.apiPercentage >= 95
											? 'text-red-500'
											: usage.apiPercentage >= 80
											? 'text-yellow-500'
											: 'text-purple-500'
									}`}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
									{usage.apiPercentage.toFixed(1)}%
								</span>
								<span className="text-sm text-neutral-600 dark:text-neutral-400">Used</span>
							</div>
						</div>
					</div>

					{/* API Details */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Calls This Month:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatNumber(usage.apiCallsThisMonth)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Monthly Quota:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatNumber(usage.apiQuota)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-neutral-600 dark:text-neutral-400">Remaining:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{formatNumber(usage.apiQuota - usage.apiCallsThisMonth)}
							</span>
						</div>
						<div className="flex justify-between text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
							<span className="text-neutral-600 dark:text-neutral-400">Resets On:</span>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">
								{new Date(usage.lastResetDate).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Usage Trends (Optional Enhancement) */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					Quick Summary
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Storage Status</p>
						<p className={`text-2xl font-bold ${getAlertColor(usage.storageAlert)}`}>
							{usage.storageAlert === 'critical'
								? 'Needs Attention'
								: usage.storageAlert === 'warning'
								? 'Monitor Closely'
								: 'Healthy'}
						</p>
						<div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
							<div
								style={{ width: `${usage.storagePercentage}%` }}
								className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(
									usage.storagePercentage
								)}`}
							></div>
						</div>
					</div>
					<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
						<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">API Status</p>
						<p className={`text-2xl font-bold ${getAlertColor(usage.apiAlert)}`}>
							{usage.apiAlert === 'critical'
								? 'Needs Attention'
								: usage.apiAlert === 'warning'
								? 'Monitor Closely'
								: 'Healthy'}
						</p>
						<div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
							<div
								style={{ width: `${usage.apiPercentage}%` }}
								className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(
									usage.apiPercentage
								)}`}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
