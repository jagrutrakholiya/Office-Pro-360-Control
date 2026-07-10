'use client'

import React from 'react'

type EmptyStateSize = 'compact' | 'default' | 'large'

/** Legacy action shape ({ label, onClick }) is still supported alongside a raw ReactNode. */
type LegacyAction = { label: string; onClick: () => void }

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode | LegacyAction
  size?: EmptyStateSize
  className?: string
}

const sizeStyles: Record<
  EmptyStateSize,
  { wrap: string; icon: string; iconInner: string; title: string; desc: string }
> = {
  compact: {
    wrap: 'py-8 px-4',
    icon: 'h-11 w-11 mb-3',
    iconInner: 'w-5 h-5',
    title: 'text-sm',
    desc: 'text-xs',
  },
  default: {
    wrap: 'py-12 px-6',
    icon: 'h-14 w-14 mb-4',
    iconInner: 'w-6 h-6',
    title: 'text-lg',
    desc: 'text-sm',
  },
  large: {
    wrap: 'py-20 px-8',
    icon: 'h-16 w-16 mb-5',
    iconInner: 'w-7 h-7',
    title: 'text-xl',
    desc: 'text-base',
  },
}

function isLegacyAction(action: unknown): action is LegacyAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    'onClick' in action &&
    typeof (action as LegacyAction).onClick === 'function'
  )
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'default',
  className = '',
}: EmptyStateProps) {
  const s = sizeStyles[size]

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-800 rounded-xl',
        s.wrap,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <div
          className={[
            'inline-flex items-center justify-center rounded-full',
            'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500',
            s.icon,
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className={[
          'font-semibold text-slate-900 dark:text-slate-100',
          s.title,
        ].join(' ')}
      >
        {title}
      </h3>
      {description && (
        <p
          className={[
            'mt-1 max-w-sm text-slate-500 dark:text-slate-400',
            s.desc,
          ].join(' ')}
        >
          {description}
        </p>
      )}
      {action != null &&
        (isLegacyAction(action) ? (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white
              px-4 py-2 text-sm font-medium text-white dark:text-slate-900
              hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60
              focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            {action.label}
          </button>
        ) : (
          <div className="mt-5">{action as React.ReactNode}</div>
        ))}
    </div>
  )
}
