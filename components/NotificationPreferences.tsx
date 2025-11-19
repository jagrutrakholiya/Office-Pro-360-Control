'use client';

import { useState, useEffect } from 'react';

interface NotificationPreferences {
	// Channels
	email: boolean;
	push: boolean;
	inApp: boolean;
	// Email digest
	emailDigest: {
		enabled: boolean;
		frequency: 'daily' | 'weekly' | 'never';
		time: string;
		dayOfWeek: number;
	};
	// Notification types
	taskAssigned: boolean;
	taskDueSoon: boolean;
	taskCompleted: boolean;
	taskCommented: boolean;
	taskMention: boolean;
	projectUpdates: boolean;
	deadlineReminders: boolean;
	milestoneReached: boolean;
	leaveRequests: boolean;
	approvalRequests: boolean;
	announcements: boolean;
	systemAlerts: boolean;
	// Priority filter
	priorityFilter: {
		low: boolean;
		normal: boolean;
		high: boolean;
		urgent: boolean;
	};
	// Quiet hours
	quietHours: {
		enabled: boolean;
		startTime: string;
		endTime: string;
	};
}

export default function NotificationPreferences() {
	const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	useEffect(() => {
		loadPreferences();
	}, []);

	const loadPreferences = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:3000/api/notifications/preferences', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to load preferences');

			const data = await response.json();
			setPreferences(data.preferences);
		} catch (error) {
			console.error('Error loading preferences:', error);
			setMessage({ type: 'error', text: 'Failed to load notification preferences' });
		} finally {
			setLoading(false);
		}
	};

	const savePreferences = async () => {
		try {
			setSaving(true);
			const token = localStorage.getItem('token');
			const response = await fetch('http://localhost:3000/api/notifications/preferences', {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(preferences),
			});

			if (!response.ok) throw new Error('Failed to save preferences');

			setMessage({ type: 'success', text: 'Preferences saved successfully!' });
			setTimeout(() => setMessage(null), 3000);
		} catch (error) {
			console.error('Error saving preferences:', error);
			setMessage({ type: 'error', text: 'Failed to save preferences' });
		} finally {
			setSaving(false);
		}
	};

	const updatePreference = (path: string, value: any) => {
		if (!preferences) return;

		const keys = path.split('.');
		const newPreferences = { ...preferences };
		let current: any = newPreferences;

		for (let i = 0; i < keys.length - 1; i++) {
			current[keys[i]] = { ...current[keys[i]] };
			current = current[keys[i]];
		}

		current[keys[keys.length - 1]] = value;
		setPreferences(newPreferences);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!preferences) {
		return (
			<div className="text-center p-12">
				<p className="text-neutral-600 dark:text-neutral-400">Failed to load preferences</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Notification Preferences
					</h2>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
						Customize how and when you receive notifications
					</p>
				</div>
				<button
					onClick={savePreferences}
					disabled={saving}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-4 rounded-lg ${
						message.type === 'success'
							? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
							: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
					}`}
				>
					{message.text}
				</div>
			)}

			{/* Notification Channels */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					📢 Notification Channels
				</h3>
				<div className="space-y-3">
					<label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
						<div>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">Email Notifications</span>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">Receive notifications via email</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.email}
							onChange={(e) => updatePreference('email', e.target.checked)}
							className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
						/>
					</label>
					<label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
						<div>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">Push Notifications</span>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">Browser push notifications</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.push}
							onChange={(e) => updatePreference('push', e.target.checked)}
							className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
						/>
					</label>
					<label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
						<div>
							<span className="font-medium text-neutral-900 dark:text-neutral-100">In-App Notifications</span>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">Show notifications in the app</p>
						</div>
						<input
							type="checkbox"
							checked={preferences.inApp}
							onChange={(e) => updatePreference('inApp', e.target.checked)}
							className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
						/>
					</label>
				</div>
			</div>

			{/* Email Digest */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					📧 Email Digest
				</h3>
				<div className="space-y-4">
					<label className="flex items-center justify-between">
						<span className="font-medium text-neutral-900 dark:text-neutral-100">Enable Email Digest</span>
						<input
							type="checkbox"
							checked={preferences.emailDigest.enabled}
							onChange={(e) => updatePreference('emailDigest.enabled', e.target.checked)}
							className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
						/>
					</label>
					{preferences.emailDigest.enabled && (
						<>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
									Frequency
								</label>
								<select
									value={preferences.emailDigest.frequency}
									onChange={(e) => updatePreference('emailDigest.frequency', e.target.value)}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
								>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="never">Never</option>
								</select>
							</div>
							{preferences.emailDigest.frequency !== 'never' && (
								<div>
									<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
										Time
									</label>
									<input
										type="time"
										value={preferences.emailDigest.time}
										onChange={(e) => updatePreference('emailDigest.time', e.target.value)}
										className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							)}
							{preferences.emailDigest.frequency === 'weekly' && (
								<div>
									<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
										Day of Week
									</label>
									<select
										value={preferences.emailDigest.dayOfWeek}
										onChange={(e) => updatePreference('emailDigest.dayOfWeek', parseInt(e.target.value))}
										className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
									>
										<option value="0">Sunday</option>
										<option value="1">Monday</option>
										<option value="2">Tuesday</option>
										<option value="3">Wednesday</option>
										<option value="4">Thursday</option>
										<option value="5">Friday</option>
										<option value="6">Saturday</option>
									</select>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{/* Notification Types */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					🔔 Notification Types
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{[
						{ key: 'taskAssigned', label: 'Task Assigned', icon: '✅' },
						{ key: 'taskDueSoon', label: 'Task Due Soon', icon: '⏰' },
						{ key: 'taskCompleted', label: 'Task Completed', icon: '🎉' },
						{ key: 'taskCommented', label: 'Task Comments', icon: '💬' },
						{ key: 'taskMention', label: 'Mentions (@)', icon: '👤' },
						{ key: 'projectUpdates', label: 'Project Updates', icon: '📁' },
						{ key: 'deadlineReminders', label: 'Deadline Reminders', icon: '📅' },
						{ key: 'milestoneReached', label: 'Milestones', icon: '🏆' },
						{ key: 'leaveRequests', label: 'Leave Requests', icon: '🌴' },
						{ key: 'approvalRequests', label: 'Approvals', icon: '✓' },
						{ key: 'announcements', label: 'Announcements', icon: '📣' },
						{ key: 'systemAlerts', label: 'System Alerts', icon: '⚠️' },
					].map((type) => (
						<label
							key={type.key}
							className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
						>
							<div className="flex items-center gap-2">
								<span className="text-xl">{type.icon}</span>
								<span className="font-medium text-neutral-900 dark:text-neutral-100">{type.label}</span>
							</div>
							<input
								type="checkbox"
								checked={preferences[type.key as keyof NotificationPreferences] as boolean}
								onChange={(e) => updatePreference(type.key, e.target.checked)}
								className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
							/>
						</label>
					))}
				</div>
			</div>

			{/* Priority Filter */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					🎯 Priority Levels
				</h3>
				<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
					Select which priority levels you want to receive
				</p>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{[
						{ key: 'urgent', label: 'Urgent', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
						{ key: 'high', label: 'High', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' },
						{ key: 'normal', label: 'Normal', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
						{ key: 'low', label: 'Low', color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300' },
					].map((priority) => (
						<label
							key={priority.key}
							className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${
								preferences.priorityFilter[priority.key as keyof typeof preferences.priorityFilter]
									? priority.color
									: 'bg-neutral-50 dark:bg-neutral-700/50 text-neutral-400'
							}`}
						>
							<input
								type="checkbox"
								checked={preferences.priorityFilter[priority.key as keyof typeof preferences.priorityFilter]}
								onChange={(e) => updatePreference(`priorityFilter.${priority.key}`, e.target.checked)}
								className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
							/>
							<span className="font-medium">{priority.label}</span>
						</label>
					))}
				</div>
			</div>

			{/* Quiet Hours */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					🌙 Quiet Hours
				</h3>
				<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
					Mute notifications during specific hours
				</p>
				<div className="space-y-4">
					<label className="flex items-center justify-between">
						<span className="font-medium text-neutral-900 dark:text-neutral-100">Enable Quiet Hours</span>
						<input
							type="checkbox"
							checked={preferences.quietHours.enabled}
							onChange={(e) => updatePreference('quietHours.enabled', e.target.checked)}
							className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
						/>
					</label>
					{preferences.quietHours.enabled && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
									Start Time
								</label>
								<input
									type="time"
									value={preferences.quietHours.startTime}
									onChange={(e) => updatePreference('quietHours.startTime', e.target.value)}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
									End Time
								</label>
								<input
									type="time"
									value={preferences.quietHours.endTime}
									onChange={(e) => updatePreference('quietHours.endTime', e.target.value)}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Save Button (Bottom) */}
			<div className="flex justify-end">
				<button
					onClick={savePreferences}
					disabled={saving}
					className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
				>
					{saving ? 'Saving...' : 'Save All Changes'}
				</button>
			</div>
		</div>
	);
}
