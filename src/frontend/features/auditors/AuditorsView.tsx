import { useState } from 'react'
import { Pencil, Plus, UserX, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuditorUsers, useDeactivateAuditorUser } from '@/backend/hooks/useAuditorUsers'
import { AuditorRole, auditorRoleLabel } from '@/backend/types'
import type { AuditorUser } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@/frontend/components/ui/button'
import { Card } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/components/ui/table'
import { ConfirmDialog } from '@/frontend/components/ConfirmDialog'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { formatDate, formatDateTime } from '@/frontend/lib/date'
import { useAuthStore } from '@/frontend/store/authStore'
import { AuditorFormDialog } from './AuditorFormDialog'

/** Auditor users management (Admin only): list, create, edit role/status/password, deactivate. */
export function AuditorsView() {
  const users = useAuditorUsers()
  const deactivate = useDeactivateAuditorUser()
  const currentAuditorId = useAuthStore((s) => s.auditorId)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AuditorUser | null>(null)
  const [deactivating, setDeactivating] = useState<AuditorUser | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const addButton = (
    <Button onClick={openCreate}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add auditor user
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Auditor users"
        description="People who can sign in to this organization. Passwords are never displayed."
        actions={addButton}
      />

      <Card className="overflow-hidden">
        {users.isLoading ? (
          <div className="space-y-3 p-4" role="status" aria-label="Loading auditor users">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.isError ? (
          <div className="p-4">
            <ErrorState error={users.error} title="Could not load auditor users" onRetry={() => void users.refetch()} />
          </div>
        ) : (users.data ?? []).length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Users} title="No auditor users" description="Add the first person who should access the dashboard." action={addButton} />
          </div>
        ) : (
          <Table>
            <caption className="sr-only">Auditor users</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data!.map((u) => {
                const isSelf = u.id === currentAuditorId
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">
                        {u.displayName}
                        {isSelf && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.username}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === AuditorRole.Admin ? 'default' : 'secondary'}>{auditorRoleLabel[u.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'success' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${u.username}`}
                          onClick={() => {
                            setEditing(u)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={!u.isActive || isSelf}
                          title={isSelf ? 'You cannot deactivate your own account' : undefined}
                          aria-label={`Deactivate ${u.username}`}
                          onClick={() => setDeactivating(u)}
                        >
                          <UserX className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <AuditorFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(o) => {
          if (!o) {
            setDeactivating(null)
            deactivate.reset()
          }
        }}
        title="Deactivate auditor user?"
        description={
          <>
            <span className="font-semibold">{deactivating?.username}</span> will no longer be able to sign in. The last active
            Admin cannot be deactivated.
          </>
        }
        confirmLabel="Deactivate"
        destructive
        loading={deactivate.isPending}
        error={deactivate.error}
        onConfirm={() =>
          deactivating &&
          deactivate.mutate(deactivating.id, {
            onSuccess: () => {
              toast.success('User deactivated')
              setDeactivating(null)
            },
          })
        }
      />
    </>
  )
}
