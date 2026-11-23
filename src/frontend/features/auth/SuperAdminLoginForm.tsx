import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSuperAdminLoginMutation } from '@/backend/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

/** Platform SuperAdmin sign-in → POST /api/superadmin/auth/login. */
export function SuperAdminLoginForm() {
  const navigate = useNavigate()
  const login = useSuperAdminLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: '', password: '' } })

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        toast.success('Signed in as platform administrator')
        navigate('/superadmin/organizations', { replace: true })
      },
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Platform administrator</CardTitle>
        <CardDescription>Sign in to manage organizations across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormError error={login.error} />
          <FormField id="sa-username" label="Username" error={errors.username?.message}>
            <Input {...register('username')} {...fieldA11y('sa-username', errors.username?.message)} autoComplete="username" />
          </FormField>
          <FormField id="sa-password" label="Password" error={errors.password?.message}>
            <Input
              type="password"
              {...register('password')}
              {...fieldA11y('sa-password', errors.password?.message)}
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" className="w-full" loading={login.isPending}>
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="underline-offset-4 hover:underline">
            Back to organization sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
