import { format, formatDistanceToNow } from 'date-fns'

/**
 * Parse an API timestamp as UTC. .NET may serialize `DateTime` with Kind=Unspecified (no `Z`),
 * which JavaScript would otherwise interpret as local time.
 */
export function parseUtc(iso: string): Date {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(iso)
  return new Date(hasZone ? iso : `${iso}Z`)
}

/** e.g. "Nov 18, 2026, 5:04 PM" in the viewer's local time zone. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseUtc(iso)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP p')
}

/** e.g. "Nov 18, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseUtc(iso)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

/** e.g. "5 minutes ago". */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseUtc(iso)
  return Number.isNaN(d.getTime()) ? '—' : formatDistanceToNow(d, { addSuffix: true })
}

/** Time-only with seconds for event timelines. */
export function formatTimeWithSeconds(iso: string): string {
  const d = parseUtc(iso)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP pp')
}

/** Human duration between two timestamps, e.g. "12m 4s". Returns null when the end is missing. */
export function formatDuration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null
  const ms = parseUtc(endIso).getTime() - parseUtc(startIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return null
  const s = Math.round(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
