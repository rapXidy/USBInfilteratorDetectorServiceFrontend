import { Link } from 'react-router-dom'
import { BellRing, ChevronRight } from 'lucide-react'
import { useAlerts } from '@/backend/hooks/useSessions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { DetectionBadge } from '@/frontend/components/DetectionBadge'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { RiskBadge } from '@/frontend/components/RiskBadge'
import { formatRelative } from '@/frontend/lib/date'

/** GET /api/alerts?take=10 — latest high-severity sessions. Links use `usbSessionId` (the DB id), not `sessionId`. */
export function RecentAlerts() {
  const alerts = useAlerts(10)

  return (
    <Card aria-labelledby="alerts-heading">
      <CardHeader>
        <CardTitle id="alerts-heading" className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-destructive" aria-hidden="true" />
          Recent high-severity alerts
        </CardTitle>
        <CardDescription>The 10 most recent sessions above the high-risk threshold.</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.isLoading ? (
          <div className="space-y-2" role="status" aria-label="Loading alerts">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : alerts.isError ? (
          <ErrorState error={alerts.error} title="Could not load alerts" onRetry={() => void alerts.refetch()} />
        ) : (alerts.data ?? []).length === 0 ? (
          <EmptyState title="No high-risk alerts" description="No high-risk sessions have been reported recently. Nice and quiet." />
        ) : (
          <ul className="divide-y rounded-md border">
            {alerts.data!.map((a) => (
              <li key={a.usbSessionId}>
                <Link
                  to={`/sessions/${a.usbSessionId}`}
                  className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.hostName}</span>
                      <span className="font-mono text-xs text-muted-foreground">{a.deviceSerial}</span>
                      {!a.detectionComplete && <DetectionBadge complete={false} />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelative(a.connectedAt)}
                      {a.topReasons.length > 0 && <> · {a.topReasons.map((r) => r.ruleName).join(', ')}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge score={a.riskScore} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
