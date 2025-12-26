'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Coins, AlertCircle } from 'lucide-react'
import { formatEther } from 'viem'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import type { MembershipWithCircle } from '@/lib/types/subgraph'

interface UpcomingPaymentsProps {
  memberships: MembershipWithCircle[]
  loading?: boolean
}

// Circle status enum
const CircleStatus = {
  PENDING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const

function PaymentSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function UpcomingPayments({ memberships, loading }: UpcomingPaymentsProps) {
  const { t } = useTranslation()
  // Filter active circles only
  const activeCircles = memberships.filter(
    (m) => m.circle.status === CircleStatus.ACTIVE
  )

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            {t('circles.upcomingPayments.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PaymentSkeleton />
          <PaymentSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (activeCircles.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            {t('circles.upcomingPayments.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t('circles.upcomingPayments.noPayments')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gold" />
          {t('circles.upcomingPayments.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeCircles.slice(0, 3).map((membership) => {
          const amount = formatEther(BigInt(membership.circle.contributionAmount))

          return (
            <div
              key={membership.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold/10">
                  <Coins className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{membership.circle.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Number(amount).toLocaleString()} VERY
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/10" asChild>
                <Link href={`/circles/${membership.circle.id}`}>
                  {t('common.pay')}
                </Link>
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
