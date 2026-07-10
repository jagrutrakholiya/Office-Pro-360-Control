'use client'

import React from 'react'

export interface Breadcrumb {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  className?: string
}

export default function PageHeader({
  title,
  description,
  actions,
  icon,
  breadcrumbs,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={['mb-6', className].filter(Boolean).join(' ')}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <li key={i} className="flex items-center gap-1.5">
                  {crumb.href && !isLast ? (
                    <a
                      href={crumb.href}
                      className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={
                        isLast
                          ? 'text-slate-700 dark:text-slate-300 font-medium'
                          : ''
                      }
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="text-slate-300 dark:text-slate-600"
                    >
                      /
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div
              className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl
                bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
