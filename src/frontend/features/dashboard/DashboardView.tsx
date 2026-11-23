import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { startOfHour } from 'date-fns'
import { useSessions } from '@/backend/hooks/useSessions'
import { useDashboardSummary } from '@/backend/hooks/useTenant'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { HIGH_RISK_THRESHOLD } from '@/frontend/components/RiskBadge'
import { cn } from '@/frontend/lib/utils'
import { PERIODS, PERIOD_SESSION_LIMIT, type PeriodKey } from './periods'
import { RecentAlerts } from './RecentAlerts'
import { SessionsTrendChart } from './SessionsTrendChart'
import { SummaryCards } from './SummaryCards'

/**
 * Dashboard: KPI summary (GET /dashboard/summary), period filter + trend (sessions list with `fromUtc`),
 * and the latest alerts. The summary endpoint has no period params, so period stats are derived client-side
 * from the sessions list (capped at PERIOD_SESSION_LIMIT).
 */
export function DashboardView() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>('7d')
  const period = PERIODS.find((p) => p.key === periodKey)!
  const summary = useDashboardSummary()

  // Round to the hour so the query key is stable between renders.
  const fromUtc = useMemo(() => new Date(startOfHour(new Date()).getTime() - period.hours * 3_600_000).toISOString(), [period.hours])
  const sessions = useSessions({ fromUtc, take: PERIOD_SESSION_LIMIT, skip: 0 })

  const rows = sessions.data ?? []
  const highRisk = rows.filter((s) => s.riskScore >= HIGH_RISK_THRESHOLD).length
  const capped = rows.length >= PERIOD_SESSION_LIMIT

  return (
    <div className="space-y-6">
      <SummaryCards data={summary.data} isLoading={summary.isLoading} error={summary.error} onRetry={() => void summary.refetch()} />

      <Card aria-labelledby="trend-heading">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <CardTitle id="trend-heading">Session activity</CardTitle>
            <CardDescription>
              {sessions.isLoading
                ? 'Loading…'
                : `${capped ? `${PERIOD_SESSION_LIMIT}+` : rows.length} sessions · ${highRisk} high risk in the ${period.label.toLowerCase()}`}
            </CardDescription>
          </div>
          <div role="group" aria-label="Time period" className="inline-flex rounded-md border bg-card p-0.5">
            {PERIODS.map((p) => (
              <Button
                key={p.key}
                type="button"
                size="sm"
                variant={p.key === periodKey ? 'default' : 'ghost'}
                aria-pressed={p.key === periodKey}
                className={cn('h-8', p.key !== periodKey && 'text-muted-foreground')}
                onClick={() => setPeriodKey(p.key)}
              >
                {p.key === '24h' ? '24 h' : p.key === '7d' ? '7 d' : '30 d'}
                <span className="sr-only"> ({p.label})</span>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : sessions.isError ? (
            <ErrorState error={sessions.error} title="Could not load session activity" onRetry={() => void sessions.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={`No sessions in the ${period.label.toLowerCase()}`}
              description="Try a longer period, or check that your Windows service hosts are reporting."
            />
          ) : (
            <>
              <SessionsTrendChart sessions={rows} period={period} />
              {capped && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Showing the latest {PERIOD_SESSION_LIMIT} sessions for this period.{' '}
                  <Link to="/sessions" className="text-primary underline-offset-4 hover:underline">
                    Open the full sessions list
                  </Link>
                  .
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <RecentAlerts />
    </div>
  )
}
