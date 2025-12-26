'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isTenderlySupported } from '@/lib/web3/tenderly'
import { Activity } from 'lucide-react'

import type { TransactionDialogProps, TabProps } from './types'
import { SummaryTab } from './summary-tab'
import { SimulationTab } from './simulation-tab'
import { GasTab } from './gas-tab'
import { DetailsTab } from './details-tab'
import { useTransactionDialog } from './use-transaction-dialog'

export function TransactionDialog({
  open,
  onOpenChange,
  params,
  chainId: targetChainId,
  onSuccess,
  onError,
}: TransactionDialogProps) {
  const {
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
    isETHTransfer,
    handleChainSwitch,
    executeTransaction,
    walletClient,
  } = useTransactionDialog({
    open,
    params,
    targetChainId,
    onSuccess,
    onError,
    onOpenChange,
  })

  if (!params) return null

  const tabProps: TabProps = {
    params,
    chain,
    targetChainId,
    isETHTransfer,
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
    onChainSwitch: handleChainSwitch,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Preview
          </DialogTitle>
          <DialogDescription>Review all transaction details before confirming</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="simulation">Tenderly</TabsTrigger>
            <TabsTrigger value="gas">Gas & Cost</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab {...tabProps} />
          </TabsContent>
          <TabsContent value="simulation">
            <SimulationTab {...tabProps} />
          </TabsContent>
          <TabsContent value="gas">
            <GasTab {...tabProps} />
          </TabsContent>
          <TabsContent value="details">
            <DetailsTab {...tabProps} address={address} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={executeTransaction}
            disabled={
              (!simulation?.success && isTenderlySupported(targetChainId)) ||
              !address ||
              !walletClient ||
              !isOnCorrectChain
            }
          >
            Execute Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
