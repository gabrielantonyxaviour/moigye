'use client'

import { useQuery } from '@apollo/client/react'
import { subgraphClient } from '@/lib/graphql/client'
import { GET_CIRCLES_FILTERED, GET_CIRCLES_COUNT } from '@/lib/graphql/queries'
import type { CircleListItem, GetCirclesResponse } from '@/lib/types/subgraph'
import type { Filters } from '@/app/explore/types'
import { ITEMS_PER_PAGE } from '@/app/explore/types'

interface UseExploreCirclesOptions extends Filters {}

interface UseExploreCirclesReturn {
  circles: CircleListItem[]
  loading: boolean
  error: Error | null
  totalCount: number
  refetch: () => void
}

function buildWhereClause(filters: Filters): Record<string, unknown> {
  const where: Record<string, unknown> = {}

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status === 'forming' ? 0 : 1
  }

  if (filters.frequency && filters.frequency !== 'all') {
    where.frequency = filters.frequency
  }

  return where
}

export function useExploreCircles(
  options?: UseExploreCirclesOptions
): UseExploreCirclesReturn {
  const { page = 1, sortBy = 'newest', ...filterOptions } = options ?? {}

  const where = buildWhereClause(filterOptions)
  const orderBy = sortBy === 'popular' ? 'memberCount' : 'createdAt'
  const orderDirection = 'desc'

  const { data, loading, error, refetch } = useQuery<GetCirclesResponse>(
    GET_CIRCLES_FILTERED,
    {
      client: subgraphClient,
      variables: {
        first: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
        orderBy,
        orderDirection,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      fetchPolicy: 'cache-and-network',
    }
  )

  const { data: countData } = useQuery<{ circles: { id: string }[] }>(
    GET_CIRCLES_COUNT,
    {
      client: subgraphClient,
      variables: {
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      fetchPolicy: 'cache-and-network',
    }
  )

  // Only show loading when no cached data exists (prevents flicker on refetch)
  const isInitialLoading = loading && !data

  return {
    circles: data?.circles ?? [],
    loading: isInitialLoading,
    error: error ?? null,
    totalCount: countData?.circles?.length ?? 0,
    refetch,
  }
}
