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
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Enter a valid email'),
  // Selects deliver strings; converted to the numeric enum on submit.
  role: z.enum(['0', '1', '2']),
  password: z.string().optional(),
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
 * Create (POST /auditor-users) or edit (PUT /auditor-users/{id}) an auditor user.
 * Roles are sent as numbers (0 Admin, 1 Auditor, 2 Viewer). On edit, a password is optional (reset).
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
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      role: String(AuditorRole.Auditor) as FormValues['role'],
      password: '',
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
        password: '',
        isActive: user?.isActive ?? true,
      })
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, reset])

  const onSubmit = handleSubmit((v) => {
    const role = Number(v.role) as AuditorRole
    const password = v.password?.trim() ? v.password : ''
    if (password && password.length < 8) {
      setError('password', { message: 'Password must be at least 8 characters' })
      return
    }
    const done = () => {
      toast.success(editing ? 'Auditor user updated' : 'Auditor user created')
      onOpenChange(false)
    }
    const email = v.email?.trim() ? v.email.trim() : null
    if (editing && user) {
      update.mutate(
        { id: user.id, body: { displayName: v.displayName, role, isActive: v.isActive, password: password || null, email } },
        { onSuccess: done },
      )
    } else {
      if (!password) {
        setError('password', { message: 'Password must be at least 8 characters' })
        return
      }
      create.mutate({ username: v.username, displayName: v.displayName, role, password, email }, { onSuccess: done })
    }
  })

  const isActive = watch('isActive')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit auditor user' : 'Add auditor user'}</DialogTitle>
          <DialogDescription>Users who can sign in to this organization&apos;s dashboard.</DialogDescription>
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
            label="Email (optional)"
            hint="Used for welcome and high-risk USB alerts."
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
          <FormField
            id="a-password"
            label={editing ? 'New password (optional)' : 'Password'}
            hint={editing ? 'Leave blank to keep the current password. Minimum 8 characters.' : 'Minimum 8 characters.'}
            error={errors.password?.message}
          >
            <Input type="password" {...register('password')} {...fieldA11y('a-password', errors.password?.message)} autoComplete="new-password" />
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
