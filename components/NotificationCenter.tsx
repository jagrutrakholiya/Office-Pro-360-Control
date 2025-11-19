'use client';

import { useState, useEffect } from 'react';

interface Notification {
	_id: string;
	type: string;
	message: string;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	isRead: boolean;
	isGrouped: boolean;
	groupKey?: string;
	groupCount?: number;
	fromUser?: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	};
	task?: {
		_id: string;
		title: string;
	};
	createdAt: string;
}

interface GroupedNotifications {
	grouped: Notification[];
	ungrouped: Notification[];
}

export default function NotificationCenter() {
	const [notifications, setNotifications] = useState<GroupedNotifications | null>(null);
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
	const [groupDetails, setGroupDetails] = useState<Record<string, Notification[]>>({});
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		loadNotifications();
		const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
		return () => clearInterval(interval);
	}, []);

	const loadNotifications = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:3000/api/notifications/grouped', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to load notifications');

			const data = await response.json();
			setNotifications({
				grouped: data.grouped,
				ungrouped: data.ungrouped,
			});

			// Calculate unread count
			const unread = [...data.grouped, ...data.ungrouped].filter((n: Notification) => !n.isRead).length;
			setUnreadCount(unread);
		} catch (error) {
			console.error('Error loading notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const expandGroup = async (groupKey: string) => {
		if (expandedGroups.has(groupKey)) {
			const newExpanded = new Set(expandedGroups);
			newExpanded.delete(groupKey);
			setExpandedGroups(newExpanded);
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/notifications/groups/${groupKey}`,
				{
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to load group details');

			const data = await response.json();
			setGroupDetails({
				...groupDetails,
				[groupKey]: data.notifications,
			});

			const newExpanded = new Set(expandedGroups);
			newExpanded.add(groupKey);
			setExpandedGroups(newExpanded);
		} catch (error) {
			console.error('Error expanding group:', error);
		}
	};

	const markAsRead = async (id: string) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/notifications/${id}/read`,
				{
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to mark as read');

			loadNotifications();
		} catch (error) {
			console.error('Error marking as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const token = localStorage.getItem('token');
			
			if (!notifications) return;
			
			const allIds = [
				...notifications.grouped.map(n => n._id),
				...notifications.ungrouped.map(n => n._id),
			];

			const response = await fetch(
				'http://localhost:3000/api/notifications/mark-multiple-read',
				{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						notificationIds: allIds,
					}),
				}
			);

			if (!response.ok) throw new Error('Failed to mark all as read');

			loadNotifications();
		} catch (error) {
			console.error('Error marking all as read:', error);
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
		} catch (error) {
			console.error('Error archiving notification:', error);
		}
	};

	const clearAllRead = async () => {
		if (!confirm('Delete all read notifications?')) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				'http://localhost:3000/api/notifications/clear-all',
				{
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to clear notifications');

			loadNotifications();
		} catch (error) {
			console.error('Error clearing notifications:', error);
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
		} catch (error) {
			console.error('Error archiving all read:', error);
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
			urgent: 'border-l-red-500',
			high: 'border-l-orange-500',
			normal: 'border-l-blue-500',
			low: 'border-l-gray-400',
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

	const renderNotification = (notification: Notification, isInGroup = false) => (
		<div
			key={notification._id}
			className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
				isInGroup ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''
			} ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
		>
			<div className="text-2xl">{getTypeIcon(notification.type)}</div>
			
			<div className="flex-1 min-w-0">
				<p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-neutral-900 dark:text-neutral-100`}>
					{notification.message}
				</p>
				<div className="flex items-center gap-2 mt-1 text-xs text-neutral-600 dark:text-neutral-400">
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
			
			<div className="flex items-center gap-1">
				{notification.priority === 'urgent' && (
					<span className="w-2 h-2 bg-red-500 rounded-full" title="Urgent"></span>
				)}
				{notification.priority === 'high' && (
					<span className="w-2 h-2 bg-orange-500 rounded-full" title="High"></span>
				)}
				{!notification.isRead && (
					<button
						onClick={() => markAsRead(notification._id)}
						className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
						title="Mark as read"
					>
						✓
					</button>
				)}
				<button
					onClick={() => archiveNotification(notification._id)}
					className="p-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
					title="Archive"
				>
					📥
				</button>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!notifications) {
		return (
			<div className="text-center p-12">
				<p className="text-neutral-600 dark:text-neutral-400">Failed to load notifications</p>
			</div>
		);
	}

	const hasNotifications = notifications.grouped.length > 0 || notifications.ungrouped.length > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Notifications
					</h2>
					{unreadCount > 0 && (
						<span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
							{unreadCount}
						</span>
					)}
				</div>
				<div className="flex gap-2">
					{unreadCount > 0 && (
						<button
							onClick={markAllAsRead}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Mark All Read
						</button>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			{hasNotifications && (
				<div className="flex gap-2">
					<button
						onClick={archiveAllRead}
						className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
					>
						📥 Archive All Read
					</button>
					<button
						onClick={clearAllRead}
						className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
					>
						🗑️ Clear All Read
					</button>
				</div>
			)}

			{/* Notifications List */}
			{!hasNotifications ? (
				<div className="text-center p-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
					<div className="text-6xl mb-4">🔔</div>
					<p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
						All caught up!
					</p>
					<p className="text-neutral-600 dark:text-neutral-400">
						You have no new notifications
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{/* Grouped Notifications */}
					{notifications.grouped.map((notification) => (
						<div
							key={notification._id}
							className={`bg-white dark:bg-neutral-800 rounded-xl border-l-4 ${getPriorityColor(notification.priority)} border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-shadow hover:shadow-md`}
						>
							<div className="p-4">
								{/* Group Header */}
								<div className="flex items-start gap-3">
									<div className="text-2xl">{getTypeIcon(notification.type)}</div>
									
									<div className="flex-1 min-w-0">
										<p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-neutral-900 dark:text-neutral-100`}>
											{notification.message}
										</p>
										<div className="flex items-center gap-2 mt-1 text-xs text-neutral-600 dark:text-neutral-400">
											{notification.fromUser && (
												<span>
													{notification.fromUser.firstName} {notification.fromUser.lastName}
												</span>
											)}
											<span>•</span>
											<span>{formatRelativeTime(notification.createdAt)}</span>
											<span>•</span>
											<button
												onClick={() => expandGroup(notification.groupKey!)}
												className="text-blue-600 hover:underline font-medium"
											>
												{expandedGroups.has(notification.groupKey!)
													? `Hide ${notification.groupCount! - 1} similar`
													: `Show ${notification.groupCount! - 1} similar`}
											</button>
										</div>
									</div>
									
									<div className="flex items-center gap-1">
										<span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
											{notification.groupCount} grouped
										</span>
										{notification.priority === 'urgent' && (
											<span className="w-2 h-2 bg-red-500 rounded-full" title="Urgent"></span>
										)}
										{notification.priority === 'high' && (
											<span className="w-2 h-2 bg-orange-500 rounded-full" title="High"></span>
										)}
										{!notification.isRead && (
											<button
												onClick={() => markAsRead(notification._id)}
												className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
												title="Mark as read"
											>
												✓
											</button>
										)}
										<button
											onClick={() => archiveNotification(notification._id)}
											className="p-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
											title="Archive"
										>
											📥
										</button>
									</div>
								</div>
							</div>

							{/* Expanded Group Items */}
							{expandedGroups.has(notification.groupKey!) && groupDetails[notification.groupKey!] && (
								<div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-2 bg-neutral-50/50 dark:bg-neutral-900/20">
									{groupDetails[notification.groupKey!].map((item) => renderNotification(item, true))}
								</div>
							)}
						</div>
					))}

					{/* Ungrouped Notifications */}
					{notifications.ungrouped.map((notification) => (
						<div
							key={notification._id}
							className={`bg-white dark:bg-neutral-800 rounded-xl border-l-4 ${getPriorityColor(notification.priority)} border border-neutral-200 dark:border-neutral-700 p-4 transition-shadow hover:shadow-md`}
						>
							{renderNotification(notification)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
