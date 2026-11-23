import { AlertTriangle } from 'lucide-react'
import { getErrorMessage } from '@/backend/http/error'
import { Button } from '@/frontend/components/ui/button'

interface ErrorStateProps {
  /** The thrown value from a query/mutation. */
  error: unknown
  title?: string
  onRetry?: () => void
}

/** Inline error panel with the server's `{ error }` message and an optional retry button. */
export function ErrorState({ error, title = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}
