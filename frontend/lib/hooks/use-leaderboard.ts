'use client'

import { useQuery } from '@apollo/client/react'
import { subgraphClient } from '@/lib/graphql/client'
import {
  GET_TOP_CIRCLES_BY_CONTRIBUTIONS,
  GET_TOP_MEMBERS_BY_CONTRIBUTIONS,
} from '@/lib/graphql/queries'
import type {
  LeaderboardCircle,
  LeaderboardMember,
  GetTopCirclesResponse,
  GetTopMembersResponse,
} from '@/lib/types/subgraph'

interface UseLeaderboardOptions {
  limit?: number
}

interface UseCircleLeaderboardReturn {
  circles: LeaderboardCircle[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

interface UseMemberLeaderboardReturn {
  members: LeaderboardMember[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useCircleLeaderboard(
  options?: UseLeaderboardOptions
): UseCircleLeaderboardReturn {
  const { limit = 20 } = options ?? {}

  const { data, loading, error, refetch } = useQuery<GetTopCirclesResponse>(
    GET_TOP_CIRCLES_BY_CONTRIBUTIONS,
    {
      client: subgraphClient,
      variables: { first: limit },
      fetchPolicy: 'cache-and-network',
    }
  )

  // Only show loading when no cached data exists (prevents flicker on refetch)
  const isInitialLoading = loading && !data

  return {
    circles: data?.circles ?? [],
    loading: isInitialLoading,
    error: error ?? null,
    refetch,
  }
}

export function useMemberLeaderboard(
  options?: UseLeaderboardOptions
): UseMemberLeaderboardReturn {
  const { limit = 20 } = options ?? {}

  const { data, loading, error, refetch } = useQuery<GetTopMembersResponse>(
    GET_TOP_MEMBERS_BY_CONTRIBUTIONS,
    {
      client: subgraphClient,
      variables: { first: limit },
      fetchPolicy: 'cache-and-network',
    }
  )

  // Only show loading when no cached data exists (prevents flicker on refetch)
  const isInitialLoading = loading && !data

  return {
    members: data?.members ?? [],
    loading: isInitialLoading,
    error: error ?? null,
    refetch,
  }
}
