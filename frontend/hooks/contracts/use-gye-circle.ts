'use client'

import { useState, useCallback } from 'react'
import type { Address, Hash } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { getGyeCircleWriteContract, getGyeCircleContract } from '@/lib/contracts/gye'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/config/chains'

const CHAIN_ID = 4613 // VeryChain mainnet

interface TxResult {
  hash: Hash
  success: boolean
}

interface UseGyeCircleReturn {
  join: (circleAddress: Address, stakeAmount: bigint) => Promise<TxResult | null>
  contribute: (circleAddress: Address, amount: bigint) => Promise<TxResult | null>
  placeBid: (circleAddress: Address, bidAmount: bigint) => Promise<TxResult | null>
  claimPayout: (circleAddress: Address) => Promise<TxResult | null>
  withdrawStake: (circleAddress: Address) => Promise<TxResult | null>
  isLoading: boolean
  error: Error | null
}

export function useGyeCircle(): UseGyeCircleReturn {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const explorerUrl = getExplorerUrl(CHAIN_ID)

  const executeTx = useCallback(
    async (
      circleAddress: Address,
      action: string,
      txFn: () => Promise<Hash>
    ): Promise<TxResult | null> => {
      if (!address || !publicClient || !walletClient) {
        setError(new Error('Wallet not connected'))
        return null
      }

      setIsLoading(true)
      setError(null)

      const toastId = toast.loading(`${action}...`)

      try {
        const hash = await txFn()

        toast.dismiss(toastId)
        toast.success(`${action} successful!`, {
          description: `${hash.slice(0, 10)}...`,
          action: {
            label: 'View',
            onClick: () => window.open(`${explorerUrl}/tx/${hash}`, '_blank'),
          },
        })

        return { hash, success: true }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Failed to ${action.toLowerCase()}`)
        setError(error)
        toast.dismiss(toastId)
        toast.error(`${action} failed`, { description: error.message })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [address, publicClient, walletClient, explorerUrl]
  )

  const join = useCallback(
    async (circleAddress: Address, stakeAmount: bigint) => {
      if (!publicClient || !walletClient) return null

      return executeTx(circleAddress, 'Joining circle', async () => {
        const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
        return contract.write.join({ value: stakeAmount })
      })
    },
    [publicClient, walletClient, executeTx]
  )

  const contribute = useCallback(
    async (circleAddress: Address, amount: bigint) => {
      if (!publicClient || !walletClient) return null

      return executeTx(circleAddress, 'Making contribution', async () => {
        const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
        return contract.write.contribute({ value: amount })
      })
    },
    [publicClient, walletClient, executeTx]
  )

  const placeBid = useCallback(
    async (circleAddress: Address, bidAmount: bigint) => {
      if (!publicClient || !walletClient) return null

      return executeTx(circleAddress, 'Placing bid', async () => {
        const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
        return contract.write.bid([bidAmount])
      })
    },
    [publicClient, walletClient, executeTx]
  )

  const claimPayout = useCallback(
    async (circleAddress: Address) => {
      if (!publicClient || !walletClient) return null

      return executeTx(circleAddress, 'Claiming payout', async () => {
        const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
        return contract.write.claimPayout()
      })
    },
    [publicClient, walletClient, executeTx]
  )

  const withdrawStake = useCallback(
    async (circleAddress: Address) => {
      if (!publicClient || !walletClient) return null

      return executeTx(circleAddress, 'Withdrawing stake', async () => {
        const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
        return contract.write.withdrawStake()
      })
    },
    [publicClient, walletClient, executeTx]
  )

  return {
    join,
    contribute,
    placeBid,
    claimPayout,
    withdrawStake,
    isLoading,
    error,
  }
}

// Read-only hook for circle data
interface CircleConfig {
  name: string
  contributionAmount: bigint
  frequency: bigint
  totalRounds: bigint
  stakeRequired: bigint
  penaltyRate: bigint
  payoutMethod: number
}

interface UseCircleDataReturn {
  config: CircleConfig | null
  isMember: boolean
  hasContributed: boolean
  loading: boolean
  refetch: () => Promise<void>
}

export function useCircleData(circleAddress: Address | undefined): UseCircleDataReturn {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const [config, setConfig] = useState<CircleConfig | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [hasContributed, setHasContributed] = useState(false)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!circleAddress || !publicClient) return

    setLoading(true)
    try {
      const contract = await getGyeCircleContract(publicClient, circleAddress)

      const [configResult, memberResult, contributedResult] = await Promise.all([
        contract.read.getConfig() as Promise<CircleConfig>,
        address ? (contract.read.isMember([address]) as Promise<boolean>) : Promise.resolve(false),
        address ? (contract.read.hasContributed([address]) as Promise<boolean>) : Promise.resolve(false),
      ])

      setConfig(configResult)
      setIsMember(memberResult)
      setHasContributed(contributedResult)
    } catch (err) {
      console.error('Failed to fetch circle data:', err)
    } finally {
      setLoading(false)
    }
  }, [circleAddress, publicClient, address])

  return { config, isMember, hasContributed, loading, refetch }
}
