'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatEther } from 'viem'
import { isTenderlySupported } from '@/lib/web3/tenderly'
import type { TabProps } from './types'

export function SummaryTab({
  params,
  chain,
  targetChainId,
  isETHTransfer,
  simulation,
  simulating,
  aiSummary,
  generatingAI,
  isOnCorrectChain,
  switchingChain,
  onChainSwitch,
}: TabProps) {
  return (
    <div className="space-y-4">
      {/* Chain Switch Card */}
      {!isOnCorrectChain && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-orange-600">
              <AlertCircle className="h-4 w-4" />
              Wrong Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This transaction requires you to be on {chain?.name || 'the correct network'}. Please
              switch to continue.
            </p>
            <Button onClick={onChainSwitch} disabled={switchingChain} className="w-full">
              {switchingChain ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching Network...
                </>
              ) : (
                `Switch to ${chain?.name || 'Required Network'}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Image src="/google.svg" alt="Google" width={16} height={16} className="w-4 h-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatingAI ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : aiSummary ? (
            <p className="text-sm">{aiSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">AI summary unavailable</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tx Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {isETHTransfer ? 'Transaction Type' : 'Function'}
            </span>
            <Badge variant="outline">{isETHTransfer ? 'ETH Transfer' : params.functionName}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {isETHTransfer ? 'Recipient' : 'Contract'}
            </span>
            <code className="text-xs">
              {params.address.slice(0, 10)}...{params.address.slice(-8)}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="text-sm font-medium">
              {formatEther(params.value || BigInt('0'))} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="text-sm">{chain?.name || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Image src="/tenderly.svg" alt="Tenderly" width={16} height={16} className="w-4 h-4" />
            Tenderly Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isTenderlySupported(targetChainId) ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">
                Tenderly simulation not supported for this network
              </span>
            </div>
          ) : simulating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Running simulation...</span>
            </div>
          ) : simulation ? (
            <div className="flex items-center gap-2">
              {simulation.success ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Success</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Simulation failed: {simulation.error}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No simulation data</span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
