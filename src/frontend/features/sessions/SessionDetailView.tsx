import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { useSession } from '@/backend/hooks/useSessions'
import { parseApiError } from '@/backend/http/error'
import type { SessionDetail } from '@/backend/types'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/frontend/components/ui/alert'
import { DetectionBadge } from '@/frontend/components/DetectionBadge'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { RiskBadge } from '@/frontend/components/RiskBadge'
import { formatDateTime, formatDuration } from '@/frontend/lib/date'
import { formatBytes } from '@/frontend/lib/utils'
import { EventsTimeline } from './EventsTimeline'
import { ReasonsPanel } from './ReasonsPanel'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children}</dd>
    </div>
  )
}

/** Header: host/user/device facts + prominent overall risk score and detection status. */
function SessionHeader({ s }: { s: SessionDetail }) {
  const duration = formatDuration(s.connectedAt, s.disconnectedAt)
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">USB session</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {s.hostName} <span className="font-normal text-muted-foreground">·</span>{' '}
              <span className="font-mono text-xl">{s.deviceSerial}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DetectionBadge complete={s.detectionComplete} />
              {!s.disconnectedAt && <span className="text-xs font-medium text-warning">Still connected</span>}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk score</span>
            <RiskBadge score={s.riskScore} size="lg" />
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-5 md:grid-cols-4">
          <Fact label="Host">{s.hostName}</Fact>
          <Fact label="Logged-in user">{s.loggedInUser ?? '—'}</Fact>
          <Fact label="Vendor / model">{[s.vendor, s.model].filter(Boolean).join(' · ') || '—'}</Fact>
          <Fact label="Data written">{formatBytes(s.totalBytesWritten)}</Fact>
          <Fact label="Connected">{formatDateTime(s.connectedAt)}</Fact>
          <Fact label="Disconnected">{formatDateTime(s.disconnectedAt)}</Fact>
          <Fact label="Duration">{duration ?? '—'}</Fact>
          <Fact label="Worker session ID">
            <span className="font-mono text-xs">{s.sessionId}</span>
          </Fact>
        </dl>
      </CardContent>
    </Card>
  )
}

/** Loading skeleton matching the page layout. */
function DetailSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading session">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

/**
 * Session detail — the priority screen.
 * Order: header (risk) → incomplete-detection warning → explainable reasons → raw event timeline.
 * Uses the DB `id` from the route (`GET /api/sessions/{id}`).
 */
export function SessionDetailView() {
  const { id } = useParams<{ id: string }>()
  const query = useSession(id)

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
      <Link to="/sessions">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sessions
      </Link>
    </Button>
  )

  if (query.isLoading) {
    return (
      <>
        {back}
        <DetailSkeleton />
      </>
    )
  }

  if (query.isError || !query.data) {
    const status = parseApiError(query.error).status
    return (
      <>
        {back}
        {status === 404 ? (
          <EmptyState
            title="Session not found"
            description="It may belong to another organization or no longer exist."
            action={
              <Button asChild>
                <Link to="/sessions">View all sessions</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={query.error} title="Could not load this session" onRetry={() => void query.refetch()} />
        )}
      </>
    )
  }

  const s = query.data
  return (
    <div className="space-y-5">
      <div>{back}</div>
      <SessionHeader s={s} />

      {!s.detectionComplete && (
        <Alert variant="warning">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <AlertTitle>Detection incomplete for this session</AlertTitle>
              <AlertDescription>
                The host&apos;s Windows audit settings did not allow every detection rule to run. The risk score may
                <strong> under-report</strong> real activity — treat a low score here as &quot;unknown&quot;, and enable the
                missing audit policies on host <span className="font-mono">{s.hostName}</span>.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <ReasonsPanel reasons={s.reasons} riskScore={s.riskScore} />
      <EventsTimeline events={s.events} reasons={s.reasons} />
    </div>
  )
}
