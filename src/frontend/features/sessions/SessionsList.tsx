import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListChecks } from 'lucide-react'
import { useSessions } from '@/backend/hooks/useSessions'
import { Card } from '@/frontend/components/ui/card'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { EmptyState } from '@/frontend/components/EmptyState'
import { ErrorState } from '@/frontend/components/ErrorState'
import { Pagination } from '@/frontend/components/Pagination'
import { SessionFilters } from './SessionFilters'
import { SessionsTable } from './SessionsTable'
import {
  SESSIONS_PAGE_SIZE,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  toSessionsQuery,
  type SessionFilterValues,
} from './filterState'

/** Filterable, paginated sessions list. Filters and page live in the URL so views are shareable and back-button friendly. */
export function SessionsList() {
  const [params, setParams] = useSearchParams()
  const { filters, page } = useMemo(() => filtersFromParams(params), [params])
  const query = useMemo(() => toSessionsQuery(filters, page), [filters, page])
  const sessions = useSessions(query)

  const applyFilters = (next: SessionFilterValues) => setParams(filtersToParams(next, 1))
  const changePage = (p: number) => {
    setParams(filtersToParams(filters, p))
    window.scrollTo({ top: 0 })
  }

  const rows = sessions.data ?? []

  return (
    <div className="space-y-4">
      <SessionFilters value={filters} onApply={applyFilters} />

      <Card className="overflow-hidden">
        {sessions.isLoading ? (
          <div className="space-y-3 p-4" role="status" aria-label="Loading sessions">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sessions.isError ? (
          <div className="p-4">
            <ErrorState error={sessions.error} title="Could not load sessions" onRetry={() => void sessions.refetch()} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={ListChecks}
              title={hasActiveFilters(filters) ? 'No sessions match these filters' : 'No USB sessions yet'}
              description={
                hasActiveFilters(filters)
                  ? 'Try widening the date range or lowering the minimum risk score.'
                  : 'Sessions appear here once the Windows service on a host reports USB activity.'
              }
            />
          </div>
        ) : (
          <>
            <div aria-busy={sessions.isFetching} className={sessions.isFetching ? 'opacity-70 transition-opacity' : undefined}>
              <SessionsTable sessions={rows} />
            </div>
            <Pagination
              page={page}
              hasNext={rows.length >= SESSIONS_PAGE_SIZE}
              loading={sessions.isFetching}
              onPageChange={changePage}
            />
          </>
        )}
      </Card>
    </div>
  )
}
