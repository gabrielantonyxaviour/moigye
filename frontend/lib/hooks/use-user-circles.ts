'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { subgraphClient } from '@/lib/graphql/client'
import { GET_USER_CIRCLES, GET_USER_CREATED_CIRCLES } from '@/lib/graphql/queries'
import type {
  MembershipWithCircle,
  GetUserCirclesResponse,
  UserCircleStats,
  CircleListItem,
} from '@/lib/types/subgraph'
import type { Address } from 'viem'

interface GetUserCreatedCirclesResponse {
  circles: CircleListItem[]
}

interface UseUserCirclesReturn {
  memberships: MembershipWithCircle[]
  createdCircles: CircleListItem[]
  stats: UserCircleStats
  loading: boolean
  error: Error | null
}

// Circle status enum values
const CircleStatus = {
  PENDING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const

export function useUserCircles(address: Address | undefined): UseUserCirclesReturn {
  const { data: memberData, loading: memberLoading, error: memberError } = useQuery<GetUserCirclesResponse>(GET_USER_CIRCLES, {
    client: subgraphClient,
    variables: { address: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'cache-and-network',
  })

  const { data: createdData, loading: createdLoading, error: createdError } = useQuery<GetUserCreatedCirclesResponse>(GET_USER_CREATED_CIRCLES, {
    client: subgraphClient,
    variables: { creator: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'cache-and-network',
  })

  const memberships = memberData?.members ?? []
  const createdCircles = createdData?.circles ?? []

  // Only show loading when no cached data exists (prevents flicker on refetch)
  const isInitialLoading = (memberLoading && !memberData) || (createdLoading && !createdData)

  const stats = useMemo<UserCircleStats>(() => {
    const memberCircleIds = new Set(memberships.map(m => m.circle.id))
    const uniqueCreatedCircles = createdCircles.filter(c => !memberCircleIds.has(c.id))
    const totalCircles = memberships.length + uniqueCreatedCircles.length

    if (totalCircles === 0) {
      return {
        totalCircles: 0,
        totalContributed: BigInt(0),
        activeCircles: 0,
        completedPayouts: 0,
      }
    }

    let totalContributed = BigInt(0)
    let activeCircles = 0
    let completedPayouts = 0

    for (const membership of memberships) {
      totalContributed += BigInt(membership.totalContributed || '0')
      if (membership.circle.status === CircleStatus.ACTIVE) {
        activeCircles++
      }
      if (membership.hasReceivedPayout) {
        completedPayouts++
      }
    }

    // Count active circles from created circles (not already counted as member)
    for (const circle of uniqueCreatedCircles) {
      if (circle.status === CircleStatus.ACTIVE) {
        activeCircles++
      }
    }

    return {
      totalCircles,
      totalContributed,
      activeCircles,
      completedPayouts,
    }
  }, [memberships, createdCircles])

  return {
    memberships,
    createdCircles,
    stats,
    loading: isInitialLoading,
    error: memberError ?? createdError ?? null,
  }
}
