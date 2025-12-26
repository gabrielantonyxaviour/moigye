'use client'

import { Card } from '@/components/ui/card'
import { FileCode, UserCheck, Eye, Zap } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: FileCode,
      titleKey: 'features.smartContract.title',
      descriptionKey: 'features.smartContract.description',
    },
    {
      icon: UserCheck,
      titleKey: 'features.identity.title',
      descriptionKey: 'features.identity.description',
    },
    {
      icon: Eye,
      titleKey: 'features.transparency.title',
      descriptionKey: 'features.transparency.description',
    },
    {
      icon: Zap,
      titleKey: 'features.autoPayout.title',
      descriptionKey: 'features.autoPayout.description',
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('features.title')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('features.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-card border-border p-6 hover:border-gold/50 transition-colors"
          >
            <div className="p-3 rounded-lg bg-gold/10 inline-block mb-4">
              <feature.icon className="h-6 w-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t(feature.titleKey)}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t(feature.descriptionKey)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
