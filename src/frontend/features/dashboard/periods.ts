export type PeriodKey = '24h' | '7d' | '30d'

export interface Period {
  key: PeriodKey
  label: string
  hours: number
  /** Chart bucket size. */
  bucket: 'hour' | 'day'
}

export const PERIODS: Period[] = [
  { key: '24h', label: 'Last 24 hours', hours: 24, bucket: 'hour' },
  { key: '7d', label: 'Last 7 days', hours: 24 * 7, bucket: 'day' },
  { key: '30d', label: 'Last 30 days', hours: 24 * 30, bucket: 'day' },
]

/** Max sessions fetched for client-side period stats/trend (the summary endpoint has no period params). */
export const PERIOD_SESSION_LIMIT = 500
