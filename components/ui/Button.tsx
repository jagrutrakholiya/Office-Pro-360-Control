'use client'

import React from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'ghost'
  | 'outline'

type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-primary-500/60 dark:focus-visible:ring-offset-slate-900 ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ' +
    'hover:bg-slate-800 dark:hover:bg-slate-100 border border-transparent',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
    'hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 border border-transparent',
  success:
    'bg-success-600 text-white hover:bg-success-700 border border-transparent',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-200 ' +
    'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent',
  outline:
    'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 ' +
    'border border-slate-300 dark:border-slate-700 ' +
    'hover:bg-slate-50 dark:hover:bg-slate-800',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
}

const iconOnlySize: Record<ButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={[
          base,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : (
          leadingIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leadingIcon}
            </span>
          )
        )}
        {children != null && <span>{children}</span>}
        {!loading && trailingIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </button>
    )
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={[
          base,
          variantStyles[variant],
          iconOnlySize[size],
          'p-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }
)

export default Button
