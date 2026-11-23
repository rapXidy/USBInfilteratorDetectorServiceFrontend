import type { HrStaffListQuery, SessionsQuery } from './types'

/** Central TanStack Query key factory. Keep keys here so invalidation stays consistent. */
export const queryKeys = {
  organization: { me: ['organization', 'me'] as const },
  dashboard: { summary: ['dashboard', 'summary'] as const },
  alerts: { list: (take: number) => ['alerts', take] as const, all: ['alerts'] as const },
  sessions: {
    all: ['sessions'] as const,
    list: (query: SessionsQuery) => ['sessions', 'list', query] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
  },
  devices: { all: ['devices'] as const },
  auditorUsers: { all: ['auditor-users'] as const },
  hrStaff: {
    all: ['hr-staff'] as const,
    list: (query: HrStaffListQuery) => ['hr-staff', 'list', query] as const,
    summary: ['hr-staff', 'summary'] as const,
    leaverSessions: (includeExited: boolean) => ['hr-staff', 'leaver-sessions', includeExited] as const,
  },
  subscription: { current: ['subscription'] as const },

  onboarding: { status: (id: string) => ['onboarding', id] as const },
  superAdmin: {
    orgs: (isActive?: boolean) => ['superadmin', 'organizations', isActive ?? 'all'] as const,
    orgsAll: ['superadmin', 'organizations'] as const,
    org: (id: string) => ['superadmin', 'organization', id] as const,
  },
}
