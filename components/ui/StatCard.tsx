import React from 'react'

type Accent = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface StatCardDelta {
  value: React.ReactNode
  trend: 'up' | 'down'
}

export interface StatCardProps {
  label: React.ReactNode
  value: React.ReactNode
  delta?: StatCardDelta
  icon?: React.ReactNode
  description?: React.ReactNode
  accent?: Accent
  className?: string
}

const accentStripe: Record<Accent, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  neutral: 'bg-slate-400 dark:bg-slate-600',
}

const accentIcon: Record<Accent, string> = {
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  success: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
}

export default function StatCard({
  label,
  value,
  delta,
  icon,
  description,
  accent = 'primary',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl',
        'bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-800',
        'p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute left-0 top-0 h-full w-1',
          accentStripe[accent],
        ].join(' ')}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>

        {icon && (
          <div
            className={[
              'shrink-0 flex h-10 w-10 items-center justify-center rounded-lg',
              accentIcon[accent],
            ].join(' ')}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      {(delta || description) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={[
                'inline-flex items-center gap-0.5 font-medium tabular-nums',
                delta.trend === 'up'
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400',
              ].join(' ')}
            >
              <span aria-hidden="true">
                {delta.trend === 'up' ? '↑' : '↓'}
              </span>
              {delta.value}
            </span>
          )}
          {description && (
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
