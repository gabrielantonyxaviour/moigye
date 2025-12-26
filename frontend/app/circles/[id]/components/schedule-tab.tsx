'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Check, Circle as CircleIcon, Clock } from 'lucide-react'
import type { Circle, Round } from '@/lib/types/subgraph'

interface ScheduleTabProps {
  circle: Circle
}

// Round status: 0=PENDING, 1=ACTIVE, 2=COMPLETED
const ROUND_COMPLETED = 2
const ROUND_ACTIVE = 1

export function ScheduleTab({ circle }: ScheduleTabProps) {
  const { t, locale } = useTranslation()

  // Sort rounds by roundNumber
  const sortedRounds = [...(circle.rounds || [])].sort(
    (a, b) => a.roundNumber - b.roundNumber
  )

  const formatDeadline = (deadline: string) => {
    const date = new Date(parseInt(deadline) * 1000)
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAddress = (addr: string | null) => {
    if (!addr) return t('circleDetail.schedule.undecided')
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold" />
          {t('circleDetail.schedule.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />

          <div className="space-y-4">
            {sortedRounds.map((round: Round) => {
              const isCompleted = round.status === ROUND_COMPLETED
              const isActive = round.status === ROUND_ACTIVE
              const isCurrent = round.roundNumber === circle.currentRound

              return (
                <div
                  key={round.id}
                  className={cn(
                    'relative flex items-start gap-4 pl-8',
                    isCurrent && 'font-medium'
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-0 top-0.5 h-6 w-6 rounded-full flex items-center justify-center',
                      isCompleted
                        ? 'bg-success text-success-foreground'
                        : isCurrent
                          ? 'bg-gold text-white'
                          : 'bg-muted text-muted-foreground border border-border'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <CircleIcon className="h-2.5 w-2.5 fill-current" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm',
                            isCurrent ? 'text-gold' : 'text-foreground'
                          )}
                        >
                          {t('circleDetail.schedule.round', { round: round.roundNumber })}
                        </span>
                        {isCompleted && (
                          <span className="text-xs text-success">{t('circleDetail.schedule.complete')}</span>
                        )}
                        {isActive && isCurrent && (
                          <span className="text-xs text-gold">{t('circleDetail.schedule.inProgress')}</span>
                        )}
                        {!isCompleted && !isActive && (
                          <span className="text-xs text-muted-foreground">{t('circleDetail.schedule.upcoming')}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t('circleDetail.schedule.deadlineDate', { date: formatDeadline(round.deadline) })}
                      </span>
                    </div>

                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">{t('circleDetail.schedule.recipient')}</span>
                      <span
                        className={cn(
                          round.winner ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {formatAddress(round.winner)}
                        {round.winner && isCompleted && ' ✓'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Future rounds placeholder */}
            {sortedRounds.length < circle.totalRounds && (
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-dashed border-border">
                  <span className="text-xs text-muted-foreground">...</span>
                </div>
                <div className="flex-1 pb-2">
                  <span className="text-sm text-muted-foreground">
                    {t('circleDetail.schedule.futureRounds', { count: circle.totalRounds - sortedRounds.length })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
