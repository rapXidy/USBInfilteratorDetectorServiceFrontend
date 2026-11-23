import type { HTMLAttributes } from 'react'
import { cn } from '@/frontend/lib/utils'

/** Loading placeholder block. Decorative, hidden from assistive tech. */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export { Skeleton }
