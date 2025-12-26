'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

export type CircleStatus = 'forming' | 'active' | 'completed'
export type ContributionStatus = 'paid' | 'unpaid' | 'overdue'

type StatusType = 'circle' | 'contribution'

interface StatusBadgeProps {
  status: CircleStatus | ContributionStatus
  type: StatusType
  className?: string
}

const circleStatusStyles: Record<CircleStatus, string> = {
  forming: 'bg-secondary/20 text-secondary border-secondary/30',
  active: 'bg-success/20 text-success border-success/30',
  completed: 'bg-muted text-muted-foreground border-border',
}

const contributionStatusStyles: Record<ContributionStatus, string> = {
  paid: 'bg-success/20 text-success border-success/30',
  unpaid: 'bg-warning/20 text-warning border-warning/30',
  overdue: 'bg-destructive/20 text-destructive border-destructive/30',
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const { t } = useTranslation()

  const styleClassName = type === 'circle'
    ? circleStatusStyles[status as CircleStatus]
    : contributionStatusStyles[status as ContributionStatus]

  const label = type === 'circle'
    ? t(`status.circle.${status}`)
    : t(`status.contribution.${status}`)

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium border',
        styleClassName,
        className
      )}
    >
      {label}
    </Badge>
  )
}
