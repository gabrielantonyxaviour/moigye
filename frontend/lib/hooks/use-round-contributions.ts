'use client'

import { useQuery } from '@apollo/client/react'
import { subgraphClient } from '@/lib/graphql/client'
import { GET_CIRCLE_CONTRIBUTIONS } from '@/lib/graphql/queries'
import type { Contribution, GetCircleContributionsResponse } from '@/lib/types/subgraph'

interface UseRoundContributionsReturn {
  contributions: Contribution[]
  loading: boolean
  error: Error | null
}

export function useRoundContributions(
  circleId: string,
  roundNumber: number
): UseRoundContributionsReturn {
  const { data, loading, error } = useQuery<GetCircleContributionsResponse>(
    GET_CIRCLE_CONTRIBUTIONS,
    {
      client: subgraphClient,
      variables: {
        circleId: circleId.toLowerCase(),
        roundNumber,
      },
      skip: !circleId || roundNumber < 1,
      fetchPolicy: 'cache-and-network',
    }
  )

  return {
    contributions: data?.contributions ?? [],
    loading,
    error: error ?? null,
  }
}
