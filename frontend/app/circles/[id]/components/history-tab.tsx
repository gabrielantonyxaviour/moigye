'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRoundContributions } from '@/lib/hooks/use-round-contributions'
import { useTranslation } from '@/lib/i18n'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUnits } from 'viem'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, FileText, ExternalLink } from 'lucide-react'
import type { Circle, Contribution } from '@/lib/types/subgraph'

interface HistoryTabProps {
  circle: Circle
}

type TxType = 'contribution' | 'payout' | 'penalty'

interface HistoryItem {
  id: string
  type: TxType
  address: string
  amount: string
  timestamp: string
  txHash: string
}

export function HistoryTab({ circle }: HistoryTabProps) {
  const { t, locale } = useTranslation()

  // Fetch contributions for current round
  const { contributions, loading } = useRoundContributions(
    circle.id,
    circle.currentRound
  )

  // Transform contributions to history items
  const historyItems: HistoryItem[] = contributions.map((c: Contribution) => ({
    id: c.id,
    type: 'contribution' as TxType,
    address: c.member.address,
    amount: c.amount,
    timestamp: c.timestamp,
    txHash: c.txHash,
  }))

  const typeConfig = {
    contribution: {
      icon: <ArrowUpRight className="h-4 w-4" />,
      color: 'text-success',
      bg: 'bg-success/10',
      label: t('circleDetail.historyTab.contribution'),
    },
    payout: {
      icon: <ArrowDownLeft className="h-4 w-4" />,
      color: 'text-gold',
      bg: 'bg-gold/10',
      label: t('circleDetail.historyTab.payout'),
    },
    penalty: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      label: t('circleDetail.historyTab.penalty'),
    },
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(parseInt(ts) * 1000)
    return date.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: string) => {
    return formatUnits(BigInt(amount), 18)
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('circleDetail.historyTab.transactionHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-gold" />
          {t('circleDetail.historyTab.transactionHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historyItems.length > 0 ? (
          <div className="space-y-2">
            {historyItems.map((item) => {
              const config = typeConfig[item.type]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-full', config.bg, config.color)}>
                    {config.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-foreground font-medium truncate">
                        {item.address.slice(0, 6)}...{item.address.slice(-4)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', config.color)}>
                      {item.type === 'contribution' ? '+' : item.type === 'penalty' ? '-' : ''}
                      {formatAmount(item.amount)} VERY
                    </p>
                    {item.txHash && (
                      <a
                        href={`https://www.veryscan.io/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                      >
                        {t('circleDetail.historyTab.view')} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('circleDetail.historyTab.noTransactions')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
