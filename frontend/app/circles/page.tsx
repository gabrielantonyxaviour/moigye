'use client'

import { useAccount, ConnectButton } from '@/lib/web3'
import { useUserCircles } from '@/lib/hooks/use-user-circles'
import { DashboardStats } from './components/dashboard-stats'
import { UpcomingPayments } from './components/upcoming-payments'
import { CircleList } from './components/circle-list'
import { EmptyState } from './components/empty-state'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'

export default function CirclesPage() {
  const { t } = useTranslation()
  const { address, isConnected } = useAccount()
  const { memberships, createdCircles, stats, loading, error } = useUserCircles(address)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-gold/10 mb-4">
                  <Shield className="h-12 w-12 text-gold" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t('circles.connectWallet')}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {t('circles.connectWalletDesc')}
                </p>
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-destructive">{t('common.error')}</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : memberships.length === 0 && createdCircles.length === 0 ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('circles.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('circles.subtitle')}</p>
            </div>
            <EmptyState />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('circles.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('circles.subtitle')}</p>
            </div>
            <div className="space-y-6">
              <DashboardStats stats={stats} />
              <UpcomingPayments memberships={memberships} />
              <CircleList memberships={memberships} createdCircles={createdCircles} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
