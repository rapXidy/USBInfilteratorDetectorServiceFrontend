import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useChangePasswordMutation } from '@/backend/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'
import { PageHeader } from '@/frontend/components/PageHeader'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type FormValues = z.infer<typeof schema>

/** /change-password — authenticated auditor password change. */
export default function ChangePasswordPage() {
  const change = useChangePasswordMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit((values) => {
    change.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated')
          reset()
        },
      },
    )
  })

  return (
    <>
      <PageHeader title="Change password" description="Update the password for your auditor account." />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">New credentials</CardTitle>
          <CardDescription>Other sessions will need to sign in again after you change your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <FormError error={change.error} />
            <FormField id="cp-current" label="Current password" error={errors.currentPassword?.message}>
              <Input
                type="password"
                {...register('currentPassword')}
                {...fieldA11y('cp-current', errors.currentPassword?.message)}
                autoComplete="current-password"
              />
            </FormField>
            <FormField id="cp-new" label="New password" error={errors.newPassword?.message}>
              <Input
                type="password"
                {...register('newPassword')}
                {...fieldA11y('cp-new', errors.newPassword?.message)}
                autoComplete="new-password"
              />
            </FormField>
            <FormField id="cp-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
              <Input
                type="password"
                {...register('confirmPassword')}
                {...fieldA11y('cp-confirm', errors.confirmPassword?.message)}
                autoComplete="new-password"
              />
            </FormField>
            <Button type="submit" loading={change.isPending}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
