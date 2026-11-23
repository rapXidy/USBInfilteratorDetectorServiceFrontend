import { useState } from 'react'
import { Pencil, Plus, Trash2, Usb } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteDevice, useDevices } from '@/backend/hooks/useDevices'
import type { AllowedDevice } from '@/backend/types'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@/frontend/components/ui/button'
import { Card } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/components/ui/table'
import { ConfirmDialog } from '@/frontend/components/ConfirmDialog'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { formatDate } from '@/frontend/lib/date'
import { DeviceFormDialog } from './DeviceFormDialog'

/** Allowed devices CRUD (Admin / Auditor): list, add, edit, soft-delete. */
export function DevicesView() {
  const devices = useDevices()
  const remove = useDeleteDevice()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AllowedDevice | null>(null)
  const [deleting, setDeleting] = useState<AllowedDevice | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (d: AllowedDevice) => {
    setEditing(d)
    setFormOpen(true)
  }

  const addButton = (
    <Button onClick={openCreate}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add device
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Allowed devices"
        description="Approved USB device serials. Sessions from devices not on this list are treated as unapproved."
        actions={addButton}
      />

      <Card className="overflow-hidden">
        {devices.isLoading ? (
          <div className="space-y-3 p-4" role="status" aria-label="Loading devices">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : devices.isError ? (
          <div className="p-4">
            <ErrorState error={devices.error} title="Could not load devices" onRetry={() => void devices.refetch()} />
          </div>
        ) : (devices.data ?? []).length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Usb} title="No allowed devices yet" description="Add the serial numbers of USB drives your organization trusts." action={addButton} />
          </div>
        ) : (
          <Table>
            <caption className="sr-only">Allowed USB devices</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Serial</TableHead>
                <TableHead>Vendor / model</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.data!.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.deviceSerial}</TableCell>
                  <TableCell>{[d.vendor, d.model].filter(Boolean).join(' ') || '—'}</TableCell>
                  <TableCell className="max-w-[16rem] truncate" title={d.description ?? undefined}>
                    {d.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)} aria-label={`Edit device ${d.deviceSerial}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(d)}
                        aria-label={`Delete device ${d.deviceSerial}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <DeviceFormDialog open={formOpen} onOpenChange={setFormOpen} device={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) {
            setDeleting(null)
            remove.reset()
          }
        }}
        title="Delete allowed device?"
        description={
          <>
            Device <span className="font-mono font-semibold">{deleting?.deviceSerial}</span> will be removed from the allowed list
            (soft delete). Future sessions with it will be treated as unapproved.
          </>
        }
        confirmLabel="Delete device"
        destructive
        loading={remove.isPending}
        error={remove.error}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Device deleted')
              setDeleting(null)
            },
          })
        }
      />
    </>
  )
}
