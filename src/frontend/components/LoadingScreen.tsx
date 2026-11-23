import { Loader2 } from 'lucide-react'

/** Full-viewport spinner used while the session restores or a lazy route loads. */
export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
