import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../services/dashboardService'
import { getMyOrganization } from '../services/organizationsService'
import { getSubscription } from '../services/subscriptionService'
import { queryKeys } from '../queryKeys'
import type { DashboardSummary, OrganizationProfile, Subscription } from '../types'

/** Query for GET /api/dashboard/summary — home-screen counts. */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({ queryKey: queryKeys.dashboard.summary, queryFn: getDashboardSummary })
}

/** Query for GET /api/subscription — current plan and limits. */
export function useSubscription() {
  return useQuery<Subscription>({ queryKey: queryKeys.subscription.current, queryFn: getSubscription })
}

/** Query for GET /api/organizations/me — organization profile (also feeds the sidebar name). */
export function useMyOrganization(enabled = true) {
  return useQuery<OrganizationProfile>({
    queryKey: queryKeys.organization.me,
    queryFn: getMyOrganization,
    enabled,
    staleTime: 5 * 60_000,
  })
}
