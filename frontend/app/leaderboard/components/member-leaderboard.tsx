'use client'

import { useMemberLeaderboard } from '@/lib/hooks/use-leaderboard'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatEther } from 'viem'
import { Trophy, TrendingUp, Hash } from 'lucide-react'
import Link from 'next/link'

export function MemberLeaderboard() {
  const { t } = useTranslation()
  const { members, loading, error } = useMemberLeaderboard({ limit: 20 })

  if (loading) {
    return <MemberLeaderboardSkeleton />
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

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('leaderboard.members.empty')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('leaderboard.members.title')}
        </CardTitle>
        <CardDescription>{t('leaderboard.members.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member, index) => (
            <MemberRow
              key={member.id}
              rank={index + 1}
              member={member}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MemberRow({
  rank,
  member,
}: {
  rank: number
  member: {
    id: string
    address: string
    totalContributed: string
    contributionCount: number
    circle: {
      id: string
      name: string
    }
  }
}) {
  const { t } = useTranslation()
  const contributed = formatEther(BigInt(member.totalContributed))

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500'
    if (rank === 2) return 'bg-gray-300/20 text-gray-600 border-gray-400'
    if (rank === 3) return 'bg-orange-500/20 text-orange-600 border-orange-500'
    return 'bg-muted text-muted-foreground'
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      {/* Rank */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getRankStyle(rank)}`}>
        {rank <= 3 ? <Trophy className="h-5 w-5" /> : rank}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="font-medium text-sm bg-muted px-2 py-1 rounded">
            {shortenAddress(member.address)}
          </code>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {member.contributionCount} {t('leaderboard.members.contributions')}
          </span>
          <Link href={`/circles/${member.circle.id}`} className="hover:text-foreground">
            {t('leaderboard.members.circle')}: {member.circle.name}
          </Link>
        </div>
      </div>

      {/* Contributed Amount */}
      <div className="text-right">
        <div className="font-bold text-lg">{parseFloat(contributed).toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">VERY</div>
      </div>
    </div>
  )
}

function MemberLeaderboardSkeleton() {
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
