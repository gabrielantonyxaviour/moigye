'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWriteContract, usePublicClient } from '@/lib/web3'
import { getContractAbi } from '@/constants/contracts'
import { formatTxError, type TransactionResult } from '@/lib/utils/tx-utils'
import type { Address, Abi } from 'viem'

const CHAIN_ID = 4613 // VeryChain mainnet

interface UseWithdrawStakeReturn {
  withdraw: () => Promise<TransactionResult>
  isLoading: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for withdrawing stake after circle completion
 * @param circleAddress - The address of the GyeCircle contract
 */
export function useWithdrawStake(circleAddress: Address): UseWithdrawStakeReturn {
  const { address: connectedAddress } = useAccount()
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [abi, setAbi] = useState<Abi | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load ABI on mount
  useEffect(() => {
    async function loadAbi() {
      try {
        const circleAbi = await getContractAbi(CHAIN_ID, 'GyeCircle')
        if (circleAbi) setAbi(circleAbi)
      } catch (err) {
        console.error('Failed to load GyeCircle ABI:', err)
      }
    }
    loadAbi()
  }, [])

  const waitForTransaction = useCallback(
    async (hash: `0x${string}`): Promise<boolean> => {
      if (!publicClient) return false
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        return receipt.status === 'success'
      } catch {
        return false
      }
    },
    [publicClient]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  /**
   * Withdraw stake after circle is completed
   */
  const withdraw = useCallback(async (): Promise<TransactionResult> => {
    if (!connectedAddress) {
      const errKey = 'errors.walletNotConnected'
      setError(errKey)
      throw new Error(errKey)
    }
    if (!abi) {
      const errKey = 'errors.abiNotLoaded'
      setError(errKey)
      throw new Error(errKey)
    }

    setIsLoading(true)
    setError(null)

    try {
      const hash = await writeContract({
        address: circleAddress,
        abi: abi as readonly unknown[],
        functionName: 'withdrawStake',
        args: [],
      })

      const success = await waitForTransaction(hash)
      return { hash, success }
    } catch (err) {
      const errMsg = formatTxError(err)
      setError(errMsg)
      throw new Error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }, [connectedAddress, circleAddress, abi, writeContract, waitForTransaction])

  return { withdraw, isLoading, error, reset }
}
