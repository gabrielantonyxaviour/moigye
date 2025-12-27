'use client'

import { useCircleLeaderboard } from '@/lib/hooks/use-leaderboard'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatEther } from 'viem'
import { Trophy, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function CircleLeaderboard() {
  const { t } = useTranslation()
  const { circles, loading, error } = useCircleLeaderboard({ limit: 20 })

  if (loading) {
    return <CircleLeaderboardSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('common.error')}
        </CardContent>
      </Card>
    )
  }

  if (circles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('leaderboard.circles.empty')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('leaderboard.circles.title')}
        </CardTitle>
        <CardDescription>{t('leaderboard.circles.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {circles.map((circle, index) => (
            <LeaderboardRow
              key={circle.id}
              rank={index + 1}
              circle={circle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LeaderboardRow({
  rank,
  circle,
}: {
  rank: number
  circle: {
    id: string
    name: string
    totalContributed: string
    memberCount: number
    currentRound: number
    totalRounds: number
    status: number
  }
}) {
  const { t } = useTranslation()
  const contributed = formatEther(BigInt(circle.totalContributed))
  const progress = Math.round((circle.currentRound / circle.totalRounds) * 100)

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500'
    if (rank === 2) return 'bg-gray-300/20 text-gray-600 border-gray-400'
    if (rank === 3) return 'bg-orange-500/20 text-orange-600 border-orange-500'
    return 'bg-muted text-muted-foreground'
  }

  const getStatusBadge = (status: number) => {
    if (status === 0) return <Badge variant="secondary">{t('status.circle.forming')}</Badge>
    if (status === 1) return <Badge variant="default">{t('status.circle.active')}</Badge>
    return <Badge variant="outline">{t('status.circle.completed')}</Badge>
  }

  return (
    <Link href={`/circles/${circle.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
        {/* Rank */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getRankStyle(rank)}`}>
          {rank <= 3 ? <Trophy className="h-5 w-5" /> : rank}
        </div>

        {/* Circle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{circle.name}</span>
            {getStatusBadge(circle.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {circle.memberCount} {t('common.members')}
            </span>
            <span>
              {t('leaderboard.circles.progress')}: {progress}%
            </span>
          </div>
        </div>

        {/* Contributed Amount */}
        <div className="text-right">
          <div className="font-bold text-lg">{parseFloat(contributed).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">VERY</div>
        </div>
      </div>
    </Link>
  )
}

function CircleLeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
