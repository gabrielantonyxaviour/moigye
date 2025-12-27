'use client'

import { useQuery } from '@apollo/client/react'
import { NetworkStatus } from '@apollo/client'
import { subgraphClient } from '@/lib/graphql/client'
import { GET_CIRCLE } from '@/lib/graphql/queries'
import type { Circle, GetCircleResponse } from '@/lib/types/subgraph'

interface UseCircleReturn {
  circle: Circle | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCircle(circleId: string): UseCircleReturn {
  const { data, loading, error, networkStatus, refetch: apolloRefetch } = useQuery<GetCircleResponse>(GET_CIRCLE, {
    client: subgraphClient,
    variables: { id: circleId.toLowerCase() },
    pollInterval: 10000, // Poll every 10 seconds for updates
    skip: !circleId,
    notifyOnNetworkStatusChange: true,
  })

  // Only show loading on initial fetch, not during background polling
  const isInitialLoading = loading && networkStatus !== NetworkStatus.poll

  const refetch = async () => {
    await apolloRefetch()
  }

  return {
    circle: data?.circle ?? null,
    loading: isInitialLoading,
    error: error ?? null,
    refetch,
  }
}
