import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

/** Native `<select>` styled like a shadcn input (best a11y + mobile behaviour). */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full appearance-none rounded-md border border-input bg-card px-3 py-2 pr-9 text-sm disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  </div>
))
Select.displayName = 'Select'

export { Select }
