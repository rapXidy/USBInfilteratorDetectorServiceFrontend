import { FileSearch, ShieldCheck } from 'lucide-react'
import type { SessionReason } from '@/backend/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { getRiskLevel } from '@/frontend/components/RiskBadge'
import { cn } from '@/frontend/lib/utils'

const barColor = { low: 'bg-success', medium: 'bg-warning', high: 'bg-destructive' } as const

/**
 * "Why this score?" — the product differentiator.
 * Every reason shows its rule, weight (relative bar + number), description and the Windows Event Record IDs
 * that triggered it. Record IDs link (via #event-<id>) to the matching row in the event timeline.
 */
export function ReasonsPanel({ reasons, riskScore }: { reasons: SessionReason[]; riskScore: number }) {
  const sorted = [...reasons].sort((a, b) => b.weight - a.weight)
  const total = sorted.reduce((sum, r) => sum + r.weight, 0)
  const max = Math.max(1, ...sorted.map((r) => r.weight))
  const level = getRiskLevel(riskScore)

  return (
    <Card aria-labelledby="reasons-heading">
      <CardHeader>
        <CardTitle id="reasons-heading" className="flex items-center gap-2 text-lg">
          <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
          Why this score?
        </CardTitle>
        <CardDescription>
          {sorted.length > 0
            ? `${sorted.length} detection ${sorted.length === 1 ? 'rule' : 'rules'} contributed a combined weight of ${total} to the risk score of ${riskScore}.`
            : 'No detection rules were triggered for this session.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-4 text-sm">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            Nothing suspicious was flagged. A low score with no reasons means the activity matched normal behaviour.
          </div>
        ) : (
          <ol className="space-y-3">
            {sorted.map((reason, i) => (
              <li key={`${reason.ruleName}-${i}`} className="rounded-lg border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold">{reason.ruleName}</h4>
                  <span
                    className="rounded-md bg-muted px-2 py-0.5 text-sm font-semibold tabular-nums"
                    aria-label={`Weight ${reason.weight}`}
                  >
                    +{reason.weight}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className={cn('h-full rounded-full', barColor[level])} style={{ width: `${(reason.weight / max) * 100}%` }} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{reason.description}</p>
                {reason.eventRecordIds.length > 0 ? (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Event Record IDs
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {reason.eventRecordIds.map((rid) => (
                        <li key={rid}>
                          <a
                            href={`#event-${rid}`}
                            className="inline-block rounded border bg-card px-2 py-0.5 font-mono text-xs hover:border-primary hover:text-primary"
                            title="Jump to this event in the timeline"
                          >
                            {rid}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">No specific event records were attached to this rule.</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
