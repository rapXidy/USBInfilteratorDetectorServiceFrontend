import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/frontend/components/ui/badge'
import { cn } from '@/frontend/lib/utils'

/** Score at or above which a session is considered high risk (matches the API's default HighRiskThreshold). */
export const HIGH_RISK_THRESHOLD = 50
/** Score at or above which a session is considered medium risk. */
export const MEDIUM_RISK_THRESHOLD = 25

export type RiskLevel = 'low' | 'medium' | 'high'

/** Map a numeric risk score to a level (green < 25 ≤ amber < 50 ≤ red). */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= HIGH_RISK_THRESHOLD) return 'high'
  if (score >= MEDIUM_RISK_THRESHOLD) return 'medium'
  return 'low'
}

const config = {
  low: { label: 'Low', variant: 'success', Icon: CheckCircle2 },
  medium: { label: 'Medium', variant: 'warning', Icon: AlertTriangle },
  high: { label: 'High', variant: 'destructive', Icon: AlertOctagon },
} as const

interface RiskBadgeProps {
  score: number
  /** `lg` is used in the session detail header. */
  size?: 'sm' | 'lg'
  className?: string
}

/**
 * Risk score pill. Colour is never the only signal: it also includes an icon and the level text
 * (accessible to colour-blind users and screen readers).
 */
export function RiskBadge({ score, size = 'sm', className }: RiskBadgeProps) {
  const level = getRiskLevel(score)
  const { label, variant, Icon } = config[level]
  return (
    <Badge
      variant={variant}
      className={cn(size === 'lg' && 'px-4 py-1.5 text-base', className)}
      aria-label={`Risk score ${score}, ${label} risk`}
    >
      <Icon className={size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} aria-hidden="true" />
      <span className="tabular-nums">{score}</span>
      <span className="font-medium">· {label}</span>
    </Badge>
  )
}
