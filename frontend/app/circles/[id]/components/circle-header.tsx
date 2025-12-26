'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CircleStatus } from '@/components/ui/status-badge'
import { formatUnits } from 'viem'
import { Users, Coins, Calendar, Share2, Gavel, Shuffle, ListOrdered, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useAccount } from '@/lib/web3'
import { useStartCircle } from '@/lib/hooks/use-start-circle'
import { useToast } from '@/hooks/use-toast'
import type { Circle } from '@/lib/types/subgraph'
import type { Address } from 'viem'

interface CircleHeaderProps {
  circle: Circle
}

const statusMap: Record<number, CircleStatus> = {
  0: 'forming',
  1: 'active',
  2: 'completed',
}

const PAYOUT_METHODS = ['auction', 'random', 'fixed'] as const

// Convert frequency seconds to readable label
function getFrequencyLabel(frequencySeconds: string, t: (key: string) => string): string {
  const seconds = parseInt(frequencySeconds)

  // Map common frequency values to labels
  if (seconds <= 86400) return t('common.daily')           // 1 day
  if (seconds <= 604800) return t('common.weekly')         // 7 days
  if (seconds <= 1209600) return t('common.biweekly')      // 14 days
  if (seconds <= 2592000) return t('common.monthly')       // 30 days

  // For non-standard frequencies, show days
  const days = Math.round(seconds / 86400)
  return `${days} days`
}

export function CircleHeader({ circle }: CircleHeaderProps) {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { startCircle, isLoading } = useStartCircle(circle.address as Address)
  const { toast } = useToast()

  const payoutMethodLabels: Record<string, string> = {
    auction: t('create.rules.auction'),
    random: t('create.rules.random'),
    fixed: t('create.rules.fixed'),
  }

  const payoutMethodIcons: Record<string, React.ReactNode> = {
    auction: <Gavel className="h-4 w-4 text-gold" />,
    random: <Shuffle className="h-4 w-4 text-gold" />,
    fixed: <ListOrdered className="h-4 w-4 text-gold" />,
  }

  const contributionFormatted = formatUnits(BigInt(circle.contributionAmount), 18)
  const stakeFormatted = formatUnits(BigInt(circle.stakeRequired), 18)
  const circleStatus = statusMap[circle.status] || 'forming'
  const payoutMethod = PAYOUT_METHODS[circle.payoutMethod] || 'auction'

  const isCreator = address?.toLowerCase() === circle.creator.toLowerCase()
  const isFull = circle.memberCount >= circle.totalRounds
  const canStart = isCreator && circle.status === 0 && circle.memberCount >= 2

  const handleShare = async () => {
    try {
      // Create join invite URL instead of current page URL
      const baseUrl = window.location.origin
      const inviteUrl = `${baseUrl}/join/${circle.id}`
      await navigator.clipboard.writeText(inviteUrl)
      toast({
        title: t('common.copied'),
        description: t('common.inviteLinkCopied'),
        variant: 'success',
      })
    } catch {
      // Silently fail if clipboard access is denied
    }
  }

  const handleStartCircle = async () => {
    await startCircle()
  }

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {circle.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('circleDetail.header.host')} {circle.creator.slice(0, 6)}...{circle.creator.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {circle.status === 0 ? (
            canStart ? (
              <Button
                onClick={handleStartCircle}
                disabled={isLoading}
                className="bg-gold hover:bg-gold/90 text-white"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('circleDetail.header.startCircle')}
              </Button>
            ) : isFull && !isCreator ? (
              <Button variant="outline" disabled>
                {t('circleDetail.header.waitingForCreator')}
              </Button>
            ) : (
              <Button variant="outline" disabled>
                {t('status.circle.forming')}
              </Button>
            )
          ) : (
            <Button variant="outline" disabled>
              {t(`status.circle.${circleStatus}`)}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="h-4 w-4 text-gold" />}
          label={t('circleDetail.header.participants')}
          value={`${circle.memberCount}/${circle.totalRounds}`}
        />
        <StatCard
          icon={<Coins className="h-4 w-4 text-gold" />}
          label={t('circleDetail.header.contribution')}
          value={`${contributionFormatted} VERY`}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4 text-gold" />}
          label={t('circleDetail.header.frequency')}
          value={getFrequencyLabel(circle.frequency, t)}
        />
        <StatCard
          icon={payoutMethodIcons[payoutMethod]}
          label={t('common.payoutMethod')}
          value={payoutMethodLabels[payoutMethod]}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-foreground">{value}</p>
    </Card>
  )
}
