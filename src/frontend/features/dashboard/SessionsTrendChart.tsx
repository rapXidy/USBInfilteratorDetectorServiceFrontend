import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { addDays, addHours, format, startOfDay, startOfHour } from 'date-fns'
import type { SessionListItem } from '@/backend/types'
import { parseUtc } from '@/frontend/lib/date'
import { HIGH_RISK_THRESHOLD } from '@/frontend/components/RiskBadge'
import type { Period } from './periods'

interface Point {
  label: string
  normal: number
  highRisk: number
}

/** Bucket sessions into hourly/daily points across the whole window (empty buckets included). */
function buildSeries(sessions: SessionListItem[], period: Period): Point[] {
  const now = new Date()
  const start = new Date(now.getTime() - period.hours * 3_600_000)
  const hourly = period.bucket === 'hour'
  const first = hourly ? startOfHour(start) : startOfDay(start)
  const step = (d: Date) => (hourly ? addHours(d, 1) : addDays(d, 1))
  const fmt = hourly ? 'HH:mm' : 'MMM d'

  const buckets = new Map<number, Point>()
  for (let d = first; d <= now; d = step(d)) {
    buckets.set(d.getTime(), { label: format(d, fmt), normal: 0, highRisk: 0 })
  }
  for (const s of sessions) {
    const t = parseUtc(s.connectedAt)
    const key = (hourly ? startOfHour(t) : startOfDay(t)).getTime()
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (s.riskScore >= HIGH_RISK_THRESHOLD) bucket.highRisk += 1
    else bucket.normal += 1
  }
  return Array.from(buckets.values())
}

/** Stacked bar chart: sessions per bucket, with high-risk sessions highlighted in red. */
export function SessionsTrendChart({ sessions, period }: { sessions: SessionListItem[]; period: Period }) {
  const data = useMemo(() => buildSeries(sessions, period), [sessions, period])
  const total = sessions.length

  return (
    <figure>
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={16} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="normal" name="Sessions" stackId="s" fill="hsl(221 83% 53%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="highRisk" name="High risk" stackId="s" fill="hsl(0 72% 51%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        Sessions over the {period.label.toLowerCase()}: {total} total.
      </figcaption>
    </figure>
  )
}
