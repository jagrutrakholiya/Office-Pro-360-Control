'use client';
import { apiRequest } from 'lib/api';
import { useEffect, useState } from 'react';

interface ProjectStats {
	total: number;
	active: number;
	completed: number;
	onHold: number;
	overdue: number;
}

interface ProjectStatsWidgetProps {
	widgetId: string;
	config?: any;
}

export default function ProjectStatsWidget({ widgetId, config }: ProjectStatsWidgetProps) {
	const [stats, setStats] = useState<ProjectStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchStats();
		
		const interval = setInterval(fetchStats, config?.refreshInterval || 300000);
		return () => clearInterval(interval);
	}, [config]);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await apiRequest('/dashboard/widgets/projectStats/data');
			setStats(response.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to fetch project stats:', err);
			setError(err.message || 'Failed to load project statistics');
		} finally {
			setLoading(false);
		}
	};

	if (loading && !stats) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-4">
				<svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>
				<button
					onClick={fetchStats}
					className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="flex items-center justify-center h-full text-neutral-400">
				No data available
			</div>
		);
	}

	const statItems = [
		{
			label: 'Total Projects',
			value: stats.total,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
			),
			color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
			textColor: 'text-purple-900 dark:text-purple-100'
		},
		{
			label: 'Active',
			value: stats.active,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			),
			color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
			textColor: 'text-blue-900 dark:text-blue-100'
		},
		{
			label: 'Completed',
			value: stats.completed,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
			textColor: 'text-green-900 dark:text-green-100'
		},
		{
			label: 'On Hold',
			value: stats.onHold,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
			textColor: 'text-yellow-900 dark:text-yellow-100'
		},
		{
			label: 'Overdue',
			value: stats.overdue,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
			textColor: 'text-red-900 dark:text-red-100'
		}
	];

	return (
		<div className="h-full flex flex-col">
			<div className="grid grid-cols-1 gap-3 flex-1">
				{statItems.map((item, index) => (
					<div
						key={index}
						className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-sm transition-shadow"
					>
						<div className={`p-2 rounded-lg ${item.color}`}>
							{item.icon}
						</div>
						<div className="flex-1">
							<p className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</p>
							<p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
						</div>
					</div>
				))}
			</div>
			
			{/* Project Status Distribution */}
			{stats.total > 0 && (
				<div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
					<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Status Distribution</p>
					<div className="flex gap-1 h-2 rounded-full overflow-hidden">
						{stats.active > 0 && (
							<div
								className="bg-blue-600"
								style={{ width: `${(stats.active / stats.total) * 100}%` }}
								title={`Active: ${stats.active}`}
							></div>
						)}
						{stats.completed > 0 && (
							<div
								className="bg-green-600"
								style={{ width: `${(stats.completed / stats.total) * 100}%` }}
								title={`Completed: ${stats.completed}`}
							></div>
						)}
						{stats.onHold > 0 && (
							<div
								className="bg-yellow-600"
								style={{ width: `${(stats.onHold / stats.total) * 100}%` }}
								title={`On Hold: ${stats.onHold}`}
							></div>
						)}
						{stats.overdue > 0 && (
							<div
								className="bg-red-600"
								style={{ width: `${(stats.overdue / stats.total) * 100}%` }}
								title={`Overdue: ${stats.overdue}`}
							></div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
