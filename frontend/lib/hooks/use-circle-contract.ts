'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from '@/lib/web3'
import { getContractAbi } from '@/constants/contracts'
import type { Address, Abi } from 'viem'
import type { CircleStatus, PayoutMethod } from '@/lib/utils/tx-utils'

const CHAIN_ID = 4613 // VeryChain mainnet
const POLL_INTERVAL = 10000 // 10 seconds

export interface CircleConfig {
  name: string
  contributionAmount: bigint
  frequency: bigint
  totalRounds: bigint
  stakeRequired: bigint
  penaltyRate: bigint
  payoutMethod: PayoutMethod
}

export interface CircleRound {
  roundNumber: bigint
  startTime: bigint
  deadline: bigint
  totalContributed: bigint
  winner: Address
  distributed: boolean
}

export interface CircleContractData {
  config: CircleConfig | null
  status: CircleStatus | null
  currentRound: CircleRound | null
  memberCount: number
  poolBalance: bigint
  highestBid: { bidder: Address; amount: bigint } | null
}

interface UseCircleContractReturn extends CircleContractData {
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for reading circle state directly from contract
 * Use for real-time balance checks and contract state
 */
export function useCircleContract(circleAddress: Address): UseCircleContractReturn {
  const { publicClient } = usePublicClient()
  const [abi, setAbi] = useState<Abi | null>(null)
  const [data, setData] = useState<CircleContractData>({
    config: null,
    status: null,
    currentRound: null,
    memberCount: 0,
    poolBalance: 0n,
    highestBid: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

  const fetchData = useCallback(async () => {
    if (!publicClient || !abi) return

    try {
      // Batch read all contract data
      const [configResult, statusResult, roundResult, membersResult, balanceResult, bidResult] =
        await Promise.all([
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getConfig',
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
            functionName: 'getMembers',
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getPoolBalance',
          }),
          publicClient.readContract({
            address: circleAddress,
            abi,
            functionName: 'getHighestBid',
          }),
        ])

      // Parse config tuple
      const configTuple = configResult as readonly [string, bigint, bigint, bigint, bigint, bigint, number]
      const config: CircleConfig = {
        name: configTuple[0],
        contributionAmount: configTuple[1],
        frequency: configTuple[2],
        totalRounds: configTuple[3],
        stakeRequired: configTuple[4],
        penaltyRate: configTuple[5],
        payoutMethod: configTuple[6] as PayoutMethod,
      }

      // Parse round tuple
      const roundTuple = roundResult as readonly [bigint, bigint, bigint, bigint, Address, boolean]
      const currentRound: CircleRound = {
        roundNumber: roundTuple[0],
        startTime: roundTuple[1],
        deadline: roundTuple[2],
        totalContributed: roundTuple[3],
        winner: roundTuple[4],
        distributed: roundTuple[5],
      }

      // Parse bid tuple
      const bidTuple = bidResult as readonly [Address, bigint]
      const highestBid =
        bidTuple[0] !== '0x0000000000000000000000000000000000000000'
          ? { bidder: bidTuple[0], amount: bidTuple[1] }
          : null

      setData({
        config,
        status: statusResult as CircleStatus,
        currentRound,
        memberCount: (membersResult as Address[]).length,
        poolBalance: balanceResult as bigint,
        highestBid,
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch circle data:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [publicClient, abi, circleAddress])

  // Initial fetch and polling
  useEffect(() => {
    if (!abi) return

    fetchData()
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [abi, fetchData])

  return {
    ...data,
    loading,
    error,
    refetch: fetchData,
  }
}
