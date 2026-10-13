import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

// Wraps one labeled form control with a consistent label/error/hint
// layout - every Input/Select/TextArea in the app is used inside one of
// these rather than hand-rolling label markup per form.
export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export const inputClasses = cn(
  'h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-muted',
  'focus:border-blue-accent focus:outline-none focus:ring-2 focus:ring-blue-accent/20',
  'disabled:bg-app-bg-2 disabled:text-text-muted',
)
