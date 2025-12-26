'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Coins, Shield, Calendar } from 'lucide-react'
import { formatEther } from 'viem'
import { useTranslation } from '@/lib/i18n'
import type { UserCircleStats } from '@/lib/types/subgraph'

interface DashboardStatsProps {
  stats: UserCircleStats
  loading?: boolean
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subValue?: string
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10">
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const formattedContributed = Number(formatEther(stats.totalContributed)).toLocaleString(undefined, {
    maximumFractionDigits: 2
  })

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5 text-gold" />}
        label={t('circles.stats.participating')}
        value={`${stats.totalCircles}${t('circles.stats.circles')}`}
        subValue={`${stats.activeCircles}${t('circles.stats.active')}`}
      />
      <StatCard
        icon={<Coins className="h-5 w-5 text-gold" />}
        label={t('circles.stats.totalContributed')}
        value={formattedContributed}
        subValue="VERY"
      />
      <StatCard
        icon={<Shield className="h-5 w-5 text-gold" />}
        label={t('circles.stats.payoutsReceived')}
        value={`${stats.completedPayouts}${t('circles.stats.times')}`}
      />
      <StatCard
        icon={<Calendar className="h-5 w-5 text-gold" />}
        label={t('circles.stats.activeCircles')}
        value={`${stats.activeCircles}${t('circles.stats.circles')}`}
      />
    </div>
  )
}
