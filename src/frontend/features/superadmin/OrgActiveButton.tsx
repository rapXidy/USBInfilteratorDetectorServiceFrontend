import { useState } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSetOrganizationActive } from '@/backend/hooks/useSuperAdmin'
import type { SuperAdminOrganization } from '@/backend/types'
import { Button } from '@/frontend/components/ui/button'
import { ConfirmDialog } from '@/frontend/components/ConfirmDialog'

/**
 * Activate / deactivate button with confirmation.
 * POST /api/superadmin/organizations/{id}/activate|deactivate.
 */
export function OrgActiveButton({ org, size = 'sm' }: { org: SuperAdminOrganization; size?: 'sm' | 'default' }) {
  const [open, setOpen] = useState(false)
  const mutation = useSetOrganizationActive()
  const target = !org.isActive // desired state after the action

  return (
    <>
      <Button
        size={size}
        variant={target ? 'outline' : 'destructive'}
        onClick={() => setOpen(true)}
        aria-label={`${target ? 'Activate' : 'Deactivate'} ${org.name}`}
      >
        {target ? <Power className="h-4 w-4" aria-hidden="true" /> : <PowerOff className="h-4 w-4" aria-hidden="true" />}
        {target ? 'Activate' : 'Deactivate'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) mutation.reset()
        }}
        title={`${target ? 'Activate' : 'Deactivate'} ${org.name}?`}
        description={
          target
            ? 'Auditors will be able to sign in again and the Worker API key will be accepted.'
            : 'Auditors will be unable to sign in and Worker ingest for this organization will be rejected until reactivated.'
        }
        confirmLabel={target ? 'Activate' : 'Deactivate'}
        destructive={!target}
        loading={mutation.isPending}
        error={mutation.error}
        onConfirm={() =>
          mutation.mutate(
            { id: org.id, active: target },
            {
              onSuccess: () => {
                toast.success(`${org.name} ${target ? 'activated' : 'deactivated'}`)
                setOpen(false)
              },
            },
          )
        }
      />
    </>
  )
}
