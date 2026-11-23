import { apiClient } from '../http/axiosClient'
import type { AllowedDevice, CreateAllowedDeviceRequest, UpdateAllowedDeviceRequest } from '../types'

/** GET /api/devices — list allowed USB devices (Admin/Auditor). */
export async function listDevices(): Promise<AllowedDevice[]> {
  const { data } = await apiClient.get<AllowedDevice[]>('/api/devices')
  return data
}

/** POST /api/devices — add an allowed device. */
export async function createDevice(body: CreateAllowedDeviceRequest): Promise<AllowedDevice> {
  const { data } = await apiClient.post<AllowedDevice>('/api/devices', body)
  return data
}

/** PUT /api/devices/{id} — update an allowed device (serial is immutable). */
export async function updateDevice(id: string, body: UpdateAllowedDeviceRequest): Promise<AllowedDevice> {
  const { data } = await apiClient.put<AllowedDevice>(`/api/devices/${id}`, body)
  return data
}

/** DELETE /api/devices/{id} — soft-delete an allowed device. */
export async function deleteDevice(id: string): Promise<void> {
  await apiClient.delete(`/api/devices/${id}`)
}
