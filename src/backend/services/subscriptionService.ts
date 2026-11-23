import { apiClient } from '../http/axiosClient'
import type { Subscription } from '../types'

/** GET /api/subscription — current plan, status, host limit and feature flags. */
export async function getSubscription(): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>('/api/subscription')
  return data
}
