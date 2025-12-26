'use client'

import Link from 'next/link'
import { useAccount } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function CTASection() {
  const { isConnected } = useAccount()
  const { t } = useTranslation()

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 border border-border text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gold/10 mb-6">
          <Shield className="h-8 w-8 text-gold" />
        </div>

        {/* Tagline */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {t('cta.title')}
        </h2>

        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {t('cta.description')}
        </p>

        {/* CTA Button */}
        {isConnected ? (
          <Link href="/create">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold/90 text-gold-foreground px-8"
            >
              {t('cta.getStarted')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('common.connectWallet')}
          </p>
        )}
      </div>
    </section>
  )
}
