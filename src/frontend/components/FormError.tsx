import { Alert, AlertDescription } from '@/frontend/components/ui/alert'
import { getErrorMessage } from '@/backend/http/error'

/** Shows the server `{ error }` message for a failed mutation, inline in a form. Renders nothing when `error` is falsy. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <Alert variant="destructive">
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  )
}
