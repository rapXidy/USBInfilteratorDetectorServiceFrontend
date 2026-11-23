import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useUpdateOnboarding } from '@/backend/hooks/useOnboarding'
import { Button } from '@/frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { FormError } from '@/frontend/components/FormError'
import { FormField, fieldA11y } from '@/frontend/components/FormField'

const schema = z.object({
  name: z.string().trim().min(1, 'Organization name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().trim().optional(),
  officeAddress: z.string().trim().optional(),
  sector: z.string().trim().optional(),
})
type FormValues = z.infer<typeof schema>

interface ProfileStepProps {
  organizationId: string
  initialName: string
  initialEmail: string
  /** Called after a successful save OR when the user skips this optional step. */
  onNext: () => void
}

/**
 * Step 2 (optional): refine the draft profile → PUT /api/onboarding/organization/{id}.
 * The status endpoint only returns name/email, so optional fields start empty on resume.
 */
export function ProfileStep({ organizationId, initialName, initialEmail, onNext }: ProfileStepProps) {
  const update = useUpdateOnboarding(organizationId)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName, email: initialEmail, phone: '', officeAddress: '', sector: '' },
  })

  const onSubmit = handleSubmit((v) => {
    update.mutate(
      { name: v.name, email: v.email, phone: v.phone || null, officeAddress: v.officeAddress || null, sector: v.sector || null },
      {
        onSuccess: () => {
          toast.success('Profile saved')
          onNext()
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Optional: review or add organization details. Fields left blank here will be saved as empty.
      </p>
      <FormError error={update.error} />
      <FormField id="p-name" label="Organization name" error={errors.name?.message}>
        <Input {...register('name')} {...fieldA11y('p-name', errors.name?.message)} />
      </FormField>
      <FormField id="p-email" label="Contact email" error={errors.email?.message}>
        <Input type="email" {...register('email')} {...fieldA11y('p-email', errors.email?.message)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="p-phone" label="Phone" error={errors.phone?.message}>
          <Input type="tel" {...register('phone')} {...fieldA11y('p-phone', errors.phone?.message)} />
        </FormField>
        <FormField id="p-sector" label="Sector" error={errors.sector?.message}>
          <Input {...register('sector')} {...fieldA11y('p-sector', errors.sector?.message)} />
        </FormField>
      </div>
      <FormField id="p-address" label="Office address" error={errors.officeAddress?.message}>
        <Input {...register('officeAddress')} {...fieldA11y('p-address', errors.officeAddress?.message)} />
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onNext}>
          Skip this step
        </Button>
        <Button type="submit" loading={update.isPending}>
          Save and continue
        </Button>
      </div>
    </form>
  )
}
