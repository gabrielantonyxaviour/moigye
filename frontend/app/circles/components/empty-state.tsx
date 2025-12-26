'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-gold/10 mb-4">
            <Users className="h-12 w-12 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('circles.empty.title')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t('circles.empty.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-gold hover:bg-gold/90 text-gold-foreground" asChild>
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('circles.empty.createCircle')}
              </Link>
            </Button>
            <Button variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/10" asChild>
              <Link href="/explore">
                <Search className="h-4 w-4 mr-2" />
                {t('circles.empty.exploreCircles')}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
