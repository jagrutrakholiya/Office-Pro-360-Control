'use client';

import { useState, useEffect } from 'react';

interface Activity {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	action: string;
	resourceType: string;
	resourceId?: string;
	details?: string;
	metadata?: any;
	timestamp: string;
}

interface CompanyActivityFeedProps {
	companyId: string;
}

export default function CompanyActivityFeed({ companyId }: CompanyActivityFeedProps) {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const [filter, setFilter] = useState<string>('all');
	const limit = 20;

	useEffect(() => {
		loadActivities(true);
	}, [companyId, filter]);

	const loadActivities = async (reset: boolean = false) => {
		try {
			if (reset) {
				setLoading(true);
				setOffset(0);
			} else {
				setLoadingMore(true);
			}

			const token = localStorage.getItem('token');
			const currentOffset = reset ? 0 : offset;
			
			let url = `http://localhost:3000/api/companies/${companyId}/activity?limit=${limit}&offset=${currentOffset}`;
			if (filter !== 'all') {
				url += `&resourceType=${filter}`;
			}

			const response = await fetch(url, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to fetch activities');

			const data = await response.json();
			
			if (reset) {
				setActivities(data);
			} else {
				setActivities(prev => [...prev, ...data]);
			}

			setHasMore(data.length === limit);
			if (!reset) {
				setOffset(currentOffset + limit);
			}
		} catch (error) {
			console.error('Error loading activities:', error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const getActivityIcon = (resourceType: string): string => {
		const icons: Record<string, string> = {
			user: '👤',
			project: '📁',
			task: '✅',
			department: '🏢',
			division: '🏛️',
			file: '📄',
			comment: '💬',
			invoice: '💰',
			settings: '⚙️',
		};
		return icons[resourceType] || '📌';
	};

	const getActivityColor = (action: string): string => {
		if (action.includes('create')) return 'text-green-600 dark:text-green-400';
		if (action.includes('update') || action.includes('edit')) return 'text-blue-600 dark:text-blue-400';
		if (action.includes('delete') || action.includes('remove')) return 'text-red-600 dark:text-red-400';
		if (action.includes('complete')) return 'text-purple-600 dark:text-purple-400';
		return 'text-neutral-600 dark:text-neutral-400';
	};

	const formatTimestamp = (timestamp: string): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
		});
	};

	const formatAction = (action: string): string => {
		return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
	};

	const resourceTypes = [
		{ value: 'all', label: 'All Activities' },
		{ value: 'user', label: 'Users' },
		{ value: 'project', label: 'Projects' },
		{ value: 'task', label: 'Tasks' },
		{ value: 'department', label: 'Departments' },
		{ value: 'file', label: 'Files' },
		{ value: 'comment', label: 'Comments' },
		{ value: 'invoice', label: 'Invoices' },
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Activity Feed
					</h2>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
						Recent activities in your company
					</p>
				</div>

				{/* Filters */}
				<div className="flex items-center gap-2">
					<select
						value={filter}
						onChange={(e) => {
							setFilter(e.target.value);
							setOffset(0);
						}}
						className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						{resourceTypes.map((type) => (
							<option key={type.value} value={type.value}>
								{type.label}
							</option>
						))}
					</select>
					<button
						onClick={() => loadActivities(true)}
						disabled={loading}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Refresh
					</button>
				</div>
			</div>

			{/* Activity Timeline */}
			{activities.length === 0 ? (
				<div className="text-center p-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
					<p className="text-neutral-600 dark:text-neutral-400">No activities found</p>
				</div>
			) : (
				<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
					{activities.map((activity, index) => (
						<div
							key={activity._id}
							className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
						>
							<div className="flex items-start gap-4">
								{/* Icon/Avatar */}
								<div className="flex-shrink-0">
									{activity.userId?.avatar ? (
										<img
											src={activity.userId.avatar}
											alt={activity.userId.name}
											className="w-10 h-10 rounded-full"
										/>
									) : (
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
											{activity.userId?.name?.charAt(0).toUpperCase() || '?'}
										</div>
									)}
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<p className="text-sm text-neutral-900 dark:text-neutral-100">
												<span className="font-semibold">
													{activity.userId?.name || 'Unknown User'}
												</span>
												{' '}
												<span className={getActivityColor(activity.action)}>
													{formatAction(activity.action)}
												</span>
												{' '}
												<span className="text-neutral-600 dark:text-neutral-400">
													{activity.resourceType}
												</span>
											</p>
											{activity.details && (
												<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
													{activity.details}
												</p>
											)}
											{activity.metadata && Object.keys(activity.metadata).length > 0 && (
												<div className="mt-2 flex flex-wrap gap-2">
													{Object.entries(activity.metadata).map(([key, value]) => (
														<span
															key={key}
															className="inline-flex items-center px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded"
														>
															<span className="font-medium">{key}:</span>
															<span className="ml-1">{String(value)}</span>
														</span>
													))}
												</div>
											)}
										</div>
										<div className="flex items-center gap-2 flex-shrink-0">
											<span className="text-2xl">{getActivityIcon(activity.resourceType)}</span>
											<span className="text-xs text-neutral-500 dark:text-neutral-400">
												{formatTimestamp(activity.timestamp)}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Timeline Connector */}
							{index < activities.length - 1 && (
								<div className="ml-5 mt-4 mb-0 h-4 border-l-2 border-neutral-200 dark:border-neutral-700"></div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Load More Button */}
			{hasMore && activities.length > 0 && (
				<div className="flex justify-center">
					<button
						onClick={() => loadActivities(false)}
						disabled={loadingMore}
						className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-neutral-200 dark:border-neutral-700"
					>
						{loadingMore ? (
							<span className="flex items-center gap-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
								Loading...
							</span>
						) : (
							'Load More Activities'
						)}
					</button>
				</div>
			)}

			{/* Activity Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Total Activities</p>
					<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
						{activities.length}
					</p>
				</div>
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Active Users</p>
					<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
						{new Set(activities.map(a => a.userId?._id)).size}
					</p>
				</div>
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Today</p>
					<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
						{activities.filter(a => {
							const date = new Date(a.timestamp);
							const today = new Date();
							return date.toDateString() === today.toDateString();
						}).length}
					</p>
				</div>
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">This Week</p>
					<p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
						{activities.filter(a => {
							const date = new Date(a.timestamp);
							const weekAgo = new Date();
							weekAgo.setDate(weekAgo.getDate() - 7);
							return date >= weekAgo;
						}).length}
					</p>
				</div>
			</div>
		</div>
	);
}
