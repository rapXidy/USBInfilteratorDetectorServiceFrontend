import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/frontend/components/ui/alert'
import { Button } from '@/frontend/components/ui/button'
import { CopyButton } from '@/frontend/components/CopyButton'
import { subscriptionPlanLabel } from '@/backend/types'
import type { CompleteOnboardingResponse } from '@/backend/types'

function SecretRow({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code
          className="block flex-1 select-all break-all rounded-md border bg-muted px-3 py-2 font-mono text-sm"
          tabIndex={0}
          aria-label={label}
        >
          {value}
        </code>
        <CopyButton value={value} label={copyLabel} />
      </div>
    </div>
  )
}

/**
 * One-time reveal of the CorpCode and Worker API key returned by POST .../complete.
 * The data only lives in React state: it is not written to storage or the query cache, and the user is warned
 * before leaving the page.
 */
export function KeyReveal({ result }: { result: CompleteOnboardingResponse }) {
  const [acknowledged, setAcknowledged] = useState(false)

  // Warn on tab close/refresh until the user confirms they stored the key.
  useEffect(() => {
    if (acknowledged) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [acknowledged])

  return (
    <div className="space-y-5">
      <Alert variant="warning">
        <div className="flex gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <AlertTitle>Store these credentials now</AlertTitle>
            <AlertDescription>
              The Worker API key is shown <strong>only once</strong> and can never be displayed again. Save it in your
              password manager before leaving this page.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <SecretRow label="CorpCode (used to sign in)" value={result.corpCode} copyLabel="Copy CorpCode" />
      <SecretRow label="Worker API key (for the Windows service)" value={result.apiKey} copyLabel="Copy API key" />

      <dl className="grid grid-cols-2 gap-3 rounded-md border bg-muted/40 p-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Admin username</dt>
          <dd className="font-medium">{result.adminUsername}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">{subscriptionPlanLabel[result.subscriptionPlan]}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">API key prefix (visible later in Organization)</dt>
          <dd className="flex items-center gap-1.5 font-mono font-medium">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            {result.apiKeyPrefix}
          </dd>
        </div>
      </dl>

      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />
        <span>I have stored the CorpCode and API key in a safe place.</span>
      </label>

      <Button asChild={acknowledged} disabled={!acknowledged} className="w-full">
        {acknowledged ? <Link to="/login">Continue to sign in</Link> : <span>Continue to sign in</span>}
      </Button>
    </div>
  )
}
