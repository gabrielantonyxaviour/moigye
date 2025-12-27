'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWriteContract, usePublicClient } from '@/lib/web3'
import { getContractByName, getContractAbi } from '@/constants/contracts'
import { formatTxError, parseEventLogs, type TransactionResult, type PayoutMethod, type ParsedEvent } from '@/lib/utils/tx-utils'
import type { Address, Abi } from 'viem'
import { encodeFunctionData } from 'viem'

const CHAIN_ID = 4613 // VeryChain mainnet
const GAS_BUFFER_PERCENT = 20n // Add 20% buffer to gas estimate
const FALLBACK_GAS_LIMIT = 3_000_000n // Fallback if estimation fails

interface ContractInfo {
  address: Address
  abi: Abi
}

export interface CreateCircleParams {
  name: string
  contributionAmount: bigint
  frequency: bigint
  totalRounds: number
  stakeRequired: bigint
  penaltyRate: number // basis points (100 = 1%)
  payoutMethod: PayoutMethod
}

export interface CreateCircleResult {
  circleId: bigint
  circleAddress: Address
}

interface UseCreateCircleReturn {
  createCircle: (params: CreateCircleParams) => Promise<TransactionResult<CreateCircleResult>>
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useCreateCircle(): UseCreateCircleReturn {
  const { address: connectedAddress } = useAccount()
  const { writeContract } = useWriteContract()
  const { publicClient } = usePublicClient()
  const [contract, setContract] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load contract on mount
  useEffect(() => {
    async function loadContract() {
      try {
        const factory = await getContractByName(CHAIN_ID, 'GyeFactory')
        if (factory) {
          setContract({ address: factory.address, abi: factory.abi })
        }
      } catch (err) {
        console.error('Failed to load GyeFactory contract:', err)
      }
    }
    loadContract()
  }, [])

  const waitForTransaction = useCallback(
    async (
      hash: `0x${string}`,
      client: NonNullable<typeof publicClient>,
      contractInfo: ContractInfo
    ): Promise<{ success: boolean; circleId?: bigint; circleAddress?: Address }> => {
      try {
        console.log('[waitForTransaction] Waiting for receipt...')
        const receipt = await client.waitForTransactionReceipt({ hash })
        console.log('[waitForTransaction] Receipt received:', receipt.status)
        if (receipt.status !== 'success') {
          console.log('[waitForTransaction] Transaction reverted')
          return { success: false }
        }

        // Parse CircleCreated event
        console.log('[waitForTransaction] Parsing events from', receipt.logs.length, 'logs')
        const events = parseEventLogs(receipt, contractInfo.abi, 'CircleCreated')
        console.log('[waitForTransaction] Found', events.length, 'CircleCreated events')
        if (events.length > 0 && events[0].args) {
          const args = events[0].args
          console.log('[waitForTransaction] Event args:', args)
          const circleId = args.circleId as bigint | undefined
          const circleAddress = args.circleAddress as Address | undefined
          if (circleId !== undefined && circleAddress) {
            return {
              success: true,
              circleId,
              circleAddress,
            }
          }
        }
        // Transaction succeeded but couldn't parse event - still success
        console.log('[waitForTransaction] Transaction succeeded but no CircleCreated event found')
        return { success: true }
      } catch (err) {
        console.error('[waitForTransaction] Error:', err)
        return { success: false }
      }
    },
    []
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  const createCircle = useCallback(
    async (params: CreateCircleParams): Promise<TransactionResult<CreateCircleResult>> => {
      if (!connectedAddress) {
        const errKey = 'errors.walletNotConnected'
        setError(errKey)
        throw new Error(errKey)
      }
      if (!contract) {
        const errKey = 'errors.contractNotLoaded'
        setError(errKey)
        throw new Error(errKey)
      }
      if (!publicClient) {
        const errKey = 'errors.clientNotReady'
        setError(errKey)
        throw new Error(errKey)
      }

      setIsLoading(true)
      setError(null)

      try {
        // Build config tuple
        const config = [
          params.name,
          params.contributionAmount,
          params.frequency,
          BigInt(params.totalRounds),
          params.stakeRequired,
          BigInt(params.penaltyRate),
          params.payoutMethod,
        ] as const

        // Calculate value to send (stake + contribution for creator to auto-join)
        const valueToSend = params.stakeRequired + params.contributionAmount

        console.log('[createCircle] Sending transaction with config:', config)
        console.log('[createCircle] Value to send:', valueToSend.toString())
        console.log('[createCircle] Contract address:', contract.address)
        console.log('[createCircle] PublicClient available:', !!publicClient)

        // Estimate gas with buffer, fallback to high limit if estimation fails
        let gasLimit = FALLBACK_GAS_LIMIT
        try {
          const data = encodeFunctionData({
            abi: contract.abi,
            functionName: 'createAndJoinCircle',
            args: [config],
          })
          const estimatedGas = await publicClient.estimateGas({
            account: connectedAddress,
            to: contract.address,
            data,
            value: valueToSend,
          })
          // Add buffer to estimate
          gasLimit = estimatedGas + (estimatedGas * GAS_BUFFER_PERCENT) / 100n
          console.log('[createCircle] Estimated gas:', estimatedGas, 'with buffer:', gasLimit)
        } catch (estimateErr) {
          console.warn('[createCircle] Gas estimation failed, using fallback:', estimateErr)
        }

        const hash = await writeContract({
          address: contract.address,
          abi: contract.abi as readonly unknown[],
          functionName: 'createAndJoinCircle',
          args: [config],
          value: valueToSend,
          gas: gasLimit,
        })

        console.log('[createCircle] Transaction hash received:', hash)

        // Pass publicClient and contract directly to avoid stale closure
        const result = await waitForTransaction(hash, publicClient, contract)
        console.log('[createCircle] Transaction result:', result)

        if (result.success && result.circleId !== undefined && result.circleAddress) {
          console.log('[createCircle] Success! CircleId:', result.circleId, 'Address:', result.circleAddress)
          return {
            hash,
            success: true,
            data: {
              circleId: result.circleId,
              circleAddress: result.circleAddress,
            },
          }
        }

        console.log('[createCircle] Returning with success:', result.success)
        return { hash, success: result.success }
      } catch (err) {
        console.error('[createCircle] Error caught:', err)
        const errMsg = formatTxError(err)
        setError(errMsg)
        throw new Error(errMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [connectedAddress, contract, publicClient, writeContract, waitForTransaction]
  )

  return { createCircle, isLoading, error, reset }
}
