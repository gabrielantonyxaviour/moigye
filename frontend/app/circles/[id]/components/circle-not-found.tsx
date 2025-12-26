'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import { CircleOff, ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function CircleNotFound() {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-muted/50 rounded-full p-6 mb-6">
          <CircleOff className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('circleDetail.notFound.title')}
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t('circleDetail.notFound.description')}
        </p>

        <Button asChild>
          <Link href="/circles" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('circleDetail.notFound.backToCircles')}
          </Link>
        </Button>
      </div>
    </PageContainer>
  )
}
