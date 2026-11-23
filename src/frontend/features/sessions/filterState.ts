import type { SessionsQuery } from '@/backend/types'

/** Page size for the sessions list. */
export const SESSIONS_PAGE_SIZE = 25

/** Filter values as they appear in the URL / form (all strings). */
export interface SessionFilterValues {
  from: string
  to: string
  minRisk: string
  host: string
  device: string
  detection: 'all' | 'complete' | 'incomplete'
}

export const EMPTY_FILTERS: SessionFilterValues = { from: '', to: '', minRisk: '', host: '', device: '', detection: 'all' }

/** Read filters + page from URL search params. */
export function filtersFromParams(params: URLSearchParams): { filters: SessionFilterValues; page: number } {
  const detection = params.get('detection')
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    filters: {
      from: params.get('from') ?? '',
      to: params.get('to') ?? '',
      minRisk: params.get('minRisk') ?? '',
      host: params.get('host') ?? '',
      device: params.get('device') ?? '',
      detection: detection === 'complete' || detection === 'incomplete' ? detection : 'all',
    },
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/** Serialize filters + page to URL search params (omitting defaults). */
export function filtersToParams(filters: SessionFilterValues, page: number): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.from) p.set('from', filters.from)
  if (filters.to) p.set('to', filters.to)
  if (filters.minRisk) p.set('minRisk', filters.minRisk)
  if (filters.host) p.set('host', filters.host)
  if (filters.device) p.set('device', filters.device)
  if (filters.detection !== 'all') p.set('detection', filters.detection)
  if (page > 1) p.set('page', String(page))
  return p
}

/** Whether any filter is active. */
export function hasActiveFilters(filters: SessionFilterValues): boolean {
  return JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)
}

/** Convert UI filter values into the API query (local-day boundaries → UTC ISO). */
export function toSessionsQuery(filters: SessionFilterValues, page: number, take = SESSIONS_PAGE_SIZE): SessionsQuery {
  const query: SessionsQuery = { skip: (page - 1) * take, take }
  if (filters.from) query.fromUtc = new Date(`${filters.from}T00:00:00`).toISOString()
  if (filters.to) query.toUtc = new Date(`${filters.to}T23:59:59.999`).toISOString()
  const min = Number.parseInt(filters.minRisk, 10)
  if (Number.isFinite(min) && min > 0) query.minRiskScore = min
  if (filters.host.trim()) query.host = filters.host.trim()
  if (filters.device.trim()) query.deviceSerial = filters.device.trim()
  if (filters.detection === 'complete') query.detectionComplete = true
  if (filters.detection === 'incomplete') query.detectionComplete = false
  return query
}
