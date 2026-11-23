import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { useHrStaffSummary } from '@/backend/hooks/useHrStaff'
import { useMyOrganization } from '@/backend/hooks/useTenant'
import { OnboardingStatus, onboardingStatusLabel } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { useAuthStore } from '@/frontend/store/authStore'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children || '—'}</dd>
    </div>
  )
}

/** /organization — read-only organization profile plus HR staff summary. */
export default function OrganizationPage() {
  const org = useMyOrganization()
  const hrSummary = useHrStaffSummary()
  const role = useAuthStore((s) => s.role)
  const canOpenHrStaff = role === 'Admin' || role === 'Auditor'

  return (
    <>
      <PageHeader title="Organization" description="Your organization profile (read-only)." />
      {org.isLoading ? (
        <div role="status" aria-label="Loading organization">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : org.isError || !org.data ? (
        <ErrorState error={org.error} title="Could not load organization" onRetry={() => void org.refetch()} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">{org.data.name}</CardTitle>
                <CardDescription className="mt-1">{org.data.email}</CardDescription>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant={org.data.isActive ? 'success' : 'destructive'}>{org.data.isActive ? 'Active' : 'Inactive'}</Badge>
                <Badge variant={org.data.onboardingStatus === OnboardingStatus.Completed ? 'secondary' : 'warning'}>
                  Onboarding: {onboardingStatusLabel[org.data.onboardingStatus]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="CorpCode">
                  {org.data.corpCode && <code className="rounded bg-muted px-2 py-0.5 font-mono">{org.data.corpCode}</code>}
                </Field>
                <Field label="Worker API key prefix">
                  {org.data.apiKeyPrefix && <code className="rounded bg-muted px-2 py-0.5 font-mono">{org.data.apiKeyPrefix}…</code>}
                </Field>
                <Field label="Phone">{org.data.phone}</Field>
                <Field label="Sector">{org.data.sector}</Field>
                <div className="sm:col-span-2">
                  <Field label="Office address">{org.data.officeAddress}</Field>
                </div>
              </dl>
              <p className="mt-6 text-xs text-muted-foreground">
                The full API key is shown only once during onboarding and cannot be retrieved later.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>HR Staff &amp; leavers</CardTitle>
                  <CardDescription className="mt-1">
                    Monitor resigning employees and their correlated USB sessions.
                  </CardDescription>
                </div>
              </div>
              {canOpenHrStaff && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/hr-staff">Manage HR Staff</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {hrSummary.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : hrSummary.isError ? (
                <ErrorState
                  error={hrSummary.error}
                  title="Could not load HR summary"
                  onRetry={() => void hrSummary.refetch()}
                />
              ) : (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <dt className="text-sm text-muted-foreground">Resigning staff</dt>
                    <dd className="mt-1 text-2xl font-semibold">{hrSummary.data?.resigningCount ?? 0}</dd>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <dt className="text-sm text-muted-foreground">Leaver USB sessions (30 days)</dt>
                    <dd className="mt-1 text-2xl font-semibold">{hrSummary.data?.recentLeaverSessionCount ?? 0}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
