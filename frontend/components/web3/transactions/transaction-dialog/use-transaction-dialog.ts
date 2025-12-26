'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient, useGasPrice, useSwitchChain } from '@/lib/web3'
import { formatEther } from 'viem'
import {
  simulateContractCall,
  writeContract,
  estimateGas,
  type ContractCallParams,
  type SimulationResult,
} from '@/lib/web3/contracts'
import { simulateETHTransfer, transferETH, estimateETHTransferGas } from '@/lib/web3/eth-transfer'
import { generateTransactionSummary } from '@/lib/ai/gemini'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/config/chains'
import type { TransactionReceipt } from 'viem'

interface UseTransactionDialogProps {
  open: boolean
  params: ContractCallParams
  targetChainId: number
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
  onOpenChange: (open: boolean) => void
}

export function useTransactionDialog({
  open,
  params,
  targetChainId,
  onSuccess,
  onError,
  onOpenChange,
}: UseTransactionDialogProps) {
  const { address, chain } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const { gasPrice } = useGasPrice()
  const { switchChain } = useSwitchChain()

  const [activeTab, setActiveTab] = useState('summary')
  const [simulating, setSimulating] = useState(false)
  const [estimatingGas, setEstimatingGas] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [switchingChain, setSwitchingChain] = useState(false)
  const [simulation, setSimulation] = useState<SimulationResult | undefined>(undefined)
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const hasLoadedRef = useRef(false)

  const explorerUrl = targetChainId ? getExplorerUrl(targetChainId) : null
  const isOnCorrectChain = chain?.id === targetChainId
  const isETHTransfer =
    params?.abi?.length === 0 && params?.functionName === 'transfer' && params?.value

  const estimateGasUsage = useCallback(
    async (simulationResult?: SimulationResult) => {
      if (!address || !publicClient || !chain || !params) return
      setEstimatingGas(true)
      try {
        const gas = isETHTransfer
          ? await estimateETHTransferGas(
              publicClient,
              address,
              { to: params.address, value: params.value! },
              simulationResult
            )
          : await estimateGas(publicClient, address, params, chain, simulationResult)

        setGasEstimate(gas)
        if (gasPrice && gas) setEstimatedCost(formatEther(gas * gasPrice))
      } catch (e) {
        console.error('Gas estimation failed:', e)
      } finally {
        setEstimatingGas(false)
      }
    },
    [address, publicClient, chain, params, isETHTransfer, gasPrice]
  )

  const generateAISummary = useCallback(async () => {
    if (!chain || !params) return
    setGeneratingAI(true)
    try {
      const summary = await generateTransactionSummary({
        functionName: isETHTransfer ? 'ETH Transfer' : params.functionName,
        contractAddress: params.address,
        args: isETHTransfer ? [] : (params.args as unknown[]),
        value: params.value ? formatEther(params.value) : undefined,
        gasEstimate: gasEstimate?.toString(),
        estimatedCost: estimatedCost || undefined,
        chainName: chain.name,
      })
      setAiSummary(summary)
    } catch {
      setAiSummary('AI summary unavailable')
    } finally {
      setGeneratingAI(false)
    }
  }, [chain, params, isETHTransfer, gasEstimate, estimatedCost])

  const loadTransactionData = useCallback(async () => {
    if (!address || !publicClient || !chain || !isOnCorrectChain || !params) {
      setIsLoadingData(false)
      return
    }

    setSimulating(true)
    let result: SimulationResult | null = null
    try {
      result = isETHTransfer
        ? ((await simulateETHTransfer(
            publicClient,
            address,
            { to: params.address, value: params.value! },
            targetChainId
          )) as SimulationResult)
        : await simulateContractCall(publicClient, address, params, chain)
      setSimulation(result)
    } catch (e) {
      result = { success: false, error: e instanceof Error ? e.message : 'Simulation failed' }
      setSimulation(result)
    } finally {
      setSimulating(false)
    }

    await Promise.allSettled([estimateGasUsage(result), generateAISummary()])
    setIsLoadingData(false)
  }, [
    address,
    publicClient,
    chain,
    isOnCorrectChain,
    params,
    isETHTransfer,
    targetChainId,
    estimateGasUsage,
    generateAISummary,
  ])

  useEffect(() => {
    if (open && !hasLoadedRef.current) {
      setActiveTab('summary')
      setSimulation(undefined)
      setGasEstimate(null)
      setAiSummary(null)
      setEstimatedCost(null)
      if (isOnCorrectChain && !isLoadingData) {
        setIsLoadingData(true)
        hasLoadedRef.current = true
        loadTransactionData()
      }
    }
    if (!open) {
      hasLoadedRef.current = false
      setIsLoadingData(false)
    }
  }, [open, isOnCorrectChain, isLoadingData, loadTransactionData])

  const handleChainSwitch = useCallback(async () => {
    if (!switchChain) return
    setSwitchingChain(true)
    try {
      await switchChain(targetChainId)
    } catch {
      toast.error('Failed to switch chain')
    } finally {
      setSwitchingChain(false)
    }
  }, [switchChain, targetChainId])

  const executeTransaction = useCallback(async () => {
    if (!publicClient || !walletClient || !address || !chain || !isOnCorrectChain) return

    onOpenChange(false)
    const toastId = toast.loading('Waiting for wallet confirmation...')

    try {
      const result = isETHTransfer
        ? await transferETH(
            publicClient,
            walletClient,
            address,
            { to: params.address, value: params.value! },
            simulation
          )
        : await writeContract(publicClient, walletClient, address, params, chain, simulation)

      toast.dismiss(toastId)
      onSuccess?.(result.receipt)
      toast.success('Transaction Successful!', {
        description: `${result.hash.slice(0, 10)}...`,
        action: explorerUrl
          ? { label: 'View', onClick: () => window.open(`${explorerUrl}/tx/${result.hash}`, '_blank') }
          : undefined,
      })
    } catch (e) {
      toast.dismiss(toastId)
      const err = e instanceof Error ? e : new Error(String(e))
      onError?.(err)
      toast.error('Transaction Failed', { description: err.message })
    }
  }, [
    publicClient,
    walletClient,
    address,
    chain,
    isOnCorrectChain,
    params,
    isETHTransfer,
    simulation,
    onSuccess,
    onError,
    onOpenChange,
    explorerUrl,
  ])

  return {
    address,
    chain,
    activeTab,
    setActiveTab,
    simulation,
    simulating,
    gasEstimate,
    gasPrice,
    estimatedCost,
    estimatingGas,
    aiSummary,
    generatingAI,
    isOnCorrectChain,
    switchingChain,
    isETHTransfer: !!isETHTransfer,
    handleChainSwitch,
    executeTransaction,
    walletClient,
  }
}
