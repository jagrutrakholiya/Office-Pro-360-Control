'use client';

import { apiRequest } from 'lib/api';
import { useEffect, useState } from 'react';

interface TaskStats {
	total: number;
	completed: number;
	inProgress: number;
	todo: number;
	overdue: number;
}

interface TaskStatsWidgetProps {
	widgetId: string;
	config?: any;
}

export default function TaskStatsWidget({ widgetId, config }: TaskStatsWidgetProps) {
	const [stats, setStats] = useState<TaskStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchStats();
		
		// Refresh interval from config (default: 5 minutes)
		const interval = setInterval(fetchStats, config?.refreshInterval || 300000);
		return () => clearInterval(interval);
	}, [config]);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await apiRequest('/dashboard/widgets/taskStats/data');
			setStats(response.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to fetch task stats:', err);
			setError(err.message || 'Failed to load task statistics');
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
			label: 'Total Tasks',
			value: stats.total,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
			label: 'In Progress',
			value: stats.inProgress,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
			textColor: 'text-yellow-900 dark:text-yellow-100'
		},
		{
			label: 'To Do',
			value: stats.todo,
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			),
			color: 'text-neutral-600 bg-neutral-50 dark:bg-neutral-700',
			textColor: 'text-neutral-900 dark:text-neutral-100'
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
			
			{/* Completion Progress Bar */}
			{stats.total > 0 && (
				<div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-neutral-600 dark:text-neutral-400">Completion Rate</span>
						<span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
							{Math.round((stats.completed / stats.total) * 100)}%
						</span>
					</div>
					<div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
						<div
							className="bg-green-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${(stats.completed / stats.total) * 100}%` }}
						></div>
					</div>
				</div>
			)}
		</div>
	);
}
