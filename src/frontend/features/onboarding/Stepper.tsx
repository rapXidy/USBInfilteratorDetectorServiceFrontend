import { Check } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface StepperProps {
  steps: string[]
  /** Zero-based index of the current step. */
  current: number
}

/** Horizontal progress indicator for the onboarding wizard (exposes progress to assistive tech). */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="mb-6 flex items-center justify-between gap-2" aria-label="Onboarding progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                done && 'border-success bg-success text-success-foreground',
                active && 'border-primary bg-primary text-primary-foreground',
                !done && !active && 'bg-card text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn('hidden text-xs font-medium sm:inline', active ? 'text-foreground' : 'text-muted-foreground')}>
              {label}
              {done && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
