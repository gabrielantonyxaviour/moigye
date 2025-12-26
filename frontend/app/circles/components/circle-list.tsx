'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CircleCard } from '@/components/ui/circle-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users, Crown } from 'lucide-react'
import { formatEther } from 'viem'
import { useTranslation } from '@/lib/i18n'
import type { MembershipWithCircle, CircleListItem } from '@/lib/types/subgraph'
import type { CircleStatus } from '@/components/ui/status-badge'

interface CircleListProps {
  memberships: MembershipWithCircle[]
  createdCircles?: CircleListItem[]
  loading?: boolean
}

// Map numeric status to CircleStatus type
function mapStatus(status: number): CircleStatus {
  switch (status) {
    case 0: return 'forming'
    case 1: return 'active'
    case 2: return 'completed'
    default: return 'forming'
  }
}

function CircleCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CircleList({ memberships, createdCircles = [], loading }: CircleListProps) {
  const { t } = useTranslation()

  // Get circle IDs where user is a member to avoid duplicates
  const memberCircleIds = new Set(memberships.map(m => m.circle.id))
  // Filter created circles to only show those where user is NOT also a member
  const uniqueCreatedCircles = createdCircles.filter(c => !memberCircleIds.has(c.id))

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            {t('circles.myCirclesList')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CircleCardSkeleton />
            <CircleCardSkeleton />
            <CircleCardSkeleton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-gold" />
          {t('circles.myCirclesList')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Circles created by user (not yet joined as member) */}
          {uniqueCreatedCircles.map((circle) => {
            const amount = formatEther(BigInt(circle.contributionAmount || '0'))

            return (
              <div key={circle.id} className="relative">
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 z-10 bg-gold/10 text-gold border-gold/30 text-xs"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Creator
                </Badge>
                <CircleCard
                  id={circle.id}
                  name={circle.name}
                  status={mapStatus(circle.status)}
                  members={[]}
                  maxMembers={circle.totalRounds}
                  contributionAmount={Number(amount).toLocaleString()}
                  contributionCurrency="VERY"
                />
              </div>
            )
          })}
          {/* Circles where user is a member */}
          {memberships.map((membership) => {
            const circle = membership.circle
            const amount = formatEther(BigInt(circle.contributionAmount || '0'))

            return (
              <CircleCard
                key={membership.id}
                id={circle.id}
                name={circle.name}
                status={mapStatus(circle.status)}
                members={[]}
                maxMembers={circle.totalRounds}
                contributionAmount={Number(amount).toLocaleString()}
                contributionCurrency="VERY"
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
