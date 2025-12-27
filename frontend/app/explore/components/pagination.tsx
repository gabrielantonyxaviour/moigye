'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ITEMS_PER_PAGE } from '../types'

interface PaginationProps {
  currentPage: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalCount,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (showEllipsisStart) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }

    if (showEllipsisEnd) {
      pages.push('ellipsis')
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(page)}
            className={cn(
              'h-9 w-9',
              currentPage === page && 'bg-primary text-primary-foreground'
            )}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
