'use client'

import { useState } from 'react'
import { useExploreCircles } from '@/lib/hooks/use-explore-circles'
import { SearchFilters } from './components/search-filters'
import { CircleGrid, CircleGridSkeleton } from './components/circle-grid'
import { Pagination } from './components/pagination'
import { EmptySearch } from './components/empty-search'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import type { Filters } from './types'

export default function ExplorePage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    frequency: 'all',
    sortBy: 'newest',
    page: 1,
  })

  const { circles, loading, totalCount } = useExploreCircles(filters)

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      frequency: 'all',
      sortBy: 'newest',
      page: 1,
    })
  }

  return (
    <div className="container max-w-6xl py-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('explore.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('explore.subtitle')}
          </p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />{t('explore.createCircle')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Content */}
      {loading ? (
        <CircleGridSkeleton />
      ) : circles.length === 0 ? (
        <EmptySearch onResetFilters={handleResetFilters} />
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {t('explore.totalCircles', { count: totalCount })}
          </div>
          <CircleGrid circles={circles} />
          <Pagination
            currentPage={filters.page || 1}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
