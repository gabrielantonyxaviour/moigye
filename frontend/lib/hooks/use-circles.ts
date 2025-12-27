'use client'

import { useQuery } from '@apollo/client/react'
import { subgraphClient } from '@/lib/graphql/client'
import { GET_CIRCLES } from '@/lib/graphql/queries'
import type { CircleListItem, GetCirclesResponse } from '@/lib/types/subgraph'

interface UseCirclesOptions {
  limit?: number
  offset?: number
}

interface UseCirclesReturn {
  circles: CircleListItem[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useCircles(options?: UseCirclesOptions): UseCirclesReturn {
  const { limit = 20, offset = 0 } = options ?? {}

  const { data, loading, error, refetch } = useQuery<GetCirclesResponse>(GET_CIRCLES, {
    client: subgraphClient,
    variables: {
      first: limit,
      skip: offset,
    },
    fetchPolicy: 'cache-and-network',
  })

  // Only show loading when no cached data exists (prevents flicker on refetch)
  const isInitialLoading = loading && !data

  return {
    circles: data?.circles ?? [],
    loading: isInitialLoading,
    error: error ?? null,
    refetch,
  }
}
