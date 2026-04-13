'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import NotificationCenter from '../../components/NotificationCenter';
import NotificationHistory from '../../components/NotificationHistory';
import NotificationPreferences from '../../components/NotificationPreferences';

export default function NotificationsPage() {
	const [activeTab, setActiveTab] = useState<'center' | 'history' | 'settings'>('center');

	return (
		<Layout>
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h2>
				<p className="text-slate-600">Manage notification center, history, and preferences</p>
			</div>

			{/* Tab Navigation */}
			<div className="mb-6 bg-white rounded-xl border border-slate-200 p-1.5 inline-flex gap-1.5">
				<button
					onClick={() => setActiveTab('center')}
					className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
						activeTab === 'center'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:bg-slate-100'
					}`}
				>
					Notification Center
				</button>
				<button
					onClick={() => setActiveTab('history')}
					className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
						activeTab === 'history'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:bg-slate-100'
					}`}
				>
					History
				</button>
				<button
					onClick={() => setActiveTab('settings')}
					className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
						activeTab === 'settings'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:bg-slate-100'
					}`}
				>
					Settings
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === 'center' && <NotificationCenter />}
			{activeTab === 'history' && <NotificationHistory />}
			{activeTab === 'settings' && <NotificationPreferences />}
		</Layout>
	);
}
