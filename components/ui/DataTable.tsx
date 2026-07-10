'use client'

import React from 'react'
import EmptyState from './EmptyState'
import { SkeletonTable } from '../Skeleton'

export interface Column<T> {
  key: string
  header: React.ReactNode
  width?: string
  className?: string
  render?: (row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  /** @deprecated prefer emptyTitle/emptyDescription */
  emptyMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
  rowKey?: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
}

function getCellValue<T>(row: T, col: Column<T>, index: number): React.ReactNode {
  if (col.render) return col.render(row, index)
  const raw = (row as Record<string, unknown>)[col.key]
  return (raw as React.ReactNode) ?? null
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  rowKey,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  if (loading) {
    return <SkeletonTable rows={5} columns={columns.length || 4} />
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle ?? emptyMessage ?? 'No data'}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'text-left px-6 py-3 text-xs font-medium uppercase tracking-wide',
                    'text-slate-500 dark:text-slate-400 whitespace-nowrap',
                    col.className || '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, idx) => {
              const key = rowKey ? rowKey(row) : String(idx)
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={[
                    'odd:bg-white even:bg-slate-50/40',
                    'dark:odd:bg-slate-900 dark:even:bg-slate-800/20',
                    'transition-colors',
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'px-6 py-4 text-sm text-slate-700 dark:text-slate-300 align-middle',
                        col.className || '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {getCellValue(row, col, idx)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
