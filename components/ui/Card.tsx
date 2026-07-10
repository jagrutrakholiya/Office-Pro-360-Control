import React from 'react'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'
type CardVariant = 'default' | 'interactive' | 'elevated'

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

const variantStyles: Record<CardVariant, string> = {
  default: '',
  interactive:
    'transition-colors hover:border-slate-300 dark:hover:border-slate-700 ' +
    'hover:shadow-sm cursor-pointer',
  elevated: 'shadow-card',
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  variant?: CardVariant
}

export default function Card({
  padding = 'md',
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-800',
        'rounded-xl',
        paddingStyles[padding],
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={[
        'text-base font-semibold text-slate-900 dark:text-slate-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={[
        'text-sm text-slate-500 dark:text-slate-400',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'flex items-center gap-3 pt-4 mt-4 ' +
          'border-t border-slate-200 dark:border-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
