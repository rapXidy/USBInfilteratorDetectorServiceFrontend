import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listAlerts } from '../services/alertsService'
import { getSession, listSessions } from '../services/sessionsService'
import { queryKeys } from '../queryKeys'
import type { Alert, SessionDetail, SessionListItem, SessionsQuery } from '../types'

/** Query for GET /api/sessions with filters; keeps the previous page visible while paging. */
export function useSessions(query: SessionsQuery) {
  return useQuery<SessionListItem[]>({
    queryKey: queryKeys.sessions.list(query),
    queryFn: () => listSessions(query),
    placeholderData: keepPreviousData,
  })
}

/** Query for GET /api/sessions/{id} — full detail (reasons + events). `id` is the DB id. */
export function useSession(id: string | undefined) {
  return useQuery<SessionDetail>({
    queryKey: queryKeys.sessions.detail(id ?? ''),
    queryFn: () => getSession(id as string),
    enabled: !!id,
  })
}

/** Query for GET /api/alerts?take= — recent high-risk alerts. */
export function useAlerts(take = 10) {
  return useQuery<Alert[]>({ queryKey: queryKeys.alerts.list(take), queryFn: () => listAlerts(take) })
}
