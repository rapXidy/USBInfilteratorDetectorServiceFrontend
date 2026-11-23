import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreateDevice, useUpdateDevice } from '@/backend/hooks/useDevices'
import type { AllowedDevice } from '@/backend/types'
import { Button } from '@/frontend/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/components/ui/dialog'
import { Input } from '@/frontend/components/ui/input'
import { Switch } from '@/frontend/components/ui/switch'
import { Label } from '@/frontend/components/ui/label'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  deviceSerial: z.string().trim().min(1, 'Device serial is required'),
  vendor: z.string().trim().optional(),
  model: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface DeviceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the dialog edits this device; otherwise it creates one. */
  device?: AllowedDevice | null
}

/** Create (POST /devices) or edit (PUT /devices/{id}) an allowed device. The serial is immutable once created. */
export function DeviceFormDialog({ open, onOpenChange, device }: DeviceFormDialogProps) {
  const editing = !!device
  const create = useCreateDevice()
  const update = useUpdateDevice()
  const mutation = editing ? update : create

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deviceSerial: '', vendor: '', model: '', description: '', isActive: true },
  })

  // Reset the form whenever the dialog opens or the target device changes.
  useEffect(() => {
    if (open) {
      reset({
        deviceSerial: device?.deviceSerial ?? '',
        vendor: device?.vendor ?? '',
        model: device?.model ?? '',
        description: device?.description ?? '',
        isActive: device?.isActive ?? true,
      })
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, device, reset])

  const onSubmit = handleSubmit((v) => {
    const common = { vendor: v.vendor || null, model: v.model || null, description: v.description || null }
    const done = () => {
      toast.success(editing ? 'Device updated' : 'Device added')
      onOpenChange(false)
    }
    if (editing && device) {
      update.mutate({ id: device.id, body: { ...common, isActive: v.isActive } }, { onSuccess: done })
    } else {
      create.mutate({ deviceSerial: v.deviceSerial, ...common }, { onSuccess: done })
    }
  })

  const isActive = watch('isActive')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit allowed device' : 'Add allowed device'}</DialogTitle>
          <DialogDescription>
            Allowed devices are USB serials your organization has approved. Sessions with other devices are treated as unapproved.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormError error={mutation.error} />
          <FormField id="d-serial" label="Device serial" error={errors.deviceSerial?.message}>
            <Input
              {...register('deviceSerial')}
              {...fieldA11y('d-serial', errors.deviceSerial?.message)}
              readOnly={editing}
              className={editing ? 'bg-muted font-mono' : 'font-mono'}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="d-vendor" label="Vendor" error={errors.vendor?.message}>
              <Input {...register('vendor')} {...fieldA11y('d-vendor', errors.vendor?.message)} />
            </FormField>
            <FormField id="d-model" label="Model" error={errors.model?.message}>
              <Input {...register('model')} {...fieldA11y('d-model', errors.model?.message)} />
            </FormField>
          </div>
          <FormField id="d-desc" label="Description" error={errors.description?.message}>
            <Input {...register('description')} {...fieldA11y('d-desc', errors.description?.message)} />
          </FormField>
          {editing && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="d-active">Active</Label>
              <Switch id="d-active" checked={isActive} onCheckedChange={(c) => setValue('isActive', c, { shouldDirty: true })} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Save changes' : 'Add device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
