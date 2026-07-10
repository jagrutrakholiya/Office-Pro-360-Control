'use client'

import React from 'react'

const fieldBase =
  'w-full rounded-lg border bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

function borderClass(error?: boolean): string {
  return error
    ? 'border-danger-400 dark:border-danger-500 focus:ring-danger-500/40 focus:border-danger-500'
    : 'border-slate-300 dark:border-slate-700'
}

let fieldIdSeq = 0
function useFieldId(explicit?: string): string {
  const [generated] = React.useState(() => {
    fieldIdSeq += 1
    return `field-${fieldIdSeq}`
  })
  return explicit ?? generated
}

interface FieldWrapProps {
  id: string
  label?: React.ReactNode
  error?: React.ReactNode
  helperText?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function FieldWrap({
  id,
  label,
  error,
  helperText,
  children,
  className = '',
}: FieldWrapProps) {
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger-600 dark:text-danger-400">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={`${id}-help`} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )
      )}
    </div>
  )
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: React.ReactNode
  helperText?: React.ReactNode
  leadingIcon?: React.ReactNode
  wrapperClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      leadingIcon,
      id,
      className = '',
      wrapperClassName,
      ...props
    },
    ref
  ) {
    const fieldId = useFieldId(id)
    return (
      <FieldWrap
        id={fieldId}
        label={label}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <div className="relative">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined
            }
            className={[
              fieldBase,
              borderClass(!!error),
              leadingIcon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
        </div>
      </FieldWrap>
    )
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  error?: React.ReactNode
  helperText?: React.ReactNode
  wrapperClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, helperText, id, className = '', wrapperClassName, ...props },
    ref
  ) {
    const fieldId = useFieldId(id)
    return (
      <FieldWrap
        id={fieldId}
        label={label}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined
          }
          className={[
            fieldBase,
            borderClass(!!error),
            'px-3 py-2 min-h-[80px] resize-y',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </FieldWrap>
    )
  }
)

export interface SelectOption {
  label: React.ReactNode
  value: string | number
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode
  error?: React.ReactNode
  helperText?: React.ReactNode
  options?: SelectOption[]
  wrapperClassName?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      helperText,
      options,
      id,
      className = '',
      wrapperClassName,
      children,
      ...props
    },
    ref
  ) {
    const fieldId = useFieldId(id)
    return (
      <FieldWrap
        id={fieldId}
        label={label}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined
          }
          className={[
            fieldBase,
            borderClass(!!error),
            'px-3 py-2 pr-8 appearance-none cursor-pointer',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label as string}
                </option>
              ))
            : children}
        </select>
      </FieldWrap>
    )
  }
)

export default Input
