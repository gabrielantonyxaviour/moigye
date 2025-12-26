import type { TransactionReceipt, Chain } from 'viem'
import type { ContractCallParams, SimulationResult } from '@/lib/web3/contracts'

export interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  params: ContractCallParams
  chainId: number
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
}

export interface TabProps {
  params: ContractCallParams
  chain: Chain | undefined
  targetChainId: number
  isETHTransfer: boolean
  simulation: SimulationResult | undefined
  simulating: boolean
  gasEstimate: bigint | null
  gasPrice: bigint | undefined
  estimatedCost: string | null
  estimatingGas: boolean
  aiSummary: string | null
  generatingAI: boolean
  isOnCorrectChain: boolean
  switchingChain: boolean
  onChainSwitch: () => Promise<void>
}

// Helper to serialize BigInt values
export function stringifyWithBigInt(obj: unknown): string {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n'
      }
      return value
    },
    2
  )
}
