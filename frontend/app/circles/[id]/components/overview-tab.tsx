'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAccount } from '@/lib/web3'
import { useMemberStatus } from '@/lib/hooks/use-member-status'
import { useTranslation } from '@/lib/i18n'
import { ContributionModal } from './contribution-modal'
import { AuctionPanel } from './auction-panel'
import { formatUnits } from 'viem'
import { Coins, Clock, TrendingUp } from 'lucide-react'
import type { Circle, Round } from '@/lib/types/subgraph'
import type { Address } from 'viem'

interface OverviewTabProps {
  circle: Circle
  onRefetch?: () => Promise<void>
}

// PayoutMethod enum: 0=RANDOM, 1=AUCTION, 2=FIXED_ORDER
const PAYOUT_AUCTION = 1

export function OverviewTab({ circle, onRefetch }: OverviewTabProps) {
  const { t, locale } = useTranslation()
  const [showContributeModal, setShowContributeModal] = useState(false)
  const { address } = useAccount()
  const { isMember, hasContributed, loading: statusLoading, refetch: refetchMemberStatus } = useMemberStatus(
    circle.address as Address,
    address
  )

  const currentRound = circle.rounds?.find(
    (r: Round) => r.roundNumber === circle.currentRound
  )

  const paidCount = currentRound?.contributionCount ?? 0
  const progressPercent = (paidCount / circle.memberCount) * 100

  const handleContributionSuccess = async () => {
    // Refetch both circle data and member status after successful contribution
    await Promise.all([
      onRefetch?.(),
      refetchMemberStatus(),
    ])
  }
  const contributionAmount = formatUnits(BigInt(circle.contributionAmount), 18)
  const totalPool = formatUnits(BigInt(circle.totalContributed || '0'), 18)

  const deadlineDate = currentRound
    ? new Date(parseInt(currentRound.deadline) * 1000)
    : null
  const isDeadlinePassed = deadlineDate ? Date.now() > deadlineDate.getTime() : false

  const canContribute = isMember && !hasContributed && !isDeadlinePassed && circle.status === 1

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* Current Round Info */}
      <Card className="border-gold/30 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            {t('circleDetail.overview.currentRound', { round: circle.currentRound })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contribution Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('circleDetail.overview.contributionProgress')}</span>
              <span className="text-foreground font-medium">
                {t('circleDetail.overview.peopleComplete', { count: paidCount, total: circle.memberCount })}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Deadline */}
          {deadlineDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('circleDetail.overview.deadline')}</span>
              <span className={isDeadlinePassed ? 'text-destructive' : 'text-foreground'}>
                {formatDate(deadlineDate)}
              </span>
            </div>
          )}

          {/* Pool Info */}
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-muted-foreground">{t('circleDetail.overview.expectedPayout')}</span>
            <span className="text-gold font-semibold">
              {totalPool} VERY
            </span>
          </div>

          {/* Contribute Button */}
          {!statusLoading && canContribute && (
            <Button
              onClick={() => setShowContributeModal(true)}
              className="w-full bg-gold hover:bg-gold/90 text-white"
            >
              {t('circleDetail.overview.payContribution', { amount: contributionAmount })}
            </Button>
          )}

          {!statusLoading && hasContributed && (
            <div className="text-center text-sm text-success py-2">
              {t('circleDetail.overview.roundPaymentComplete')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auction Panel (if auction method) */}
      {circle.payoutMethod === PAYOUT_AUCTION && (
        <AuctionPanel circle={circle} currentRound={currentRound} />
      )}

      {/* Next Payout Preview */}
      {currentRound?.winner && (
        <Card className="border-border bg-card">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{t('circleDetail.overview.currentRoundRecipient')}</p>
            <p className="font-medium text-foreground">
              {currentRound.winner.slice(0, 6)}...{currentRound.winner.slice(-4)}
            </p>
          </CardContent>
        </Card>
      )}

      <ContributionModal
        open={showContributeModal}
        onOpenChange={setShowContributeModal}
        circle={circle}
        onSuccess={handleContributionSuccess}
      />
    </div>
  )
}
