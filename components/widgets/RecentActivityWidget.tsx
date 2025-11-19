'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from 'lib/api';

interface Activity {
	_id: string;
	type: string;
	action: string;
	description: string;
	userId: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	};
	entityType?: string;
	entityId?: string;
	entityTitle?: string;
	isImportant: boolean;
	createdAt: string;
}

interface RecentActivityWidgetProps {
	widgetId: string;
	config?: any;
}

export default function RecentActivityWidget({ widgetId, config }: RecentActivityWidgetProps) {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchActivities();
		
		const interval = setInterval(fetchActivities, config?.refreshInterval || 60000); // 1 minute default
		return () => clearInterval(interval);
	}, [config]);

	const fetchActivities = async () => {
		try {
			setLoading(true);
			const response = await apiRequest('/dashboard/widgets/recentActivity/data', {
				params: { limit: config?.limit || 10 }
			});
			setActivities(response.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to fetch recent activity:', err);
			setError(err.message || 'Failed to load recent activity');
		} finally {
			setLoading(false);
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'task_created':
			case 'task_updated':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				);
			case 'task_completed':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case 'task_deleted':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				);
			case 'task_assigned':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				);
			case 'task_commented':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
					</svg>
				);
			case 'project_created':
			case 'project_updated':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
				);
			case 'project_completed':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			case 'user_joined':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
				);
			case 'file_uploaded':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
				);
			case 'time_logged':
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
			default:
				return (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				);
		}
	};

	const getActivityColor = (type: string) => {
		if (type.includes('completed')) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
		if (type.includes('deleted')) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
		if (type.includes('created')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
		if (type.includes('updated')) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
		return 'text-neutral-600 bg-neutral-50 dark:bg-neutral-700';
	};

	if (loading && activities.length === 0) {
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
					onClick={fetchActivities}
					className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-4">
				<svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
				<p className="text-sm text-neutral-600 dark:text-neutral-400">No recent activity</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto">
			<div className="space-y-3">
				{activities.map((activity) => (
					<div
						key={activity._id}
						className={`flex gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-sm transition-shadow ${
							activity.isImportant ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
						}`}
					>
						{/* Activity Icon */}
						<div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.type)}`}>
							{getActivityIcon(activity.type)}
						</div>

						{/* Activity Content */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1">
									<p className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
										{activity.description}
									</p>
									{activity.entityTitle && (
										<p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
											{activity.entityTitle}
										</p>
									)}
								</div>
								{activity.isImportant && (
									<svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								)}
							</div>

							{/* User and Time */}
							<div className="flex items-center gap-2 mt-2">
								{activity.userId.avatar ? (
									<img
										src={activity.userId.avatar}
										alt={`${activity.userId.firstName} ${activity.userId.lastName}`}
										className="w-5 h-5 rounded-full"
									/>
								) : (
									<div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
										<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
											{activity.userId.firstName.charAt(0)}
										</span>
									</div>
								)}
								<span className="text-xs text-neutral-600 dark:text-neutral-400">
									{activity.userId.firstName} {activity.userId.lastName}
								</span>
								<span className="text-xs text-neutral-400">•</span>
								<span className="text-xs text-neutral-400">
									{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
