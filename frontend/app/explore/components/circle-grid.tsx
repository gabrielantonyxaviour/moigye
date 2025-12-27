'use client'

import { CircleCard } from '@/components/ui/circle-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { CircleListItem } from '@/lib/types/subgraph'
import { mapCircleStatus } from '../types'
import { formatEther } from 'viem'

interface CircleGridProps {
  circles: CircleListItem[]
}

export function CircleGrid({ circles }: CircleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {circles.map((circle) => (
        <CircleCard
          key={circle.id}
          id={circle.id}
          name={circle.name}
          status={mapCircleStatus(circle.status)}
          members={[]} // Members not loaded in list view
          maxMembers={circle.totalRounds}
          contributionAmount={formatEther(BigInt(circle.contributionAmount))}
          contributionCurrency="VERY"
        />
      ))}
    </div>
  )
}

export function CircleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
