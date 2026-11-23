import { PageHeader } from '@/frontend/components/PageHeader'
import { SessionsList } from '@/frontend/features/sessions/SessionsList'

/** /sessions — filterable, paginated USB session table. */
export default function SessionsPage() {
  return (
    <>
      <PageHeader title="Sessions" description="USB device sessions reported by your hosts, scored for exfiltration risk." />
      <SessionsList />
    </>
  )
}
