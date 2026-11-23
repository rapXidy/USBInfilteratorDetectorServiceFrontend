import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCompleteOnboarding, useOnboardingStatus } from '@/backend/hooks/useOnboarding'
import { OnboardingStatus } from '@/backend/types'
import type { CompleteOnboardingResponse } from '@/backend/types'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { ErrorState } from '@/frontend/components/ErrorState'
import { FormError } from '@/frontend/components/FormError'
import { KeyReveal } from './KeyReveal'
import { ProfileStep } from './ProfileStep'
import { StartStep } from './StartStep'
import { Stepper } from './Stepper'

const STEP_LABELS = ['Organization', 'Profile', 'Activate']

/** Step 3: confirm and complete → POST /api/onboarding/organization/{id}/complete (returns the one-time secrets). */
function CompleteStep({ organizationId, onDone }: { organizationId: string; onDone: (r: CompleteOnboardingResponse) => void }) {
  const complete = useCompleteOnboarding(organizationId)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Completing onboarding activates your organization and generates your <strong>CorpCode</strong> and a one-time{' '}
        <strong>Worker API key</strong>. Have a safe place ready to store them.
      </p>
      <FormError error={complete.error} />
      <Button
        className="w-full"
        loading={complete.isPending}
        onClick={() =>
          complete.mutate(undefined, {
            onSuccess: (res) => {
              toast.success('Onboarding complete')
              onDone(res)
            },
          })
        }
      >
        Complete onboarding
      </Button>
    </div>
  )
}

/**
 * Multi-step onboarding wizard.
 * - `/onboarding` → start form; on success routes to `/onboarding/:id`.
 * - `/onboarding/:id` → resumes the draft: optional profile → complete → one-time reveal.
 */
export function OnboardingWizard() {
  const { id } = useParams<{ id: string }>()
  const status = useOnboardingStatus(id)
  const [step, setStep] = useState<'profile' | 'complete'>('profile')
  // Held only in memory: the API key is never persisted or cached.
  const [result, setResult] = useState<CompleteOnboardingResponse | null>(null)

  // 1) Reveal screen (right after completion).
  if (result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Organization activated</span>
          </div>
          <CardTitle className="text-xl">Your credentials</CardTitle>
          <CardDescription>You will need the CorpCode every time you sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <KeyReveal result={result} />
        </CardContent>
      </Card>
    )
  }

  // 2) New onboarding.
  if (!id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Onboard your organization</CardTitle>
          <CardDescription>Create your organization and first Admin account. Takes about a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper steps={STEP_LABELS} current={0} />
          <StartStep />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already onboarded?{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  // 3) Resume a draft.
  if (status.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6" aria-busy="true" aria-label="Loading onboarding status">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }
  if (status.isError || !status.data) {
    return <ErrorState error={status.error} title="Could not load this onboarding" onRetry={() => void status.refetch()} />
  }

  const org = status.data
  if (org.status === OnboardingStatus.Completed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Onboarding already completed</CardTitle>
          <CardDescription>
            {org.name} is active. For security the Worker API key is not shown again — contact your platform administrator if
            it was lost.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {org.corpCode && (
            <p className="text-sm">
              CorpCode: <code className="rounded bg-muted px-2 py-1 font-mono font-semibold">{org.corpCode}</code>
            </p>
          )}
          <Button asChild className="w-full">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Finish setting up {org.name}</CardTitle>
        <CardDescription>Your draft organization has been created.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper steps={STEP_LABELS} current={step === 'profile' ? 1 : 2} />
        {step === 'profile' ? (
          <ProfileStep
            organizationId={org.organizationId}
            initialName={org.name}
            initialEmail={org.email}
            onNext={() => setStep('complete')}
          />
        ) : (
          <CompleteStep organizationId={org.organizationId} onDone={setResult} />
        )}
      </CardContent>
    </Card>
  )
}
