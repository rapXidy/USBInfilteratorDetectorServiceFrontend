import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLoginMutation } from '@/backend/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  corpCode: z.string().trim().min(1, 'CorpCode is required'),
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

/** Auditor sign-in form (CorpCode + username + password) → POST /api/auth/login. */
export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const login = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { corpCode: '', username: '', password: '' } })

  const onSubmit = handleSubmit((values) => {
    login.mutate(
      { ...values, corpCode: values.corpCode.trim() },
      {
        onSuccess: () => {
          toast.success('Signed in')
          navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
        },
      },
    )
  })

  return (
    <div>
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Sign in to your organization</h1>
        <p className="text-sm text-slate-600">
          Use the CorpCode you received when onboarding, plus your auditor credentials.
        </p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormError error={login.error} />
        <FormField id="corpCode" label="CorpCode" error={errors.corpCode?.message}>
          <Input {...register('corpCode')} {...fieldA11y('corpCode', errors.corpCode?.message)} autoComplete="organization" autoCapitalize="characters" />
        </FormField>
        <FormField id="username" label="Username" error={errors.username?.message}>
          <Input {...register('username')} {...fieldA11y('username', errors.username?.message)} autoComplete="username" />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input
            type="password"
            {...register('password')}
            {...fieldA11y('password', errors.password?.message)}
            autoComplete="current-password"
          />
        </FormField>
        <Button type="submit" className="w-full bg-[#031e37] text-white hover:bg-[#052a4d]" loading={login.isPending}>
          Sign in
        </Button>
      </form>
      <div className="mt-6 space-y-1 text-center text-sm text-slate-600">
        <p>
          New organization?{' '}
          <Link to="/onboarding" className="font-medium text-[#031e37] underline-offset-4 hover:underline">
            Start onboarding
          </Link>
        </p>
        <p>
          <Link to="/superadmin/login" className="underline-offset-4 hover:underline">
            Platform administrator sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
