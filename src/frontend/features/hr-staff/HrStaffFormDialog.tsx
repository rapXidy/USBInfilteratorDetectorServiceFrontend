import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreateHrStaff, useUpdateHrStaff } from '@/backend/hooks/useHrStaff'
import type { HrStaff } from '@/backend/types'
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
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  department: z.string().trim().min(1, 'Department is required'),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  jobTitle: z.string().optional(),
  employeeNumber: z.string().optional(),
  windowsUsername: z.string().optional(),
  deviceId: z.string().optional(),
  dateEmployed: z.string().min(1, 'Date employed is required'),
  dateOfResignation: z.string().optional(),
  dateOfExit: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface HrStaffFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: HrStaff | null
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function toIsoDate(value: string | undefined): string | null {
  if (!value?.trim()) return null
  return `${value.trim()}T00:00:00.000Z`
}

/** Create or edit an HR staff member (Admin only). */
export function HrStaffFormDialog({ open, onOpenChange, staff }: HrStaffFormDialogProps) {
  const editing = !!staff
  const create = useCreateHrStaff()
  const update = useUpdateHrStaff()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      department: '',
      phoneNumber: '',
      email: '',
      jobTitle: '',
      employeeNumber: '',
      windowsUsername: '',
      deviceId: '',
      dateEmployed: '',
      dateOfResignation: '',
      dateOfExit: '',
      isActive: true,
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      fullName: staff?.fullName ?? '',
      department: staff?.department ?? '',
      phoneNumber: staff?.phoneNumber ?? '',
      email: staff?.email ?? '',
      jobTitle: staff?.jobTitle ?? '',
      employeeNumber: staff?.employeeNumber ?? '',
      windowsUsername: staff?.windowsUsername ?? '',
      deviceId: staff?.deviceId ?? '',
      dateEmployed: toDateInput(staff?.dateEmployed) || new Date().toISOString().slice(0, 10),
      dateOfResignation: toDateInput(staff?.dateOfResignation),
      dateOfExit: toDateInput(staff?.dateOfExit),
      isActive: staff?.isActive ?? true,
      notes: staff?.notes ?? '',
    })
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff, reset])

  const onSubmit = handleSubmit((v) => {
    const done = () => {
      toast.success(editing ? 'HR staff updated' : 'HR staff created')
      onOpenChange(false)
    }

    if (editing && staff) {
      update.mutate(
        {
          id: staff.id,
          body: {
            fullName: v.fullName,
            department: v.department,
            phoneNumber: v.phoneNumber || null,
            email: v.email || null,
            jobTitle: v.jobTitle || null,
            employeeNumber: v.employeeNumber || null,
            windowsUsername: v.windowsUsername || null,
            deviceId: v.deviceId || null,
            dateEmployed: toIsoDate(v.dateEmployed)!,
            dateOfResignation: toIsoDate(v.dateOfResignation),
            dateOfExit: toIsoDate(v.dateOfExit),
            isActive: v.isActive,
            notes: v.notes || null,
          },
        },
        { onSuccess: done },
      )
    } else {
      create.mutate(
        {
          fullName: v.fullName,
          department: v.department,
          phoneNumber: v.phoneNumber || null,
          email: v.email || null,
          jobTitle: v.jobTitle || null,
          employeeNumber: v.employeeNumber || null,
          windowsUsername: v.windowsUsername || null,
          deviceId: v.deviceId || null,
          dateEmployed: toIsoDate(v.dateEmployed)!,
          dateOfResignation: toIsoDate(v.dateOfResignation),
          dateOfExit: toIsoDate(v.dateOfExit),
          notes: v.notes || null,
        },
        { onSuccess: done },
      )
    }
  })

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit HR staff' : 'Add HR staff'}</DialogTitle>
          <DialogDescription>
            Track employees and correlate USB sessions for resigning leavers via Windows username or host DeviceId.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormError error={editing ? update.error : create.error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
              <Input {...register('fullName')} {...fieldA11y('fullName', errors.fullName?.message)} />
            </FormField>
            <FormField id="department" label="Department" error={errors.department?.message}>
              <Input {...register('department')} {...fieldA11y('department', errors.department?.message)} />
            </FormField>
            <FormField id="jobTitle" label="Job title" error={errors.jobTitle?.message}>
              <Input {...register('jobTitle')} {...fieldA11y('jobTitle', errors.jobTitle?.message)} />
            </FormField>
            <FormField id="employeeNumber" label="Employee number" error={errors.employeeNumber?.message}>
              <Input {...register('employeeNumber')} {...fieldA11y('employeeNumber', errors.employeeNumber?.message)} />
            </FormField>
            <FormField id="phoneNumber" label="Phone" error={errors.phoneNumber?.message}>
              <Input {...register('phoneNumber')} {...fieldA11y('phoneNumber', errors.phoneNumber?.message)} />
            </FormField>
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} {...fieldA11y('email', errors.email?.message)} />
            </FormField>
            <FormField id="windowsUsername" label="Windows username" error={errors.windowsUsername?.message}>
              <Input
                {...register('windowsUsername')}
                {...fieldA11y('windowsUsername', errors.windowsUsername?.message)}
                placeholder="DOMAIN\\user"
              />
            </FormField>
            <FormField id="deviceId" label="Host DeviceId" error={errors.deviceId?.message}>
              <Input {...register('deviceId')} {...fieldA11y('deviceId', errors.deviceId?.message)} />
            </FormField>
            <FormField id="dateEmployed" label="Date employed" error={errors.dateEmployed?.message}>
              <Input type="date" {...register('dateEmployed')} {...fieldA11y('dateEmployed', errors.dateEmployed?.message)} />
            </FormField>
            <FormField id="dateOfResignation" label="Date of resignation" error={errors.dateOfResignation?.message}>
              <Input
                type="date"
                {...register('dateOfResignation')}
                {...fieldA11y('dateOfResignation', errors.dateOfResignation?.message)}
              />
            </FormField>
            <FormField id="dateOfExit" label="Date of exit" error={errors.dateOfExit?.message}>
              <Input type="date" {...register('dateOfExit')} {...fieldA11y('dateOfExit', errors.dateOfExit?.message)} />
            </FormField>
            {editing && (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
                <span className="text-sm font-medium">Active on roster</span>
                <Switch checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v)} />
              </div>
            )}
            <div className="sm:col-span-2">
              <FormField id="notes" label="Notes" error={errors.notes?.message}>
                <Input {...register('notes')} {...fieldA11y('notes', errors.notes?.message)} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
