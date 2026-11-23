import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { SessionListItem } from '@/backend/types'
import { DetectionBadge } from '@/frontend/components/DetectionBadge'
import { RiskBadge } from '@/frontend/components/RiskBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/components/ui/table'
import { formatDateTime } from '@/frontend/lib/date'
import { formatBytes } from '@/frontend/lib/utils'

/**
 * Sessions table. The whole row is clickable for mouse users, while the host cell is a real link
 * so keyboard and screen-reader users can navigate to `/sessions/:id` (DB `id`).
 */
export function SessionsTable({ sessions }: { sessions: SessionListItem[] }) {
  const navigate = useNavigate()
  return (
    <Table>
      <caption className="sr-only">USB sessions</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Connected</TableHead>
          <TableHead>Host</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className="text-right">Written</TableHead>
          <TableHead>Detection</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/sessions/${s.id}`)}>
            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(s.connectedAt)}</TableCell>
            <TableCell>
              <Link
                to={`/sessions/${s.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {s.hostName}
              </Link>
            </TableCell>
            <TableCell>
              <div className="font-mono text-xs">{s.deviceSerial}</div>
              {(s.vendor || s.model) && (
                <div className="text-xs text-muted-foreground">{[s.vendor, s.model].filter(Boolean).join(' ')}</div>
              )}
            </TableCell>
            <TableCell>
              <RiskBadge score={s.riskScore} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-right tabular-nums">{formatBytes(s.totalBytesWritten)}</TableCell>
            <TableCell>
              <DetectionBadge complete={s.detectionComplete} />
            </TableCell>
            <TableCell className="text-right">
              <Link
                to={`/sessions/${s.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                onClick={(e) => e.stopPropagation()}
                aria-label={`View session on ${s.hostName}, device ${s.deviceSerial}`}
              >
                View <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
