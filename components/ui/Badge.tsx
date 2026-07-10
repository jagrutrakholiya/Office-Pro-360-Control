import React from 'react'

type BadgeVariant =
  | 'default'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

type BadgeSize = 'sm' | 'md'

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success:
    'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  warning:
    'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  danger:
    'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  info:
    'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-2xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

export default function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
