'use client'

import { Button } from '@/components/ui/button'
import { Search, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

interface EmptySearchProps {
  onResetFilters?: () => void
}

export function EmptySearch({ onResetFilters }: EmptySearchProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t('explore.noResults.title')}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        {t('explore.noResults.description')}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onResetFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            {t('explore.noResults.resetFilters')}
          </Button>
        )}

        <Link href="/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />{t('explore.noResults.createNew')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
