export interface Filters {
  status?: 'forming' | 'active' | 'all'
  minContribution?: number
  maxContribution?: number
  frequency?: 'weekly' | 'monthly' | 'all'
  sortBy?: 'newest' | 'popular'
  page?: number
}

export const ITEMS_PER_PAGE = 12

// These functions return options with translated labels
export function getStatusOptions(t: (key: string) => string) {
  return [
    { value: 'all', label: t('explore.filters.allStatus') },
    { value: 'forming', label: t('explore.filters.forming') },
    { value: 'active', label: t('explore.filters.active') },
  ] as const
}

export function getFrequencyOptions(t: (key: string) => string) {
  return [
    { value: 'all', label: t('explore.filters.allFrequency') },
    { value: 'weekly', label: t('explore.filters.weekly') },
    { value: 'monthly', label: t('explore.filters.monthly') },
  ] as const
}

export function getSortOptions(t: (key: string) => string) {
  return [
    { value: 'newest', label: t('explore.filters.sortNewest') },
    { value: 'popular', label: t('explore.filters.sortPopular') },
  ] as const
}

// Map status number from subgraph to status type
export function mapCircleStatus(statusNumber: number): 'forming' | 'active' | 'completed' {
  switch (statusNumber) {
    case 0:
      return 'forming'
    case 1:
      return 'active'
    case 2:
      return 'completed'
    default:
      return 'forming'
  }
}

// Map frequency string to display text (use t function for translations)
export function getFrequencyLabel(frequency: string, t: (key: string) => string): string {
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return t('explore.filters.weekly')
    case 'monthly':
      return t('explore.filters.monthly')
    default:
      return frequency
  }
}
