import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Pencil, Plus, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { useDeactivateHrStaff, useHrStaffList, useLeaverSessions } from '@/backend/hooks/useHrStaff'
import { HrStaffStatus, hrStaffStatusLabel } from '@/backend/types'
import type { HrStaff } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Input } from '@/frontend/components/ui/input'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { Switch } from '@/frontend/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/components/ui/table'
import { ConfirmDialog } from '@/frontend/components/ConfirmDialog'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { formatDate, formatDateTime } from '@/frontend/lib/date'
import { useAuthStore } from '@/frontend/store/authStore'
import { HrStaffFormDialog } from './HrStaffFormDialog'

/** HR staff roster + leaver USB session monitoring. */
export function HrStaffView() {
  const role = useAuthStore((s) => s.role)
  const isAdmin = role === 'Admin'
  const [resigningOnly, setResigningOnly] = useState(false)
  const [department, setDepartment] = useState('')
  const [includeExitedSessions, setIncludeExitedSessions] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<HrStaff | null>(null)
  const [deactivating, setDeactivating] = useState<HrStaff | null>(null)

  const query = useMemo(
    () => ({
      resigningOnly: resigningOnly || undefined,
      department: department.trim() || undefined,
    }),
    [resigningOnly, department],
  )

  const staff = useHrStaffList(query)
  const leavers = useLeaverSessions(includeExitedSessions)
  const deactivate = useDeactivateHrStaff()

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const addButton = isAdmin ? (
    <Button onClick={openCreate}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add staff
    </Button>
  ) : null

  return (
    <>
      <PageHeader
        title="HR Staff"
        description="Track employees and monitor USB sessions for staff who have resigned or are leaving."
        actions={addButton}
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Input
          className="max-w-xs"
          placeholder="Filter by department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={resigningOnly} onCheckedChange={setResigningOnly} />
          Resigning only
        </label>
      </div>

      <Card className="mb-6 overflow-hidden">
        {staff.isLoading ? (
          <div className="space-y-3 p-4" role="status" aria-label="Loading HR staff">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : staff.isError ? (
          <div className="p-4">
            <ErrorState error={staff.error} title="Could not load HR staff" onRetry={() => void staff.refetch()} />
          </div>
        ) : (staff.data ?? []).length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Briefcase}
              title="No HR staff"
              description="Add employees so USB activity can be correlated for leavers."
              action={addButton}
            />
          </div>
        ) : (
          <Table>
            <caption className="sr-only">HR staff</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Windows user</TableHead>
                <TableHead>DeviceId</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resignation</TableHead>
                <TableHead>Exit</TableHead>
                {isAdmin && (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.data!.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground">{s.jobTitle || s.employeeNumber || '—'}</div>
                  </TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell className="font-mono text-xs">{s.windowsUsername ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{s.deviceId ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.status === HrStaffStatus.Resigning
                          ? 'warning'
                          : s.status === HrStaffStatus.Exited
                            ? 'secondary'
                            : 'success'
                      }
                    >
                      {hrStaffStatusLabel[s.status]}
                    </Badge>
                    {!s.isActive && (
                      <Badge variant="secondary" className="ml-1">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(s.dateOfResignation)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(s.dateOfExit)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${s.fullName}`}
                          onClick={() => {
                            setEditing(s)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={!s.isActive}
                          aria-label={`Deactivate ${s.fullName}`}
                          onClick={() => setDeactivating(s)}
                        >
                          <UserX className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Leaver USB sessions</CardTitle>
            <CardDescription>
              Sessions matched to resigning staff via Windows username or assigned host DeviceId.
            </CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={includeExitedSessions} onCheckedChange={setIncludeExitedSessions} />
            Include exited
          </label>
        </CardHeader>
        <CardContent className="p-0">
          {leavers.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : leavers.isError ? (
            <div className="p-4">
              <ErrorState error={leavers.error} title="Could not load leaver sessions" onRetry={() => void leavers.refetch()} />
            </div>
          ) : (leavers.data ?? []).length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No matching USB sessions for leavers yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Staff</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Connected</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavers.data!.map((row) => (
                  <TableRow key={`${row.usbSessionId}-${row.staffId}`}>
                    <TableCell>
                      <div className="font-medium">{row.staffFullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.department} · {hrStaffStatusLabel[row.staffStatus]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{row.hostName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{row.loggedInUser ?? '—'}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.deviceSerial}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.connectedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={row.riskScore >= 50 ? 'destructive' : 'secondary'}>{row.riskScore}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/sessions/${row.usbSessionId}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <HrStaffFormDialog open={formOpen} onOpenChange={setFormOpen} staff={editing} />
          <ConfirmDialog
            open={!!deactivating}
            onOpenChange={(open) => !open && setDeactivating(null)}
            title="Deactivate HR staff?"
            description={
              deactivating
                ? `${deactivating.fullName} will be marked inactive but historical session correlation remains.`
                : ''
            }
            confirmLabel="Deactivate"
            destructive
            loading={deactivate.isPending}
            error={deactivate.error}
            onConfirm={() => {
              if (!deactivating) return
              deactivate.mutate(deactivating.id, {
                onSuccess: () => {
                  toast.success('HR staff deactivated')
                  setDeactivating(null)
                },
              })
            }}
          />
        </>
      )}
    </>
  )
}
