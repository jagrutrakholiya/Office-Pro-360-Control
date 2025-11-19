'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns';
import { apiRequest } from 'lib/api';

interface Task {
	_id: string;
	title: string;
	status: string;
	priority: string;
	dueDate: string;
	projectId?: {
		_id: string;
		name: string;
	};
}

interface UpcomingDeadlinesWidgetProps {
	widgetId: string;
	config?: any;
}

export default function UpcomingDeadlinesWidget({ widgetId, config }: UpcomingDeadlinesWidgetProps) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDeadlines();
		
		const interval = setInterval(fetchDeadlines, config?.refreshInterval || 300000);
		return () => clearInterval(interval);
	}, [config]);

	const fetchDeadlines = async () => {
		try {
			setLoading(true);
			const response = await apiRequest('/dashboard/widgets/upcomingDeadlines/data');
			setTasks(response.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to fetch upcoming deadlines:', err);
			setError(err.message || 'Failed to load upcoming deadlines');
		} finally {
			setLoading(false);
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case 'high':
			case 'urgent':
				return 'text-red-600 bg-red-50 dark:bg-red-900/20';
			case 'medium':
				return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
			case 'low':
				return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
			default:
				return 'text-neutral-600 bg-neutral-50 dark:bg-neutral-700';
		}
	};

	const getDeadlineLabel = (dueDate: string) => {
		const date = new Date(dueDate);
		
		if (isPast(date)) {
			return {
				label: 'Overdue',
				color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
				icon: (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				)
			};
		}
		
		if (isToday(date)) {
			return {
				label: 'Today',
				color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
				icon: (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				)
			};
		}
		
		if (isTomorrow(date)) {
			return {
				label: 'Tomorrow',
				color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
				icon: (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				)
			};
		}
		
		return {
			label: formatDistanceToNow(date, { addSuffix: true }),
			color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			)
		};
	};

	if (loading && tasks.length === 0) {
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
					onClick={fetchDeadlines}
					className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-4">
				<svg className="w-12 h-12 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">All Caught Up!</p>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					No upcoming deadlines in the next 7 days
				</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto">
			<div className="space-y-2">
				{tasks.map((task) => {
					const deadline = getDeadlineLabel(task.dueDate);
					
					return (
						<div
							key={task._id}
							className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-sm transition-shadow"
						>
							{/* Task Info */}
							<div className="flex items-start justify-between gap-2 mb-2">
								<div className="flex-1 min-w-0">
									<h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
										{task.title}
									</h4>
									{task.projectId && (
										<p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
											{task.projectId.name}
										</p>
									)}
								</div>
								
								{/* Priority Badge */}
								<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
									{task.priority}
								</span>
							</div>

							{/* Deadline Info */}
							<div className="flex items-center justify-between">
								<div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${deadline.color}`}>
									{deadline.icon}
									<span>{deadline.label}</span>
								</div>
								
								<span className="text-xs text-neutral-500 dark:text-neutral-400">
									{format(new Date(task.dueDate), 'MMM d, yyyy')}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
