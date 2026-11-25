import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAuditorUser,
  deactivateAuditorUser,
  listAuditorUsers,
  resetAuditorUserPassword,
  updateAuditorUser,
} from '../services/auditorUsersService'
import { queryKeys } from '../queryKeys'
import type { AuditorUser, CreateAuditorUserRequest, UpdateAuditorUserRequest } from '../types'

/** Query for GET /api/auditor-users (Admin only). */
export function useAuditorUsers() {
  return useQuery<AuditorUser[]>({ queryKey: queryKeys.auditorUsers.all, queryFn: listAuditorUsers })
}

/** Mutation for POST /api/auditor-users. */
export function useCreateAuditorUser() {
  const qc = useQueryClient()
  return useMutation<AuditorUser, unknown, CreateAuditorUserRequest>({
    mutationFn: createAuditorUser,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.auditorUsers.all }),
  })
}

/** Mutation for PUT /api/auditor-users/{id}. */
export function useUpdateAuditorUser() {
  const qc = useQueryClient()
  return useMutation<AuditorUser, unknown, { id: string; body: UpdateAuditorUserRequest }>({
    mutationFn: ({ id, body }) => updateAuditorUser(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.auditorUsers.all }),
  })
}

/** Mutation for POST /api/auditor-users/{id}/reset-password. */
export function useResetAuditorUserPassword() {
  return useMutation<void, unknown, string>({
    mutationFn: resetAuditorUserPassword,
  })
}

/** Mutation for DELETE /api/auditor-users/{id} (soft deactivation). */
export function useDeactivateAuditorUser() {
  const qc = useQueryClient()
  return useMutation<void, unknown, string>({
    mutationFn: deactivateAuditorUser,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.auditorUsers.all }),
  })
}
