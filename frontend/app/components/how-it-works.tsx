'use client'

import { Card } from '@/components/ui/card'
import { PlusCircle, UserPlus, Coins, Gift } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      step: 1,
      icon: PlusCircle,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description',
    },
    {
      step: 2,
      icon: UserPlus,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description',
    },
    {
      step: 3,
      icon: Coins,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description',
    },
    {
      step: 4,
      icon: Gift,
      titleKey: 'howItWorks.step4.title',
      descriptionKey: 'howItWorks.step4.description',
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t('howItWorks.title')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line - hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}

              <Card className="bg-card border-border p-6 text-center relative z-10">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gold text-gold-foreground text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>

                <div className="p-3 rounded-lg bg-gold/10 inline-block mb-4 mt-2">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(item.titleKey)}
                </h3>

                <p className="text-muted-foreground text-sm">
                  {t(item.descriptionKey)}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
