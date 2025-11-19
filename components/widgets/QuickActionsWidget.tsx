'use client';

import { useRouter } from 'next/navigation';

interface QuickActionsWidgetProps {
	widgetId: string;
	config?: any;
}

export default function QuickActionsWidget({ widgetId, config }: QuickActionsWidgetProps) {
	const router = useRouter();

	const actions = [
		{
			label: 'Create Task',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
				</svg>
			),
			color: 'bg-blue-600 hover:bg-blue-700',
			onClick: () => router.push('/tasks/new')
		},
		{
			label: 'Create Project',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
				</svg>
			),
			color: 'bg-purple-600 hover:bg-purple-700',
			onClick: () => router.push('/projects/new')
		},
		{
			label: 'View Tasks',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
				</svg>
			),
			color: 'bg-green-600 hover:bg-green-700',
			onClick: () => router.push('/tasks')
		},
		{
			label: 'View Projects',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
				</svg>
			),
			color: 'bg-indigo-600 hover:bg-indigo-700',
			onClick: () => router.push('/projects')
		},
		{
			label: 'Team Members',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			),
			color: 'bg-yellow-600 hover:bg-yellow-700',
			onClick: () => router.push('/team')
		},
		{
			label: 'Reports',
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			),
			color: 'bg-orange-600 hover:bg-orange-700',
			onClick: () => router.push('/reports')
		}
	];

	return (
		<div className="h-full">
			<div className="grid grid-cols-2 gap-3 h-full">
				{actions.map((action, index) => (
					<button
						key={index}
						onClick={action.onClick}
						className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md`}
					>
						{action.icon}
						<span className="text-sm font-medium">{action.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}
