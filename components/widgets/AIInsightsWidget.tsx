'use client';

import { apiRequest } from 'lib/api';
import { useEffect, useState } from 'react';

interface Insight {
	type: string;
	title: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
	icon: string;
	actionable: boolean;
	data?: any;
}

interface AIInsightsWidgetProps {
	widgetId: string;
	config?: any;
}

export default function AIInsightsWidget({ widgetId, config }: AIInsightsWidgetProps) {
	const [insights, setInsights] = useState<Insight[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchInsights();
		
		// Refresh less frequently for AI insights (default: 15 minutes)
		const interval = setInterval(fetchInsights, config?.refreshInterval || 900000);
		return () => clearInterval(interval);
	}, [config]);

	const fetchInsights = async () => {
		try {
			setLoading(true);
			const response = await apiRequest('/dashboard/widgets/aiInsights/data');
			setInsights(response.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to fetch AI insights:', err);
			setError(err.message || 'Failed to load AI insights');
		} finally {
			setLoading(false);
		}
	};

	const getInsightIcon = (priority: string) => {
		switch (priority) {
			case 'high':
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				);
			case 'medium':
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case 'low':
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				);
			default:
				return null;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
			case 'medium':
				return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
			case 'low':
				return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
			default:
				return 'text-neutral-600 bg-neutral-50 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-700';
		}
	};

	const getPriorityLabel = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'High Priority';
			case 'medium':
				return 'Medium Priority';
			case 'low':
				return 'Low Priority';
			default:
				return '';
		}
	};

	if (loading && insights.length === 0) {
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
					onClick={fetchInsights}
					className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	if (insights.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-4">
				<svg className="w-12 h-12 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">All Clear!</p>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					No important insights at the moment. Keep up the good work!
				</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto">
			<div className="space-y-3">
				{insights.map((insight, index) => (
					<div
						key={index}
						className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
					>
						{/* Header */}
						<div className="flex items-start gap-3 mb-2">
							<div className="flex-shrink-0 mt-0.5">
								{getInsightIcon(insight.priority)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<h4 className="font-semibold text-sm">
										{insight.title}
									</h4>
									<span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
										{getPriorityLabel(insight.priority)}
									</span>
								</div>
								<p className="text-sm mt-1 opacity-90">
									{insight.message}
								</p>
							</div>
						</div>

						{/* Action Button (if actionable) */}
						{insight.actionable && (
							<div className="mt-3 pt-3 border-t border-current opacity-20">
								<button className="text-xs font-medium hover:underline">
									View Details →
								</button>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Refresh Info */}
			<div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
				<p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
					💡 AI insights are updated every 15 minutes
				</p>
			</div>
		</div>
	);
}
