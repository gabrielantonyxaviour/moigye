'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePublicClient } from '@/lib/web3'
import { getContractAbi } from '@/constants/contracts'
import type { Address, Abi } from 'viem'
import type { CircleStatus } from '@/lib/utils/tx-utils'

const CHAIN_ID = 4613 // VeryChain mainnet
const POLL_INTERVAL = 10000 // 10 seconds

export interface MemberInfo {
  addr: Address
  stakeDeposited: bigint
  hasReceivedPayout: boolean
  joinedAt: bigint
  payoutOrder: bigint
}

export interface MemberStatusData {
  isMember: boolean
  memberInfo: MemberInfo | null
  hasContributed: boolean
  canClaim: boolean
  canWithdraw: boolean
}

interface UseMemberStatusReturn extends MemberStatusData {
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for checking member status in a circle
 */
export function useMemberStatus(
  circleAddress: Address,
  memberAddress: Address | undefined
): UseMemberStatusReturn {
  const { publicClient } = usePublicClient()
  const [abi, setAbi] = useState<Abi | null>(null)
  const [data, setData] = useState<MemberStatusData>({
    isMember: false,
    memberInfo: null,
    hasContributed: false,
    canClaim: false,
    canWithdraw: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const hasFetchedOnce = useRef(false)

  // Load ABI on mount
  useEffect(() => {
    async function loadAbi() {
      try {
        const circleAbi = await getContractAbi(CHAIN_ID, 'GyeCircle')
        if (circleAbi) setAbi(circleAbi)
      } catch (err) {
        console.error('Failed to load GyeCircle ABI:', err)
        setError(err as Error)
      }
    }
    loadAbi()
  }, [])

  const fetchData = useCallback(async (isPolling = false) => {
    if (!publicClient || !abi || !memberAddress) {
      setLoading(false)
      return
    }

    // Only show loading spinner on initial fetch, not during polling
    if (!isPolling && !hasFetchedOnce.current) {
      setLoading(true)
    }

    try {
      // Check if member
      const isMember = (await publicClient.readContract({
        address: circleAddress,
        abi,
        functionName: 'isMember',
        args: [memberAddress],
      })) as boolean

      if (!isMember) {
        setData({
          isMember: false,
          memberInfo: null,
          hasContributed: false,
          canClaim: false,
          canWithdraw: false,
        })
        setLoading(false)
        return
      }

      // Fetch member details and status
      const [memberResult, hasContributedResult, statusResult, roundResult, configResult] =
        await Promise.all([
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getMember',
            args: [memberAddress],
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'hasContributed',
            args: [memberAddress],
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getStatus',
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getCurrentRound',
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getConfig',
          }),
        ])

      // Parse member tuple
      const memberTuple = memberResult as readonly [Address, bigint, boolean, bigint, bigint]
      const memberInfo: MemberInfo = {
        addr: memberTuple[0],
        stakeDeposited: memberTuple[1],
        hasReceivedPayout: memberTuple[2],
        joinedAt: memberTuple[3],
        payoutOrder: memberTuple[4],
      }

      const status = statusResult as CircleStatus
      const roundTuple = roundResult as readonly [bigint, bigint, bigint, bigint, Address, boolean]
      const configTuple = configResult as readonly [string, bigint, bigint, bigint, bigint, bigint, number]
      const payoutMethod = configTuple[6]
      const roundDeadline = roundTuple[2]
      const roundDistributed = roundTuple[5]

      // Determine if member can claim (FIXED_ORDER only)
      // Can claim if: FIXED_ORDER method, hasn't received payout, round ended, not distributed
      const currentTime = BigInt(Math.floor(Date.now() / 1000))
      const canClaim =
        payoutMethod === 2 && // FIXED_ORDER
        !memberInfo.hasReceivedPayout &&
        currentTime > roundDeadline &&
        !roundDistributed

      // Can withdraw if circle is completed and has stake
      const canWithdraw = status === 2 && memberInfo.stakeDeposited > 0n // COMPLETED

      setData({
        isMember: true,
        memberInfo,
        hasContributed: hasContributedResult as boolean,
        canClaim,
        canWithdraw,
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch member status:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
      hasFetchedOnce.current = true
    }
  }, [publicClient, abi, circleAddress, memberAddress])

  // Initial fetch and polling
  useEffect(() => {
    if (!abi || !memberAddress) return

    fetchData(false) // Initial fetch
    const interval = setInterval(() => fetchData(true), POLL_INTERVAL) // Polling
    return () => clearInterval(interval)
  }, [abi, memberAddress, fetchData])

  return {
    ...data,
    loading,
    error,
    refetch: fetchData,
  }
}
