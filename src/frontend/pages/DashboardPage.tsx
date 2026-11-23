import { PageHeader } from '@/frontend/components/PageHeader'
import { DashboardView } from '@/frontend/features/dashboard/DashboardView'

/** /dashboard — summary KPIs, period filter with trend chart, recent alerts. */
export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="An at-a-glance view of USB activity across your organization." />
      <DashboardView />
    </>
  )
}
