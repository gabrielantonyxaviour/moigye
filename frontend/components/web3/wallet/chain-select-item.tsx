'use client'

import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getChainLogoUrl, getChainMetadata } from '@/lib/web3/assets'
import type { Chain } from '@/lib/types/web3'

interface ChainSelectItemProps {
  chain: Chain
  isSelected: boolean
}

export function ChainSelectItem({ chain, isSelected }: ChainSelectItemProps) {
  const chainMeta = getChainMetadata(chain.id)
  const logoUrl = getChainLogoUrl(chain.id) || chain.iconUrl

  return (
    <div className="flex items-center gap-2 w-full">
      {logoUrl && (
        <img
          src={logoUrl}
          alt={chain.name}
          className="h-4 w-4 rounded-full"
          onError={(e) => {
            // Hide image on error
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      )}
      <span className="truncate flex-1">{chain.name}</span>
      {chain.testnet && (
        <Badge variant="outline" className="text-xs ml-auto">
          Testnet
        </Badge>
      )}
      {isSelected && (
        <Check className="h-4 w-4 text-green-600 ml-1" />
      )}
    </div>
  )
}