import { History } from 'lucide-react'
import type { RawEvent, SessionReason } from '@/backend/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { EmptyState } from '@/frontend/components/EmptyState'
import { formatTimeWithSeconds } from '@/frontend/lib/date'

/**
 * Chronological list of raw Windows events for the session.
 * Rows that back a detection reason are marked; the row targeted by `#event-<recordId>` is highlighted.
 */
export function EventsTimeline({ events, reasons }: { events: RawEvent[]; reasons: SessionReason[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.timeCreated).getTime() - new Date(b.timeCreated).getTime())
  // recordId → rule names that cite it
  const cited = new Map<number, string[]>()
  reasons.forEach((r) => r.eventRecordIds.forEach((id) => cited.set(id, [...(cited.get(id) ?? []), r.ruleName])))

  return (
    <Card aria-labelledby="events-heading">
      <CardHeader>
        <CardTitle id="events-heading" className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          Event timeline
        </CardTitle>
        <CardDescription>{sorted.length} raw Windows events captured during this session.</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState title="No raw events stored" description="The Worker did not attach any raw events to this session." />
        ) : (
          <ol className="relative space-y-3 border-l-2 border-border pl-5">
            {sorted.map((e) => {
              const rules = cited.get(e.recordId)
              return (
                <li
                  key={`${e.recordId}-${e.eventId}`}
                  id={`event-${e.recordId}`}
                  className="relative scroll-mt-24 rounded-md border bg-background p-3 target:border-primary target:bg-accent target:ring-2 target:ring-primary/40"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[1.72rem] top-4 h-3 w-3 rounded-full border-2 border-card ${rules ? 'bg-destructive' : 'bg-muted-foreground/50'}`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{e.activity}</p>
                    <time className="text-xs text-muted-foreground" dateTime={e.timeCreated}>
                      {formatTimeWithSeconds(e.timeCreated)}
                    </time>
                  </div>
                  {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Event ID <span className="font-mono font-semibold text-foreground">{e.eventId}</span>
                    </span>
                    <span>
                      Record ID <span className="font-mono font-semibold text-foreground">{e.recordId}</span>
                    </span>
                    {rules && (
                      <span className="font-medium text-destructive">Cited by: {rules.join(', ')}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
