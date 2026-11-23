import { apiClient } from '../http/axiosClient'
import type { OrganizationProfile } from '../types'

/** GET /api/organizations/me — profile of the signed-in auditor's organization (read-only). */
export async function getMyOrganization(): Promise<OrganizationProfile> {
  const { data } = await apiClient.get<OrganizationProfile>('/api/organizations/me')
  return data
}
