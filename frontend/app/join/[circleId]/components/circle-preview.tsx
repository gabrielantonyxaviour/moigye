'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge, type CircleStatus } from '@/components/ui/status-badge'
import { formatBalance, formatAddress, useChainId, getNativeCurrencySymbol } from '@/lib/web3'
import { Users, Coins, Clock, Trophy } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import type { Circle } from '@/lib/types/subgraph'

interface CirclePreviewProps {
  circle: Circle
  status: CircleStatus
}

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

export function CirclePreview({ circle, status }: CirclePreviewProps) {
  const { t } = useTranslation()
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)
  const contributionFormatted = formatBalance(BigInt(circle.contributionAmount), 18)

  const payoutMethodLabels: Record<number, string> = {
    0: t('common.inOrder'),
    1: t('common.lottery'),
    2: t('common.bidding'),
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{circle.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('common.creator')}: {formatAddress(circle.creator)}
            </p>
          </div>
          <StatusBadge status={status} type="circle" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Coins className="h-4 w-4 text-gold" />}
            label={t('common.contribution')}
            value={`${contributionFormatted} ${currencySymbol}`}
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-gold" />}
            label={t('common.frequency')}
            value={getFrequencyLabel(circle.frequency, t)}
          />
          <StatCard
            icon={<Users className="h-4 w-4 text-gold" />}
            label={t('common.members')}
            value={`${circle.memberCount}/${circle.totalRounds}${t('common.people')}`}
          />
          <StatCard
            icon={<Trophy className="h-4 w-4 text-gold" />}
            label={t('common.payoutMethod')}
            value={payoutMethodLabels[circle.payoutMethod] || t('common.inOrder')}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  )
}
