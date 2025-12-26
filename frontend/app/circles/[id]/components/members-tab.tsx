'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberAvatar } from '@/components/ui/member-avatar'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, Crown } from 'lucide-react'
import type { Circle, Member, Round } from '@/lib/types/subgraph'

interface MembersTabProps {
  circle: Circle
}

type MemberContributionStatus = 'paid' | 'pending' | 'overdue'

export function MembersTab({ circle }: MembersTabProps) {
  const { t } = useTranslation()

  const currentRound = circle.rounds?.find(
    (r: Round) => r.roundNumber === circle.currentRound
  )

  const deadlineDate = currentRound
    ? new Date(parseInt(currentRound.deadline) * 1000)
    : null
  const isDeadlinePassed = deadlineDate ? Date.now() > deadlineDate.getTime() : false

  const paidCount = currentRound?.contributionCount ?? 0
  const totalMembers = circle.memberCount

  // Check if member has contributed to the current round
  // If their contributionCount >= currentRound, they've paid this round
  const getMemberStatus = (member: Member): MemberContributionStatus => {
    const hasPaidThisRound = member.contributionCount >= circle.currentRound
    if (hasPaidThisRound) return 'paid'
    if (isDeadlinePassed) return 'overdue'
    return 'pending'
  }

  const statusConfig = {
    paid: {
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      color: 'text-success',
      bg: 'bg-success/10',
      label: t('circleDetail.membersTab.paid'),
    },
    pending: {
      icon: <Clock className="h-3.5 w-3.5" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
      label: t('circleDetail.membersTab.pending'),
    },
    overdue: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      label: t('circleDetail.membersTab.overdue'),
    },
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{t('circleDetail.membersTab.participantStatus')}</span>
          <Badge variant="outline" className="font-normal">
            {t('circleDetail.overview.peopleComplete', { count: paidCount, total: totalMembers })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {circle.members?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {circle.members.map((member: Member) => {
              const status = getMemberStatus(member)
              const config = statusConfig[status]
              const isCreator = member.address.toLowerCase() === circle.creator.toLowerCase()

              return (
                <div
                  key={member.id}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-lg border transition-colors',
                    config.bg,
                    'border-border hover:border-gold/30'
                  )}
                >
                  <div className="relative">
                    <MemberAvatar
                      name={member.address.slice(2, 6)}
                      size="lg"
                      isVerified={status === 'paid'}
                    />
                    {isCreator && (
                      <div className="absolute -top-1 -right-1 bg-gold rounded-full p-0.5">
                        <Crown className="h-3 w-3 text-black" />
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-medium text-foreground">
                    {member.address.slice(0, 6)}...{member.address.slice(-4)}
                  </p>

                  <div className={cn('flex items-center gap-1 mt-1 text-xs', config.color)}>
                    {config.icon}
                    <span>{config.label}</span>
                  </div>

                  {member.hasReceivedPayout && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {t('circleDetail.membersTab.payoutComplete')}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('circleDetail.membersTab.noParticipants')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
