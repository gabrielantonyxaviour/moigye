'use client'

import { useState, useCallback } from 'react'
import { parseEther, type Address } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { getGyeFactoryWriteContract } from '@/lib/contracts/gye'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/config/chains'

export interface CircleConfig {
  name: string
  contributionAmount: bigint
  frequency: bigint
  totalRounds: number
  stakeRequired: bigint
  penaltyRate: number
  payoutMethod: 0 | 1 | 2 // AUCTION, RANDOM, FIXED_ORDER
}

interface UseCreateCircleReturn {
  createCircle: (config: CircleConfig) => Promise<Address | null>
  isLoading: boolean
  error: Error | null
}

const CHAIN_ID = 4613 // VeryChain mainnet

export function useCreateCircle(): UseCreateCircleReturn {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCircle = useCallback(
    async (config: CircleConfig): Promise<Address | null> => {
      if (!address || !publicClient || !walletClient) {
        setError(new Error('Wallet not connected'))
        return null
      }

      setIsLoading(true)
      setError(null)

      const toastId = toast.loading('Creating circle...')

      try {
        const contract = await getGyeFactoryWriteContract(publicClient, walletClient)
        const explorerUrl = getExplorerUrl(CHAIN_ID)

        const hash = await contract.write.createCircle([
          [
            config.name,
            config.contributionAmount,
            config.frequency,
            BigInt(config.totalRounds),
            config.stakeRequired,
            BigInt(config.penaltyRate),
            config.payoutMethod,
          ],
        ])

        toast.dismiss(toastId)
        toast.success('Circle created!', {
          description: `${hash.slice(0, 10)}...`,
          action: {
            label: 'View',
            onClick: () => window.open(`${explorerUrl}/tx/${hash}`, '_blank'),
          },
        })

        // Wait for receipt to get the circle address from events
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        // Parse CircleCreated event to get circle address
        const circleCreatedLog = receipt.logs.find(
          (log) => log.topics[0] === '0x...' // CircleCreated event signature
        )

        return circleCreatedLog?.address || null
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create circle')
        setError(error)
        toast.dismiss(toastId)
        toast.error('Failed to create circle', { description: error.message })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { createCircle, isLoading, error }
}
