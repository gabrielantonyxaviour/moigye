'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getExplorerLink } from '@/lib/web3'
import { CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

interface JoinSuccessProps {
  circleName: string
  circleId: string
  txHash: string | null
}

const CHAIN_ID = 4613 // VeryChain mainnet

export function JoinSuccess({ circleName, circleId, txHash }: JoinSuccessProps) {
  const { t } = useTranslation()
  const explorerUrl = txHash ? getExplorerLink(CHAIN_ID, txHash, 'tx') : null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-gold rounded-full animate-pulse opacity-30" />
            <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{t('join.success.title')}</h2>
            <p className="text-muted-foreground">
              {t('join.success.welcome', { name: circleName })}
            </p>
          </div>

          {/* Transaction Link */}
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
            >
              {t('join.success.viewTransaction')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link href={`/circles/${circleId}`} className="block">
              <Button className="w-full h-12 bg-gold hover:bg-gold/90 text-gold-foreground font-semibold transition-opacity">
                {t('join.success.viewCircle')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/circles" className="block">
              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground"
              >
                {t('join.success.goToDashboard')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
