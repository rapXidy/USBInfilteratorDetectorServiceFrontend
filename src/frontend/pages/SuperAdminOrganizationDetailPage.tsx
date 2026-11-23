import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSuperAdminOrganization } from '@/backend/hooks/useSuperAdmin'
import { parseApiError } from '@/backend/http/error'
import { OnboardingStatus, onboardingStatusLabel } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { formatDateTime } from '@/frontend/lib/date'
import { OrgActiveButton } from '@/frontend/features/superadmin/OrgActiveButton'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children || '—'}</dd>
    </div>
  )
}

/** /superadmin/organizations/:id — organization detail with activate/deactivate. Never shows the raw API key (prefix only). */
export default function SuperAdminOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const org = useSuperAdminOrganization(id)

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
      <Link to="/superadmin/organizations">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to organizations
      </Link>
    </Button>
  )

  if (org.isLoading) {
    return (
      <>
        {back}
        <div role="status" aria-label="Loading organization">
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    )
  }
  if (org.isError || !org.data) {
    const notFound = parseApiError(org.error).status === 404
    return (
      <>
        {back}
        {notFound ? (
          <EmptyState title="Organization not found" />
        ) : (
          <ErrorState error={org.error} title="Could not load organization" onRetry={() => void org.refetch()} />
        )}
      </>
    )
  }

  const o = org.data
  return (
    <>
      {back}
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{o.name}</h1>
            <CardDescription className="mt-1">{o.email}</CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={o.isActive ? 'success' : 'secondary'}>{o.isActive ? 'Active' : 'Inactive'}</Badge>
              <Badge variant={o.onboardingStatus === OnboardingStatus.Completed ? 'outline' : 'warning'}>
                Onboarding: {onboardingStatusLabel[o.onboardingStatus]}
              </Badge>
            </div>
          </div>
          <OrgActiveButton org={o} size="default" />
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-4 text-base">Details</CardTitle>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label="Organization ID">
              <span className="font-mono text-xs">{o.id}</span>
            </Field>
            <Field label="CorpCode">{o.corpCode && <code className="rounded bg-muted px-2 py-0.5 font-mono">{o.corpCode}</code>}</Field>
            <Field label="Worker API key prefix">
              {o.apiKeyPrefix && <code className="rounded bg-muted px-2 py-0.5 font-mono">{o.apiKeyPrefix}…</code>}
            </Field>
            <Field label="Created">{formatDateTime(o.createdAt)}</Field>
            <Field label="Onboarding completed">{formatDateTime(o.onboardingCompletedAt)}</Field>
          </dl>
        </CardContent>
      </Card>
    </>
  )
}
