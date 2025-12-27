'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import {
  Filters,
  getStatusOptions,
  getFrequencyOptions,
  getSortOptions,
} from '../types'

interface SearchFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const { t } = useTranslation()

  const STATUS_OPTIONS = getStatusOptions(t)
  const FREQUENCY_OPTIONS = getFrequencyOptions(t)
  const SORT_OPTIONS = getSortOptions(t)

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value, page: 1 })
  }

  const resetFilters = () => {
    onChange({
      status: 'all',
      frequency: 'all',
      sortBy: 'newest',
      page: 1,
    })
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.frequency !== 'all' ||
    filters.sortBy !== 'newest'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          updateFilter('status', value as Filters['status'])
        }
      >
        <SelectTrigger className="w-[120px] bg-card border-border">
          <SelectValue placeholder={t('explore.placeholders.status')} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Frequency Filter */}
      <Select
        value={filters.frequency || 'all'}
        onValueChange={(value) =>
          updateFilter('frequency', value as Filters['frequency'])
        }
      >
        <SelectTrigger className="w-[120px] bg-card border-border">
          <SelectValue placeholder={t('explore.placeholders.frequency')} />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Filter */}
      <Select
        value={filters.sortBy || 'newest'}
        onValueChange={(value) =>
          updateFilter('sortBy', value as Filters['sortBy'])
        }
      >
        <SelectTrigger className="w-[120px] bg-card border-border">
          <SelectValue placeholder={t('explore.placeholders.sort')} />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          {t('common.reset')}
        </Button>
      )}
    </div>
  )
}
