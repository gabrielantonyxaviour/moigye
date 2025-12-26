'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Fuel, TrendingUp } from 'lucide-react'
import { formatEther, formatGwei } from 'viem'
import type { TabProps } from './types'

export function GasTab({
  params,
  simulation,
  gasEstimate,
  gasPrice,
  estimatedCost,
  estimatingGas,
}: TabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Gas Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current Gas Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Gas Price</span>
            {gasPrice ? (
              <span className="text-sm font-mono">{formatGwei(gasPrice)} gwei</span>
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </div>

          {/* Estimated Gas */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estimated Gas</span>
            {estimatingGas ? (
              <Skeleton className="h-4 w-24" />
            ) : gasEstimate ? (
              <span className="text-sm font-mono">{gasEstimate.toString()}</span>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>

          {/* Tenderly Gas Used */}
          {simulation?.gasUsed && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tenderly Gas Estimate</span>
              <span className="text-sm font-mono">{simulation.gasUsed}</span>
            </div>
          )}

          {/* Estimated Cost */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Transaction Cost</span>
              {estimatedCost ? (
                <div className="text-right">
                  <p className="text-sm font-medium">{estimatedCost} ETH</p>
                  <p className="text-xs text-muted-foreground">
                    + {params.value ? formatEther(params.value) : '0'} ETH value
                  </p>
                </div>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {estimatedCost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gas Fee</span>
                <span>{estimatedCost} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Value</span>
                <span>{formatEther(params.value || BigInt('0'))} ETH</span>
              </div>
              <div className="pt-2 border-t flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium">
                  {formatEther(
                    (gasEstimate && gasPrice ? gasEstimate * gasPrice : 0n) + (params.value || 0n)
                  )}{' '}
                  ETH
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
