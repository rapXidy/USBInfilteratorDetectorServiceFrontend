import { apiClient } from '../http/axiosClient'
import type { AuditorUser, CreateAuditorUserRequest, UpdateAuditorUserRequest } from '../types'

/** GET /api/auditor-users — list auditor users of the organization (Admin only). */
export async function listAuditorUsers(): Promise<AuditorUser[]> {
  const { data } = await apiClient.get<AuditorUser[]>('/api/auditor-users')
  return data
}

/** POST /api/auditor-users — create an auditor user (role is numeric: 0 Admin, 1 Auditor, 2 Viewer). */
export async function createAuditorUser(body: CreateAuditorUserRequest): Promise<AuditorUser> {
  const { data } = await apiClient.post<AuditorUser>('/api/auditor-users', body)
  return data
}

/** PUT /api/auditor-users/{id} — update display name, role, and active flag. */
export async function updateAuditorUser(id: string, body: UpdateAuditorUserRequest): Promise<AuditorUser> {
  const { data } = await apiClient.put<AuditorUser>(`/api/auditor-users/${id}`, body)
  return data
}

/** POST /api/auditor-users/{id}/reset-password — email a new temporary password. */
export async function resetAuditorUserPassword(id: string): Promise<void> {
  await apiClient.post(`/api/auditor-users/${id}/reset-password`)
}

/** DELETE /api/auditor-users/{id} — soft-deactivate an auditor user. */
export async function deactivateAuditorUser(id: string): Promise<void> {
  await apiClient.delete(`/api/auditor-users/${id}`)
}
