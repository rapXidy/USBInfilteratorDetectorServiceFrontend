import { apiClient } from '../http/axiosClient'
import type {
  CreateHrStaffRequest,
  HrStaff,
  HrStaffLeaverSession,
  HrStaffListQuery,
  HrStaffSummary,
  SessionListItem,
  UpdateHrStaffRequest,
} from '../types'

/** GET /api/hr-staff */
export async function listHrStaff(query: HrStaffListQuery = {}): Promise<HrStaff[]> {
  const { data } = await apiClient.get<HrStaff[]>('/api/hr-staff', { params: query })
  return data
}

/** GET /api/hr-staff/summary */
export async function getHrStaffSummary(): Promise<HrStaffSummary> {
  const { data } = await apiClient.get<HrStaffSummary>('/api/hr-staff/summary')
  return data
}

/** GET /api/hr-staff/{id} */
export async function getHrStaff(id: string): Promise<HrStaff> {
  const { data } = await apiClient.get<HrStaff>(`/api/hr-staff/${id}`)
  return data
}

/** POST /api/hr-staff */
export async function createHrStaff(body: CreateHrStaffRequest): Promise<HrStaff> {
  const { data } = await apiClient.post<HrStaff>('/api/hr-staff', body)
  return data
}

/** PUT /api/hr-staff/{id} */
export async function updateHrStaff(id: string, body: UpdateHrStaffRequest): Promise<HrStaff> {
  const { data } = await apiClient.put<HrStaff>(`/api/hr-staff/${id}`, body)
  return data
}

/** DELETE /api/hr-staff/{id} */
export async function deactivateHrStaff(id: string): Promise<void> {
  await apiClient.delete(`/api/hr-staff/${id}`)
}

/** GET /api/hr-staff/leavers/sessions */
export async function listLeaverSessions(params: {
  includeExited?: boolean
  fromUtc?: string
  toUtc?: string
  minRiskScore?: number
  skip?: number
  take?: number
} = {}): Promise<HrStaffLeaverSession[]> {
  const { data } = await apiClient.get<HrStaffLeaverSession[]>('/api/hr-staff/leavers/sessions', { params })
  return data
}

/** GET /api/hr-staff/{id}/sessions */
export async function listStaffSessions(
  id: string,
  params: { fromUtc?: string; toUtc?: string; minRiskScore?: number; skip?: number; take?: number } = {},
): Promise<SessionListItem[]> {
  const { data } = await apiClient.get<SessionListItem[]>(`/api/hr-staff/${id}/sessions`, { params })
  return data
}
