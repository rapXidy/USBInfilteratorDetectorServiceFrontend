import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useStartOnboarding } from '@/backend/hooks/useOnboarding'
import { Button } from '@/frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Organization name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().trim().optional(),
    officeAddress: z.string().trim().optional(),
    sector: z.string().trim().optional(),
    adminDisplayName: z.string().trim().min(1, 'Display name is required'),
    adminUsername: z.string().trim().min(1, 'Username is required'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.adminPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
type FormValues = z.infer<typeof schema>

/** Step 1: create the Draft organization + first Admin → POST /api/onboarding/organization, then resume at /onboarding/:id. */
export function StartStep() {
  const navigate = useNavigate()
  const start = useStartOnboarding()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit((v) => {
    start.mutate(
      {
        name: v.name,
        email: v.email,
        phone: v.phone || null,
        officeAddress: v.officeAddress || null,
        sector: v.sector || null,
        adminUsername: v.adminUsername,
        adminPassword: v.adminPassword,
        adminDisplayName: v.adminDisplayName,
      },
      {
        onSuccess: (res) => {
          toast.success('Draft organization created')
          navigate(`/onboarding/${res.organizationId}`, { replace: true })
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormError error={start.error} />

      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold">Organization</legend>
        <FormField id="name" label="Organization name" error={errors.name?.message}>
          <Input {...register('name')} {...fieldA11y('name', errors.name?.message)} autoComplete="organization" />
        </FormField>
        <FormField id="email" label="Contact email" error={errors.email?.message}>
          <Input type="email" {...register('email')} {...fieldA11y('email', errors.email?.message)} autoComplete="email" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="Phone (optional)" error={errors.phone?.message}>
            <Input type="tel" {...register('phone')} {...fieldA11y('phone', errors.phone?.message)} autoComplete="tel" />
          </FormField>
          <FormField id="sector" label="Sector (optional)" error={errors.sector?.message}>
            <Input {...register('sector')} {...fieldA11y('sector', errors.sector?.message)} placeholder="e.g. Finance" />
          </FormField>
        </div>
        <FormField id="officeAddress" label="Office address (optional)" error={errors.officeAddress?.message}>
          <Input {...register('officeAddress')} {...fieldA11y('officeAddress', errors.officeAddress?.message)} autoComplete="street-address" />
        </FormField>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-semibold">First Admin account</legend>
        <FormField id="adminDisplayName" label="Display name" error={errors.adminDisplayName?.message}>
          <Input {...register('adminDisplayName')} {...fieldA11y('adminDisplayName', errors.adminDisplayName?.message)} autoComplete="name" />
        </FormField>
        <FormField id="adminUsername" label="Username" error={errors.adminUsername?.message}>
          <Input {...register('adminUsername')} {...fieldA11y('adminUsername', errors.adminUsername?.message)} autoComplete="username" />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="adminPassword" label="Password" hint="At least 8 characters" error={errors.adminPassword?.message}>
            <Input
              type="password"
              {...register('adminPassword')}
              {...fieldA11y('adminPassword', errors.adminPassword?.message)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              {...register('confirmPassword')}
              {...fieldA11y('confirmPassword', errors.confirmPassword?.message)}
              autoComplete="new-password"
            />
          </FormField>
        </div>
      </fieldset>

      <Button type="submit" className="w-full" loading={start.isPending}>
        Create organization
      </Button>
    </form>
  )
}
