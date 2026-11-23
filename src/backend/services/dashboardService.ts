import { apiClient } from '../http/axiosClient'
import type { DashboardSummary } from '../types'

/** GET /api/dashboard/summary — aggregate counts for the home screen (no period parameters). */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/api/dashboard/summary')
  return data
}
