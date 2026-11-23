import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createHrStaff,
  deactivateHrStaff,
  getHrStaffSummary,
  listHrStaff,
  listLeaverSessions,
  updateHrStaff,
} from '../services/hrStaffService'
import { queryKeys } from '../queryKeys'
import type {
  CreateHrStaffRequest,
  HrStaff,
  HrStaffLeaverSession,
  HrStaffListQuery,
  HrStaffSummary,
  UpdateHrStaffRequest,
} from '../types'

/** Query for GET /api/hr-staff. */
export function useHrStaffList(query: HrStaffListQuery = {}) {
  return useQuery<HrStaff[]>({
    queryKey: queryKeys.hrStaff.list(query),
    queryFn: () => listHrStaff(query),
  })
}

/** Query for GET /api/hr-staff/summary. */
export function useHrStaffSummary() {
  return useQuery<HrStaffSummary>({
    queryKey: queryKeys.hrStaff.summary,
    queryFn: getHrStaffSummary,
  })
}

/** Query for GET /api/hr-staff/leavers/sessions. */
export function useLeaverSessions(includeExited = false) {
  return useQuery<HrStaffLeaverSession[]>({
    queryKey: queryKeys.hrStaff.leaverSessions(includeExited),
    queryFn: () => listLeaverSessions({ includeExited, take: 50 }),
  })
}

/** Mutation for POST /api/hr-staff. */
export function useCreateHrStaff() {
  const qc = useQueryClient()
  return useMutation<HrStaff, unknown, CreateHrStaffRequest>({
    mutationFn: createHrStaff,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.hrStaff.all })
    },
  })
}

/** Mutation for PUT /api/hr-staff/{id}. */
export function useUpdateHrStaff() {
  const qc = useQueryClient()
  return useMutation<HrStaff, unknown, { id: string; body: UpdateHrStaffRequest }>({
    mutationFn: ({ id, body }) => updateHrStaff(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.hrStaff.all })
    },
  })
}

/** Mutation for DELETE /api/hr-staff/{id}. */
export function useDeactivateHrStaff() {
  const qc = useQueryClient()
  return useMutation<void, unknown, string>({
    mutationFn: deactivateHrStaff,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.hrStaff.all })
    },
  })
}
