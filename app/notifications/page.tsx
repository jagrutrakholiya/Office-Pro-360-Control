'use client';

import { useState } from 'react';
import NotificationCenter from '../../components/NotificationCenter';
import NotificationHistory from '../../components/NotificationHistory';
import NotificationPreferences from '../../components/NotificationPreferences';

export default function NotificationsPage() {
	const [activeTab, setActiveTab] = useState<'center' | 'history' | 'settings'>('center');

	return (
		<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Tab Navigation */}
				<div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-2 inline-flex gap-2">
					<button
						onClick={() => setActiveTab('center')}
						className={`px-6 py-2 rounded-lg font-medium transition-colors ${
							activeTab === 'center'
								? 'bg-blue-600 text-white'
								: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
						}`}
					>
						🔔 Notification Center
					</button>
					<button
						onClick={() => setActiveTab('history')}
						className={`px-6 py-2 rounded-lg font-medium transition-colors ${
							activeTab === 'history'
								? 'bg-blue-600 text-white'
								: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
						}`}
					>
						📜 History
					</button>
					<button
						onClick={() => setActiveTab('settings')}
						className={`px-6 py-2 rounded-lg font-medium transition-colors ${
							activeTab === 'settings'
								? 'bg-blue-600 text-white'
								: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
						}`}
					>
						⚙️ Settings
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === 'center' && <NotificationCenter />}
				{activeTab === 'history' && <NotificationHistory />}
				{activeTab === 'settings' && <NotificationPreferences />}
			</div>
		</div>
	);
}
