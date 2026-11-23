import { apiClient } from '../http/axiosClient'
import type { Alert } from '../types'

/** GET /api/alerts?take= — most recent high-risk session alerts for the current organization. */
export async function listAlerts(take = 10): Promise<Alert[]> {
  const { data } = await apiClient.get<Alert[]>('/api/alerts', { params: { take } })
  return data
}
