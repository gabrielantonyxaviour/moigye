'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getChainLogoUrl, getChainMetadata } from '@/lib/web3/assets'
import { ChainSelectItem } from './chain-select-item'
import type { ChainSwitcherProps } from '@/lib/types/web3/components'

export function ChainSwitcher({
  chains,
  chainId,
  currentChain,
  onChainSwitch,
  disabled = false,
  className
}: ChainSwitcherProps) {
  const [switching, setSwitching] = useState(false)

  const handleChainSwitch = async (newChainId: string) => {
    if (disabled || switching) return
    
    const targetChainId = parseInt(newChainId)
    if (targetChainId === chainId) return
    
    setSwitching(true)
    try {
      await onChainSwitch(targetChainId)
    } catch (error) {
      console.error('Failed to switch chain:', error)
    } finally {
      setSwitching(false)
    }
  }

  const selectedChain = currentChain || chains.find(chain => chain.id === chainId)
  const selectedChainMeta = chainId ? getChainMetadata(chainId) : null

  return (
    <Select
      value={chainId?.toString()}
      onValueChange={handleChainSwitch}
      disabled={disabled || switching}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue>
          <div className="flex items-center gap-2">
            {(selectedChain?.iconUrl || selectedChainMeta) && (
              <img
                src={getChainLogoUrl(chainId!) || selectedChain?.iconUrl}
                alt={selectedChain?.name || selectedChainMeta?.name}
                className="h-4 w-4 rounded-full"
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <span className="truncate">{selectedChain?.name || selectedChainMeta?.name || 'Select Chain'}</span>
            {selectedChain?.testnet && (
              <Badge variant="outline" className="text-xs">
                Testnet
              </Badge>
            )}
            {switching && (
              <div className="ml-auto">
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-r-transparent" />
              </div>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            <ChainSelectItem
              chain={chain}
              isSelected={chain.id === chainId}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}