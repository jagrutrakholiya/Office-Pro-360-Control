'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import DashboardLayout from '../../components/DashboardLayout';
import {
	TaskStatsWidget,
	ProjectStatsWidget,
	RecentActivityWidget,
	QuickActionsWidget,
	AIInsightsWidget,
	UpcomingDeadlinesWidget
} from '../../components/widgets';
import api from '../../lib/api';

interface Widget {
	id: string;
	type: string;
	title: string;
	position: { x: number; y: number };
	size: { width: number; height: number };
	config: any;
	isVisible: boolean;
}

interface DashboardData {
	_id: string;
	name: string;
	isDefault: boolean;
	widgets: Widget[];
	theme: string;
}

export default function UserDashboardPage() {
	const router = useRouter();
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);

	useEffect(() => {
		loadDashboard();
	}, []);

	const loadDashboard = async () => {
		try {
			setLoading(true);
			const response = await api.get('/dashboard/layout');
			setDashboard(response.data.data);
			setError(null);
		} catch (err: any) {
			console.error('Failed to load dashboard:', err);
			setError(err.response?.data?.error || 'Failed to load dashboard');
		} finally {
			setLoading(false);
		}
	};

	const handleLayoutChange = async (updatedWidgets: Widget[]) => {
		if (!dashboard) return;

		try {
			await api.put(`/dashboard/layouts/${dashboard._id}/widgets/positions`, {
				widgets: updatedWidgets
			});
			setDashboard({ ...dashboard, widgets: updatedWidgets });
		} catch (err: any) {
			console.error('Failed to update layout:', err);
			alert('Failed to save layout changes');
		}
	};

	const handleWidgetRemove = async (widgetId: string) => {
		if (!dashboard) return;
		if (!confirm('Are you sure you want to remove this widget?')) return;

		try {
			await api.delete(`/dashboard/layouts/${dashboard._id}/widgets/${widgetId}`);
			setDashboard({
				...dashboard,
				widgets: dashboard.widgets.filter(w => w.id !== widgetId)
			});
		} catch (err: any) {
			console.error('Failed to remove widget:', err);
			alert('Failed to remove widget');
		}
	};

	const handleWidgetConfig = (widgetId: string, config: any) => {
		// Open config modal (to be implemented)
		console.log('Configure widget:', widgetId, config);
	};

	const renderWidget = (widget: Widget) => {
		const widgetProps = {
			widgetId: widget.id,
			config: widget.config
		};

		switch (widget.type) {
			case 'taskStats':
				return <TaskStatsWidget {...widgetProps} />;
			case 'projectStats':
				return <ProjectStatsWidget {...widgetProps} />;
			case 'recentActivity':
				return <RecentActivityWidget {...widgetProps} />;
			case 'quickActions':
				return <QuickActionsWidget {...widgetProps} />;
			case 'aiInsights':
				return <AIInsightsWidget {...widgetProps} />;
			case 'upcomingDeadlines':
				return <UpcomingDeadlinesWidget {...widgetProps} />;
			default:
				return (
					<div className="text-center text-neutral-400 py-8">
						Widget type "{widget.type}" not implemented yet
					</div>
				);
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<div className="text-slate-600 font-medium">Loading dashboard...</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center">
						<svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h2>
						<p className="text-slate-600 mb-4">{error}</p>
						<button
							onClick={loadDashboard}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Retry
						</button>
					</div>
				</div>
			</Layout>
		);
	}

	if (!dashboard) {
		return (
			<Layout>
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center">
						<svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
						</svg>
						<h2 className="text-xl font-semibold text-slate-900 mb-2">No Dashboard Found</h2>
						<p className="text-slate-600">Your dashboard layout could not be found.</p>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			{/* Header */}
			<div className="section-header">
				<div className="section-actions">
					<div>
						<h1 className="section-title">My Dashboard</h1>
						<p className="section-subtitle">
							{dashboard.name} {dashboard.isDefault && '(Default)'}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setIsEditMode(!isEditMode)}
							className={`px-4 py-2 rounded-lg transition-colors ${
								isEditMode
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600'
							}`}
						>
							{isEditMode ? (
								<>
									<svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									Done Editing
								</>
							) : (
								<>
									<svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Edit Layout
								</>
							)}
						</button>
						<button
							onClick={loadDashboard}
							className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
						>
							<svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Refresh
						</button>
					</div>
				</div>
			</div>

			{/* Dashboard Layout */}
			<div className="mb-8">
				<DashboardLayout
					widgets={dashboard.widgets}
					onLayoutChange={handleLayoutChange}
					onWidgetRemove={handleWidgetRemove}
					onWidgetConfig={handleWidgetConfig}
					isEditable={isEditMode}
				>
					{renderWidget}
				</DashboardLayout>
			</div>

			{/* Edit Mode Info */}
			{isEditMode && (
				<div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
					<p className="text-sm font-medium">
						✏️ Edit Mode Active - Click widget buttons to configure or remove
					</p>
				</div>
			)}
		</Layout>
	);
}
