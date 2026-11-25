import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useForgotPasswordMutation } from '@/backend/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'
import { LoginHeroPanel } from '@/frontend/features/auth/LoginHeroPanel'

const schema = z.object({
  corpCode: z.string().trim().min(1, 'CorpCode is required'),
  username: z.string().trim().min(1, 'Username is required'),
})
type FormValues = z.infer<typeof schema>

/** /forgot-password — request a temporary password email. */
export default function ForgotPasswordPage() {
  const forgot = useForgotPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { corpCode: '', username: '' } })

  const onSubmit = handleSubmit((values) => {
    forgot.mutate(
      { corpCode: values.corpCode.trim(), username: values.username.trim() },
      {
        onSuccess: (res) => {
          toast.success(res.message)
        },
      },
    )
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 md:justify-end md:px-12 lg:px-20">
      <LoginHeroPanel />

      <div className="relative z-10 w-full max-w-md md:mr-[4vw]">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-white drop-shadow">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#031e37] text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          USB Infilterator Detector
        </div>

        <main id="main-content" className="relative rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Forgot password</h1>
            <p className="text-sm text-slate-600">
              Enter your CorpCode and username. If an account matches and has an email on file, a temporary password will
              be sent.
            </p>
          </div>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <FormError error={forgot.error} />
            <FormField id="fp-corpCode" label="CorpCode" error={errors.corpCode?.message}>
              <Input
                {...register('corpCode')}
                {...fieldA11y('fp-corpCode', errors.corpCode?.message)}
                autoComplete="organization"
                autoCapitalize="characters"
              />
            </FormField>
            <FormField id="fp-username" label="Username" error={errors.username?.message}>
              <Input {...register('username')} {...fieldA11y('fp-username', errors.username?.message)} autoComplete="username" />
            </FormField>
            <Button type="submit" className="w-full bg-[#031e37] text-white hover:bg-[#052a4d]" loading={forgot.isPending}>
              Send temporary password
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="font-medium text-[#031e37] underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
