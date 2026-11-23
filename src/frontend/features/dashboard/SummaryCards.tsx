import type { LucideIcon } from 'lucide-react'
import { CreditCard, MonitorSmartphone, ShieldAlert, Usb, Activity } from 'lucide-react'
import type { DashboardSummary } from '@/backend/types'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { ErrorState } from '@/frontend/components/ErrorState'
import { cn } from '@/frontend/lib/utils'

interface StatProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'default' | 'danger'
  hint?: string
}

function Stat({ label, value, icon: Icon, tone = 'default', hint }: StatProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('mt-1 truncate text-2xl font-semibold tabular-nums', tone === 'danger' && 'text-destructive')}>{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
            tone === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-accent text-primary',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

interface SummaryCardsProps {
  data?: DashboardSummary
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

/** GET /api/dashboard/summary rendered as KPI cards. Plan/status are strings on this endpoint. */
export function SummaryCards({ data, isLoading, error, onRetry }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="status" aria-label="Loading summary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
    )
  }
  if (error || !data) return <ErrorState error={error} title="Could not load summary" onRetry={onRetry} />

  return (
    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Stat label="Hosts reporting" value={data.hostCount} icon={MonitorSmartphone} />
      <Stat label="Total sessions" value={data.sessionCount} icon={Activity} />
      <Stat label="High-risk sessions" value={data.highRiskSessionCount} icon={ShieldAlert} tone={data.highRiskSessionCount > 0 ? 'danger' : 'default'} />
      <Stat label="Allowed devices" value={data.allowedDeviceCount} icon={Usb} />
      <Stat label="Plan" value={data.subscriptionPlan} icon={CreditCard} hint={`Status: ${data.subscriptionStatus}`} />
    </section>
  )
}
