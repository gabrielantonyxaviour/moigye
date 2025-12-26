'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/layout/page-container'

export function CircleSkeleton() {
  return (
    <PageContainer>
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 border border-border">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </PageContainer>
  )
}
