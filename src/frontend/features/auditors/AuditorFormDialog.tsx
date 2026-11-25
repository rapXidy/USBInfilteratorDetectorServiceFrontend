import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCreateAuditorUser, useUpdateAuditorUser } from '@/backend/hooks/useAuditorUsers'
import { AuditorRole, auditorRoleLabel } from '@/backend/types'
import type { AuditorUser } from '@/backend/types'
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
import { Label } from '@/frontend/components/ui/label'
import { Select } from '@/frontend/components/ui/select'
import { Switch } from '@/frontend/components/ui/switch'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  displayName: z.string().trim().min(1, 'Display name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['0', '1', '2']),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface AuditorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, edit this user; otherwise create. */
  user?: AuditorUser | null
}

/**
 * Create or edit an auditor user. Create emails a temporary password; password resets use the list action.
 */
export function AuditorFormDialog({ open, onOpenChange, user }: AuditorFormDialogProps) {
  const editing = !!user
  const create = useCreateAuditorUser()
  const update = useUpdateAuditorUser()
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
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      role: String(AuditorRole.Auditor) as FormValues['role'],
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        username: user?.username ?? '',
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        role: String(user?.role ?? AuditorRole.Auditor) as FormValues['role'],
        isActive: user?.isActive ?? true,
      })
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, reset])

  const onSubmit = handleSubmit((v) => {
    const role = Number(v.role) as AuditorRole
    const email = v.email.trim()
    const done = () => {
      toast.success(
        editing
          ? 'Auditor user updated'
          : 'Auditor user created — temporary password sent by email',
      )
      onOpenChange(false)
    }

    if (editing && user) {
      update.mutate(
        { id: user.id, body: { displayName: v.displayName, role, isActive: v.isActive, email } },
        { onSuccess: done },
      )
      return
    }

    create.mutate({ username: v.username, displayName: v.displayName, role, email }, { onSuccess: done })
  })

  const isActive = watch('isActive')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit auditor user' : 'Add auditor user'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update profile, role, or active status. Use “Email temporary password” on the list to reset credentials.'
              : 'A temporary password is generated and emailed to the auditor. Passwords are never shown here.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormError error={mutation.error} />
          <FormField id="a-username" label="Username" error={errors.username?.message}>
            <Input
              {...register('username')}
              {...fieldA11y('a-username', errors.username?.message)}
              readOnly={editing}
              className={editing ? 'bg-muted' : undefined}
              autoComplete="off"
            />
          </FormField>
          <FormField id="a-display" label="Display name" error={errors.displayName?.message}>
            <Input {...register('displayName')} {...fieldA11y('a-display', errors.displayName?.message)} />
          </FormField>
          <FormField
            id="a-email"
            label="Email"
            hint={editing ? 'Used for alerts and password resets.' : 'Required — temporary password is sent here.'}
            error={errors.email?.message}
          >
            <Input type="email" {...register('email')} {...fieldA11y('a-email', errors.email?.message)} autoComplete="email" />
          </FormField>
          <FormField id="a-role" label="Role" error={errors.role?.message}>
            <Select {...register('role')} {...fieldA11y('a-role', errors.role?.message)}>
              {Object.values(AuditorRole).map((r) => (
                <option key={r} value={String(r)}>
                  {auditorRoleLabel[r]}
                </option>
              ))}
            </Select>
          </FormField>
          {editing && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="a-active">Active</Label>
              <Switch id="a-active" checked={isActive} onCheckedChange={(c) => setValue('isActive', c, { shouldDirty: true })} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Save changes' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
