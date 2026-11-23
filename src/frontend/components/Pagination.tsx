import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/frontend/components/ui/button'

interface PaginationProps {
  page: number
  /** True when the current page is full, i.e. another page may exist (API returns no total). */
  hasNext: boolean
  loading?: boolean
  onPageChange: (page: number) => void
}

/** Previous/next pager for skip/take APIs that don't return a total count. */
export function Pagination({ page, hasNext, loading, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 border-t px-4 py-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Page {page}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext || loading} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
