'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash } from 'lucide-react'
import { encodeFunctionData, formatEther, type Address } from 'viem'
import { stringifyWithBigInt, type TabProps } from './types'

interface DetailsTabProps extends TabProps {
  address: Address | undefined
}

export function DetailsTab({
  params,
  targetChainId,
  isETHTransfer,
  gasEstimate,
  gasPrice,
  address,
}: DetailsTabProps) {
  const getEncodedData = () => {
    if (isETHTransfer || !params?.abi || !params?.functionName) {
      return undefined
    }
    try {
      return encodeFunctionData({
        abi: params.abi,
        functionName: params.functionName,
        args: params.args || [],
      })
    } catch (error) {
      console.error('Failed to encode function data:', error)
      return '0x'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">
                {isETHTransfer ? 'Recipient Address' : 'Contract Address'}
              </p>
              <code className="text-xs bg-muted p-2 rounded block break-all">{params.address}</code>
            </div>
            {!isETHTransfer && (
              <div>
                <p className="text-sm font-medium mb-1">Function</p>
                <code className="text-xs bg-muted p-2 rounded block">{params.functionName}</code>
              </div>
            )}
            {params.args && params.args.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Arguments</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {stringifyWithBigInt(params.args)}
                </pre>
              </div>
            )}
            {params.value && params.value > 0n && (
              <div>
                <p className="text-sm font-medium mb-1">Value</p>
                <code className="text-xs bg-muted p-2 rounded block">
                  {params.value.toString()} wei ({formatEther(params.value)} ETH)
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Request Data */}
      <details className="rounded-lg bg-muted p-4">
        <summary className="text-sm font-medium cursor-pointer">Transaction Request Data</summary>
        <pre className="text-xs overflow-x-auto mt-2">
          {stringifyWithBigInt({
            to: params.address,
            data: getEncodedData(),
            value: params.value ? params.value.toString() : '0',
            ...(gasEstimate && gasPrice
              ? {
                  gas: gasEstimate.toString(),
                  gasPrice: gasPrice.toString(),
                  maxFeePerGas: gasPrice.toString(),
                  maxPriorityFeePerGas: '1000000000',
                }
              : {}),
            chainId: targetChainId,
            from: address,
            type: '0x2',
          })}
        </pre>
      </details>
    </div>
  )
}
