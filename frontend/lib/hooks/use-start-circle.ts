'use client'

import { useState, useCallback } from 'react'
import type { Address, Hash } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { getGyeCircleWriteContract } from '@/lib/contracts/gye'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/config/chains'

const CHAIN_ID = 4613 // VeryChain mainnet

interface UseStartCircleReturn {
  startCircle: () => Promise<Hash | null>
  isLoading: boolean
  error: Error | null
}

export function useStartCircle(circleAddress: Address | undefined): UseStartCircleReturn {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const explorerUrl = getExplorerUrl(CHAIN_ID)

  const startCircle = useCallback(async (): Promise<Hash | null> => {
    if (!address || !publicClient || !walletClient || !circleAddress) {
      setError(new Error('Wallet not connected'))
      return null
    }

    setIsLoading(true)
    setError(null)

    const toastId = toast.loading('Starting circle...')

    try {
      const contract = await getGyeCircleWriteContract(publicClient, walletClient, circleAddress)
      const hash = await contract.write.startCircle()

      toast.dismiss(toastId)
      toast.success('Circle started!', {
        description: `${hash.slice(0, 10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`${explorerUrl}/tx/${hash}`, '_blank'),
        },
      })

      return hash
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start circle')
      setError(error)
      toast.dismiss(toastId)
      toast.error('Failed to start circle', { description: error.message })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, publicClient, walletClient, circleAddress, explorerUrl])

  return { startCircle, isLoading, error }
}
