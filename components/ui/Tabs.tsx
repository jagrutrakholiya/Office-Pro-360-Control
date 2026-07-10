'use client'

import React from 'react'

export interface TabItem {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeKey: string
  onChange: (key: string) => void
  variant?: 'underline' | 'pills'
  className?: string
}

export default function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps) {
  const isPills = variant === 'pills'

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={[
        'flex items-center gap-1 overflow-x-auto',
        isPills
          ? 'p-1 rounded-xl bg-slate-100 dark:bg-slate-800'
          : 'border-b border-slate-200 dark:border-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        const pillClasses = active
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        const underlineClasses = active
          ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={[
              'inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              isPills
                ? `rounded-lg px-3 py-1.5 ${pillClasses}`
                : `-mb-px border-b-2 px-3 py-2.5 ${underlineClasses}`,
            ].join(' ')}
          >
            {tab.icon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge != null && (
              <span
                className={[
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums',
                  active
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                ].join(' ')}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
