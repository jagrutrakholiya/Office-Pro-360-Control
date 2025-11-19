'use client';

import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import GlobalSearch from './GlobalSearch';
import CommandPalette from './CommandPalette';
import KeyboardShortcuts from './KeyboardShortcuts';

interface Widget {
	id: string;
	type: string;
	title: string;
	position: { x: number; y: number };
	size: { width: number; height: number };
	config: any;
	isVisible: boolean;
}

interface DashboardLayoutProps {
	widgets: Widget[];
	onLayoutChange?: (widgets: Widget[]) => void;
	onWidgetRemove?: (widgetId: string) => void;
	onWidgetConfig?: (widgetId: string, config: any) => void;
	isEditable?: boolean;
	children?: (widget: Widget) => React.ReactNode;
}

export default function DashboardLayout({
	widgets,
	onWidgetRemove,
	onWidgetConfig,
	isEditable = false,
	children
}: DashboardLayoutProps) {
	const [, setIsDragging] = useState(false);

	return (
		<>
			{/* Global Search & Command Palette */}
			<GlobalSearch />
			<CommandPalette />
			<KeyboardShortcuts />
			
			{/* Breadcrumbs */}
			<Breadcrumbs />
			
			<div className="dashboard-layout grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{widgets.filter(w => w.isVisible).map(widget => (
				<div
					key={widget.id}
					className={`widget-container col-span-${widget.size.width} row-span-${widget.size.height}`}
					style={{
						gridColumn: `span ${Math.min(widget.size.width, 4)}`,
						gridRow: `span ${widget.size.height}`
					}}
				>
					<div className="widget bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 h-full overflow-hidden">
						{/* Widget Header */}
						<div className="widget-header flex items-center justify-between mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
							<div className="flex items-center gap-2">
								{isEditable && (
									<div className="widget-drag-handle cursor-move p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
										<svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
										</svg>
									</div>
								)}
								<h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
									{widget.title}
								</h3>
							</div>
							{isEditable && (
								<div className="flex items-center gap-1">
									{onWidgetConfig && (
										<button
											onClick={() => onWidgetConfig(widget.id, widget.config)}
											className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
											title="Configure widget"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</button>
									)}
									{onWidgetRemove && (
										<button
											onClick={() => onWidgetRemove(widget.id)}
											className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
											title="Remove widget"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>
							)}
						</div>

						{/* Widget Content */}
						<div className="widget-content h-[calc(100%-60px)] overflow-auto">
							{children ? children(widget) : (
								<div className="text-center text-neutral-400 py-8">
									Widget: {widget.type}
								</div>
							)}
						</div>
					</div>
				</div>
			))}
			</div>
		</>
	);
}
