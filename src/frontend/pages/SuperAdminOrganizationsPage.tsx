import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, Search } from 'lucide-react'
import { useSuperAdminOrganizations } from '@/backend/hooks/useSuperAdmin'
import { OnboardingStatus, onboardingStatusLabel } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Card } from '@/frontend/components/ui/card'
import { Input } from '@/frontend/components/ui/input'
import { Label } from '@/frontend/components/ui/label'
import { Select } from '@/frontend/components/ui/select'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/components/ui/table'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { formatDate } from '@/frontend/lib/date'
import { OrgActiveButton } from '@/frontend/features/superadmin/OrgActiveButton'

type ActiveFilter = 'all' | 'active' | 'inactive'

/** /superadmin/organizations — list organizations; server-side `isActive` filter, client-side text search. */
export default function SuperAdminOrganizationsPage() {
  const [filter, setFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')
  const orgs = useSuperAdminOrganizations(filter === 'all' ? undefined : filter === 'active')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const data = orgs.data ?? []
    if (!q) return data
    return data.filter((o) => [o.name, o.email, o.corpCode ?? ''].some((v) => v.toLowerCase().includes(q)))
  }, [orgs.data, search])

  return (
    <>
      <PageHeader title="Organizations" description="All tenant organizations on the platform." />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div className="space-y-1.5">
            <Label htmlFor="org-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="org-search"
                className="pl-9"
                placeholder="Name, email or CorpCode"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org-filter">Status</Label>
            <Select id="org-filter" value={filter} onChange={(e) => setFilter(e.target.value as ActiveFilter)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {orgs.isLoading ? (
          <div className="space-y-3 p-4" role="status" aria-label="Loading organizations">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orgs.isError ? (
          <div className="p-4">
            <ErrorState error={orgs.error} title="Could not load organizations" onRetry={() => void orgs.refetch()} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Building2} title="No organizations found" description="Try changing the status filter or search text." />
          </div>
        ) : (
          <Table>
            <caption className="sr-only">Organizations</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Organization</TableHead>
                <TableHead>CorpCode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link to={`/superadmin/organizations/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                      {o.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{o.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{o.corpCode ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={o.isActive ? 'success' : 'secondary'}>{o.isActive ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.onboardingStatus === OnboardingStatus.Completed ? 'outline' : 'warning'}>
                      {onboardingStatusLabel[o.onboardingStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <OrgActiveButton org={o} />
                      <Link
                        to={`/superadmin/organizations/${o.id}`}
                        className="inline-flex items-center text-sm font-medium text-primary"
                        aria-label={`View details for ${o.name}`}
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}
