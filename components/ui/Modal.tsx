'use client'

import React from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  size?: ModalSize
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

let modalIdSeq = 0

export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  className = '',
}: ModalProps) {
  const [titleId] = React.useState(() => {
    modalIdSeq += 1
    return `modal-title-${modalIdSeq}`
  })

  // Escape to close
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Body scroll lock
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={[
          'relative w-full animate-scale-in',
          'bg-white dark:bg-slate-900',
          'border border-slate-200 dark:border-slate-800',
          'rounded-xl shadow-card-hover',
          'max-h-[90vh] flex flex-col',
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            {title ? (
              <h2
                id={titleId}
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="shrink-0 -mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg
                text-slate-400 hover:text-slate-700 hover:bg-slate-100
                dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800
                transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
