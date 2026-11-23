import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateOrganization,
  deactivateOrganization,
  getOrganization,
  listOrganizations,
} from '../services/superAdminService'
import { queryKeys } from '../queryKeys'
import type { SuperAdminOrganization } from '../types'

/** Query for GET /api/superadmin/organizations?isActive= (undefined = all). */
export function useSuperAdminOrganizations(isActive?: boolean) {
  return useQuery<SuperAdminOrganization[]>({
    queryKey: queryKeys.superAdmin.orgs(isActive),
    queryFn: () => listOrganizations(isActive),
  })
}

/** Query for GET /api/superadmin/organizations/{id}. */
export function useSuperAdminOrganization(id: string | undefined) {
  return useQuery<SuperAdminOrganization>({
    queryKey: queryKeys.superAdmin.org(id ?? ''),
    queryFn: () => getOrganization(id as string),
    enabled: !!id,
  })
}

/** Mutation for POST /api/superadmin/organizations/{id}/activate|deactivate. */
export function useSetOrganizationActive() {
  const qc = useQueryClient()
  return useMutation<SuperAdminOrganization, unknown, { id: string; active: boolean }>({
    mutationFn: ({ id, active }) => (active ? activateOrganization(id) : deactivateOrganization(id)),
    onSuccess: (org) => {
      qc.setQueryData(queryKeys.superAdmin.org(org.id), org)
      void qc.invalidateQueries({ queryKey: queryKeys.superAdmin.orgsAll })
    },
  })
}
