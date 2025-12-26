'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
          <Users className="h-4 w-4 text-gold" />
          <span className="text-sm text-gold">{t('hero.badge')}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          {t('hero.title')}{' '}
          <span className="text-gold">{t('hero.titleHighlight')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-4">
          {t('hero.tagline')}
        </p>

        <p className="text-md text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold/90 text-gold-foreground px-8"
            >
              {t('hero.createCircle')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              {t('hero.findCircles')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
