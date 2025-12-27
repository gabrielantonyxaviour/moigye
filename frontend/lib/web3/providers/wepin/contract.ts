/**
 * Contract Hooks - WEPIN Implementation
 *
 * Provides contract read/write functionality using viem and WEPIN.
 */

'use client'

import { useCallback, useState, useEffect } from 'react'
import { createPublicClient, http, encodeFunctionData, toHex } from 'viem'
import { useWepinContext } from './wepin-client'
import { getChainById } from '@/lib/config/chains'
import type {
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,
  Address,
} from './types'

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

/**
 * Hook to read from a contract
 */
export function useReadContract<T = unknown>(params: UseReadContractParams): UseReadContractReturn<T> {
  const { address, abi, functionName, args, chainId: paramChainId, watch = false } = params
  const { chainId: currentChainId } = useWepinContext()

  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const targetChainId = paramChainId || currentChainId

  const fetchData = useCallback(async () => {
    if (!targetChainId) {
      setError(new Error('No chain ID available'))
      return
    }

    const chainConfig = getChainById(targetChainId)
    if (!chainConfig?.rpcUrl) {
      setError(new Error(`No RPC URL configured for chain ${targetChainId}`))
      return
    }

    const client = createPublicClient({
      chain: {
        id: targetChainId,
        name: chainConfig.name,
        nativeCurrency: chainConfig.chain.nativeCurrency,
        rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
      },
      transport: http(chainConfig.rpcUrl),
    })

    try {
      const result = await client.readContract({
        address,
        abi: abi as readonly unknown[],
        functionName,
        args: args as readonly unknown[],
      })
      setData(result as T)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to read contract'))
    }
  }, [address, abi, functionName, args, targetChainId])

  // Initial fetch
  useEffect(() => {
    setIsLoading(true)
    fetchData().finally(() => setIsLoading(false))
  }, [fetchData])

  // Watch interval
  useEffect(() => {
    if (!watch) return

    const interval = setInterval(() => {
      setIsRefetching(true)
      fetchData().finally(() => setIsRefetching(false))
    }, 10000)

    return () => clearInterval(interval)
  }, [watch, fetchData])

  // Refetch trigger
  useEffect(() => {
    if (refetchTrigger > 0) {
      setIsRefetching(true)
      fetchData().finally(() => setIsRefetching(false))
    }
  }, [refetchTrigger, fetchData])

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  return { data, isLoading, isRefetching, error, refetch }
}

/**
 * Hook to write to a contract
 */
export function useWriteContract(): UseWriteContractReturn {
  const { networkProvider, address: connectedAddress, chainId, isConnected } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const writeContract = useCallback(
    async (params: {
      address: Address
      abi: readonly unknown[]
      functionName: string
      args?: readonly unknown[]
      value?: bigint
      gas?: bigint
    }): Promise<`0x${string}`> => {
      if (!networkProvider || !connectedAddress || !isConnected) {
        throw new Error('Wallet not connected')
      }

      setIsPending(true)
      setError(null)

      try {
        const provider = networkProvider as EIP1193Provider

        // Encode the function data
        const data = encodeFunctionData({
          abi: params.abi as readonly unknown[],
          functionName: params.functionName,
          args: params.args as readonly unknown[],
        })

        // Prepare transaction with optional gas limit
        const txParams: Record<string, unknown> = {
          from: connectedAddress,
          to: params.address,
          data,
        }

        if (params.value) {
          txParams.value = toHex(params.value)
        }

        // Add gas limit if provided (important for contract deployments)
        if (params.gas) {
          txParams.gas = toHex(params.gas)
        }

        console.log('[writeContract] Sending eth_sendTransaction with params:', txParams)

        const hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        })

        console.log('[writeContract] Received hash from provider:', hash)

        return hash as `0x${string}`
      } catch (err) {
        console.error('[writeContract] Error:', err)
        const error = err instanceof Error ? err : new Error('Contract write failed')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [networkProvider, connectedAddress, isConnected]
  )

  return { writeContract, isPending, error }
}
