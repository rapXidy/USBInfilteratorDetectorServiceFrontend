import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDevice, deleteDevice, listDevices, updateDevice } from '../services/devicesService'
import { queryKeys } from '../queryKeys'
import type { AllowedDevice, CreateAllowedDeviceRequest, UpdateAllowedDeviceRequest } from '../types'

/** Query for GET /api/devices — allowed devices list. */
export function useDevices() {
  return useQuery<AllowedDevice[]>({ queryKey: queryKeys.devices.all, queryFn: listDevices })
}

/** Mutation for POST /api/devices; refreshes the list and dashboard counts on success. */
export function useCreateDevice() {
  const qc = useQueryClient()
  return useMutation<AllowedDevice, unknown, CreateAllowedDeviceRequest>({
    mutationFn: createDevice,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.devices.all })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary })
    },
  })
}

/** Mutation for PUT /api/devices/{id}. */
export function useUpdateDevice() {
  const qc = useQueryClient()
  return useMutation<AllowedDevice, unknown, { id: string; body: UpdateAllowedDeviceRequest }>({
    mutationFn: ({ id, body }) => updateDevice(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.devices.all })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary })
    },
  })
}

/** Mutation for DELETE /api/devices/{id} (soft delete). */
export function useDeleteDevice() {
  const qc = useQueryClient()
  return useMutation<void, unknown, string>({
    mutationFn: deleteDevice,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.devices.all })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.summary })
    },
  })
}
