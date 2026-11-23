import { CheckCircle2, CircleAlert } from 'lucide-react'
import { Badge } from '@/frontend/components/ui/badge'

/** Shows whether the host's audit settings allowed full detection for the session. */
export function DetectionBadge({ complete }: { complete: boolean }) {
  return complete ? (
    <Badge variant="outline" className="text-muted-foreground">
      <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      Complete
    </Badge>
  ) : (
    <Badge variant="warning">
      <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
      Incomplete
    </Badge>
  )
}
