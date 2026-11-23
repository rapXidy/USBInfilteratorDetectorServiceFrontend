import { apiClient } from '../http/axiosClient'
import type { SessionDetail, SessionListItem, SessionsQuery } from '../types'

/** GET /api/sessions — filtered, paginated (skip/take) USB sessions for the current organization. */
export async function listSessions(query: SessionsQuery = {}): Promise<SessionListItem[]> {
  // Drop empty values so the API doesn't receive blank filters.
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const { data } = await apiClient.get<SessionListItem[]>('/api/sessions', { params })
  return data
}

/** GET /api/sessions/{id} — full session detail with explainable reasons and raw events. `id` is the DB id. */
export async function getSession(id: string): Promise<SessionDetail> {
  const { data } = await apiClient.get<SessionDetail>(`/api/sessions/${id}`)
  return data
}
