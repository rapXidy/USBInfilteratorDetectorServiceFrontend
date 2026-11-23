import { CalendarClock, Info, Server, Webhook } from 'lucide-react'
import { useSubscription } from '@/backend/hooks/useTenant'
import { SubscriptionPlan, SubscriptionStatus, subscriptionPlanLabel, subscriptionStatusLabel } from '@/backend/types'
import { Alert, AlertDescription, AlertTitle } from '@/frontend/components/ui/alert'
import { Badge } from '@/frontend/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { ErrorState } from '@/frontend/components/ErrorState'
import { PageHeader } from '@/frontend/components/PageHeader'
import { formatDate } from '@/frontend/lib/date'

const statusVariant = { 0: 'success', 1: 'destructive', 2: 'secondary' } as const

/** /subscription — current plan, status, period, host limit and feature flags (GET /api/subscription). */
export default function SubscriptionPage() {
  const sub = useSubscription()

  return (
    <>
      <PageHeader title="Subscription" description="Your current plan and what it includes." />

      {sub.isLoading ? (
        <div className="space-y-4" role="status" aria-label="Loading subscription">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : sub.isError || !sub.data ? (
        <ErrorState error={sub.error} title="Could not load subscription" onRetry={() => void sub.refetch()} />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>Current plan</CardDescription>
                <CardTitle className="mt-2 text-2xl">{subscriptionPlanLabel[sub.data.plan]}</CardTitle>
              </div>
              <Badge variant={statusVariant[sub.data.status]}>{subscriptionStatusLabel[sub.data.status]}</Badge>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {sub.data.plan === SubscriptionPlan.FreeTrial ? 'Trial period' : 'Billing period'}
                    </dt>
                    <dd className="text-sm font-medium">
                      {formatDate(sub.data.startsAt)} → {formatDate(sub.data.endsAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Server className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Host limit</dt>
                    <dd className="text-sm font-medium">{sub.data.maxHosts} hosts</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Webhook className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Webhooks</dt>
                    <dd className="text-sm font-medium">
                      {sub.data.webhooksEnabled ? 'Enabled' : 'Not included — available on Pro'}
                    </dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>

          {sub.data.status === SubscriptionStatus.Expired && (
            <Alert variant="destructive">
              <AlertTitle>Your subscription has expired</AlertTitle>
              <AlertDescription>Contact your platform administrator to renew. Reporting from hosts may be limited.</AlertDescription>
            </Alert>
          )}

          <Alert>
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <AlertTitle>Paid plans are coming soon</AlertTitle>
                <AlertDescription>Online checkout isn&apos;t available yet. Plan changes are handled by the platform team for now.</AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </>
  )
}
