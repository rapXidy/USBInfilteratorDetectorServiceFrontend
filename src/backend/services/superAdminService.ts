import { apiClient } from '../http/axiosClient'
import type { SuperAdminOrganization } from '../types'

/** GET /api/superadmin/organizations?isActive= — list all organizations, optionally filtered by active flag. */
export async function listOrganizations(isActive?: boolean): Promise<SuperAdminOrganization[]> {
  const { data } = await apiClient.get<SuperAdminOrganization[]>('/api/superadmin/organizations', {
    params: isActive === undefined ? undefined : { isActive },
  })
  return data
}

/** GET /api/superadmin/organizations/{id} — organization detail. */
export async function getOrganization(id: string): Promise<SuperAdminOrganization> {
  const { data } = await apiClient.get<SuperAdminOrganization>(`/api/superadmin/organizations/${id}`)
  return data
}

/** POST /api/superadmin/organizations/{id}/activate — re-enable an organization. */
export async function activateOrganization(id: string): Promise<SuperAdminOrganization> {
  const { data } = await apiClient.post<SuperAdminOrganization>(`/api/superadmin/organizations/${id}/activate`)
  return data
}

/** POST /api/superadmin/organizations/{id}/deactivate — disable an organization. */
export async function deactivateOrganization(id: string): Promise<SuperAdminOrganization> {
  const { data } = await apiClient.post<SuperAdminOrganization>(`/api/superadmin/organizations/${id}/deactivate`)
  return data
}
