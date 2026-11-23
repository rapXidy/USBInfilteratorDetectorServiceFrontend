import type { ReactNode } from 'react'
import { Label } from '@/frontend/components/ui/label'
import { cn } from '@/frontend/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  labelClassName?: string
  children: ReactNode
}

/**
 * Label + control + inline error wrapper. The control must set `id`, `aria-invalid` and
 * `aria-describedby={`${id}-error`}` when an error is present (see helper `fieldA11y`).
 */
export function FormField({ id, label, error, hint, labelClassName, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={cn('text-xs text-muted-foreground')}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** ARIA props for a control rendered inside <FormField>. */
export function fieldA11y(id: string, error?: string) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  } as const
}
