'use client';

import { useState, useEffect } from 'react';

interface Notification {
	_id: string;
	type: string;
	message: string;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	isRead: boolean;
	isArchived: boolean;
	fromUser?: {
		_id: string;
		firstName: string;
		lastName: string;
	};
	task?: {
		_id: string;
		title: string;
	};
	createdAt: string;
}

interface Stats {
	total: number;
	unread: number;
	archived: number;
}

export default function NotificationHistory() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	
	// Filters
	const [filters, setFilters] = useState({
		type: 'all',
		priority: 'all',
		read: 'all',
		archived: false,
		dateFrom: '',
		dateTo: '',
		search: '',
	});

	useEffect(() => {
		loadStats();
	}, []);

	useEffect(() => {
		loadNotifications();
	}, [filters]);

	const loadStats = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:3000/api/notifications/stats', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to load stats');

			const data = await response.json();
			setStats(data.stats);
		} catch (error) {
			console.error('Error loading stats:', error);
		}
	};

	const loadNotifications = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			
			const params = new URLSearchParams();
			if (filters.type !== 'all') params.append('type', filters.type);
			if (filters.priority !== 'all') params.append('priority', filters.priority);
			if (filters.read !== 'all') params.append('read', filters.read);
			if (filters.archived) params.append('archived', 'true');
			if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
			if (filters.dateTo) params.append('dateTo', filters.dateTo);
			if (filters.search) params.append('search', filters.search);

			const response = await fetch(
				`http://localhost:3000/api/notifications/history?${params.toString()}`,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to load notifications');

			const data = await response.json();
			setNotifications(data.notifications);
		} catch (error) {
			console.error('Error loading notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const archiveNotification = async (id: string) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/notifications/${id}/archive`,
				{
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to archive notification');

			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error archiving notification:', error);
		}
	};

	const unarchiveNotification = async (id: string) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/notifications/${id}/unarchive`,
				{
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to unarchive notification');

			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error unarchiving notification:', error);
		}
	};

	const deleteNotification = async (id: string) => {
		if (!confirm('Are you sure you want to delete this notification?')) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/notifications/${id}`,
				{
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to delete notification');

			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error deleting notification:', error);
		}
	};

	const bulkArchive = async () => {
		if (selectedIds.size === 0) return;

		try {
			const token = localStorage.getItem('token');
			
			await Promise.all(
				Array.from(selectedIds).map((id) =>
					fetch(`http://localhost:3000/api/notifications/${id}/archive`, {
						method: 'PATCH',
						headers: {
							'Authorization': `Bearer ${token}`,
						},
					})
				)
			);

			setSelectedIds(new Set());
			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error bulk archiving:', error);
		}
	};

	const bulkDelete = async () => {
		if (selectedIds.size === 0) return;
		if (!confirm(`Delete ${selectedIds.size} selected notifications?`)) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				'http://localhost:3000/api/notifications/delete-multiple',
				{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						notificationIds: Array.from(selectedIds),
					}),
				}
			);

			if (!response.ok) throw new Error('Failed to delete notifications');

			setSelectedIds(new Set());
			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error bulk deleting:', error);
		}
	};

	const archiveAllRead = async () => {
		if (!confirm('Archive all read notifications?')) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				'http://localhost:3000/api/notifications/archive-all-read',
				{
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to archive all read');

			loadNotifications();
			loadStats();
		} catch (error) {
			console.error('Error archiving all read:', error);
		}
	};

	const toggleSelection = (id: string) => {
		const newSelection = new Set(selectedIds);
		if (newSelection.has(id)) {
			newSelection.delete(id);
		} else {
			newSelection.add(id);
		}
		setSelectedIds(newSelection);
	};

	const toggleSelectAll = () => {
		if (selectedIds.size === notifications.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(notifications.map((n) => n._id)));
		}
	};

	const getTypeIcon = (type: string) => {
		const icons: Record<string, string> = {
			task: '✅',
			mention: '👤',
			deadline: '📅',
			milestone: '🏆',
			comment: '💬',
			approval: '✓',
			reminder: '⏰',
			system: '⚙️',
		};
		return icons[type] || '🔔';
	};

	const getPriorityColor = (priority: string) => {
		const colors: Record<string, string> = {
			urgent: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
			high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
			normal: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
			low: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
		};
		return colors[priority] || colors.normal;
	};

	const formatRelativeTime = (date: string) => {
		const now = new Date();
		const then = new Date(date);
		const diffMs = now.getTime() - then.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return then.toLocaleDateString();
	};

	return (
		<div className="space-y-6">
			{/* Header with Stats */}
			<div>
				<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
					Notification History
				</h2>
				{stats && (
					<div className="grid grid-cols-3 gap-4">
						<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
							<div className="text-sm text-neutral-600 dark:text-neutral-400">Total</div>
							<div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</div>
						</div>
						<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
							<div className="text-sm text-neutral-600 dark:text-neutral-400">Unread</div>
							<div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
						</div>
						<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
							<div className="text-sm text-neutral-600 dark:text-neutral-400">Archived</div>
							<div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">{stats.archived}</div>
						</div>
					</div>
				)}
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					🔍 Filters
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Type
						</label>
						<select
							value={filters.type}
							onChange={(e) => setFilters({ ...filters, type: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Types</option>
							<option value="task">Task</option>
							<option value="mention">Mention</option>
							<option value="deadline">Deadline</option>
							<option value="milestone">Milestone</option>
							<option value="comment">Comment</option>
							<option value="approval">Approval</option>
							<option value="reminder">Reminder</option>
							<option value="system">System</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Priority
						</label>
						<select
							value={filters.priority}
							onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Priorities</option>
							<option value="urgent">Urgent</option>
							<option value="high">High</option>
							<option value="normal">Normal</option>
							<option value="low">Low</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Status
						</label>
						<select
							value={filters.read}
							onChange={(e) => setFilters({ ...filters, read: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Status</option>
							<option value="true">Read</option>
							<option value="false">Unread</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Archive
						</label>
						<label className="flex items-center p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer">
							<input
								type="checkbox"
								checked={filters.archived}
								onChange={(e) => setFilters({ ...filters, archived: e.target.checked })}
								className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
							/>
							<span className="ml-2 text-neutral-900 dark:text-neutral-100">Show Archived</span>
						</label>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Date From
						</label>
						<input
							type="date"
							value={filters.dateFrom}
							onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Date To
						</label>
						<input
							type="date"
							value={filters.dateTo}
							onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
							Search
						</label>
						<input
							type="text"
							placeholder="Search notifications..."
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
							className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
			</div>

			{/* Bulk Actions */}
			{selectedIds.size > 0 && (
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
					<span className="text-neutral-900 dark:text-neutral-100 font-medium">
						{selectedIds.size} notification{selectedIds.size > 1 ? 's' : ''} selected
					</span>
					<div className="flex gap-2">
						{!filters.archived && (
							<button
								onClick={bulkArchive}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Archive Selected
							</button>
						)}
						<button
							onClick={bulkDelete}
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
						>
							Delete Selected
						</button>
						<button
							onClick={() => setSelectedIds(new Set())}
							className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="flex gap-2">
				<button
					onClick={toggleSelectAll}
					className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
				>
					{selectedIds.size === notifications.length ? 'Deselect All' : 'Select All'}
				</button>
				{!filters.archived && (
					<button
						onClick={archiveAllRead}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Archive All Read
					</button>
				)}
			</div>

			{/* Notification List */}
			<div className="space-y-3">
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : notifications.length === 0 ? (
					<div className="text-center p-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
						<div className="text-6xl mb-4">🔔</div>
						<p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
							No notifications found
						</p>
						<p className="text-neutral-600 dark:text-neutral-400">
							Try adjusting your filters
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<div
							key={notification._id}
							className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition-shadow ${
								!notification.isRead ? 'border-l-4 border-l-blue-600' : ''
							}`}
						>
							<div className="flex items-start gap-4">
								<input
									type="checkbox"
									checked={selectedIds.has(notification._id)}
									onChange={() => toggleSelection(notification._id)}
									className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
								/>
								
								<div className="text-3xl">{getTypeIcon(notification.type)}</div>
								
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<p className="text-neutral-900 dark:text-neutral-100 mb-1">
												{notification.message}
											</p>
											<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
												{notification.fromUser && (
													<span>
														{notification.fromUser.firstName} {notification.fromUser.lastName}
													</span>
												)}
												<span>•</span>
												<span>{formatRelativeTime(notification.createdAt)}</span>
												{notification.task && (
													<>
														<span>•</span>
														<span className="truncate">{notification.task.title}</span>
													</>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
												{notification.priority}
											</span>
											<span className={`px-2 py-1 rounded text-xs font-medium ${
												notification.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
												notification.type === 'mention' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' :
												'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
											}`}>
												{notification.type}
											</span>
										</div>
									</div>
								</div>
								
								<div className="flex gap-2">
									{notification.isArchived ? (
										<button
											onClick={() => unarchiveNotification(notification._id)}
											className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
											title="Unarchive"
										>
											📤
										</button>
									) : (
										<button
											onClick={() => archiveNotification(notification._id)}
											className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
											title="Archive"
										>
											📥
										</button>
									)}
									<button
										onClick={() => deleteNotification(notification._id)}
										className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
										title="Delete"
									>
										🗑️
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
