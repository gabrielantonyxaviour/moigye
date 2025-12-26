/**
 * Network Switcher - Uses Web3 Abstraction Layer
 *
 * Works with any auth provider (Thirdweb, Reown, etc.)
 */

'use client'

import * as React from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAccount, useSwitchChain } from '@/lib/web3'
import { getSupportedChainList, type ChainConfig } from '@/lib/config/chains'
import { useTranslation } from '@/lib/i18n'

interface NetworkSwitcherProps {
  className?: string
  variant?: 'select' | 'button'
}

export function NetworkSwitcher({
  className,
  variant = 'select'
}: NetworkSwitcherProps) {
  const [mounted, setMounted] = React.useState(false)
  const { t } = useTranslation()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className={cn("w-48", className)}>
        <Button variant="outline" size="sm" disabled className="w-full">
          <Globe className="h-4 w-4 mr-2" />
          {t('common.loading')}
        </Button>
      </div>
    )
  }

  return <NetworkSwitcherInner className={className} variant={variant} />
}

interface NetworkInfo {
  id: number
  name: string
  symbol: string
  logo: string
}

function NetworkSwitcherInner({
  className,
  variant = 'select'
}: NetworkSwitcherProps) {
  const { chainId } = useAccount()
  const { switchChain, isPending: switching } = useSwitchChain()
  const { t } = useTranslation()

  // Get chain configs which have proper icon URLs
  const chainConfigs = React.useMemo(() => getSupportedChainList(), [])

  // Available networks from chain config
  const availableNetworks = React.useMemo((): NetworkInfo[] => {
    return chainConfigs.map((config: ChainConfig) => ({
      id: config.chain.id,
      name: config.name,
      symbol: config.chain.nativeCurrency?.symbol || 'ETH',
      logo: config.iconUrl || '/images/chains/generic-chain.svg',
    }))
  }, [chainConfigs])

  const handleNetworkSwitch = async (networkId: string | number) => {
    if (switching) return

    const numericId = typeof networkId === 'string' ? parseInt(networkId) : networkId
    try {
      await switchChain(numericId)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const currentNetwork = availableNetworks.find(
    net => net.id === chainId
  ) || availableNetworks[0]

  // Handle case where no networks are configured
  if (!availableNetworks.length) {
    return (
      <div className={cn("w-48", className)}>
        <Button variant="outline" size="sm" disabled className="w-full">
          <Globe className="h-4 w-4 mr-2" />
          {t('wallet.noNetworks')}
        </Button>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNetworkSwitch(currentNetwork.id.toString())}
        disabled={switching}
        className={cn("gap-2", className)}
      >
        <Globe className="h-4 w-4" />
        {switching ? t('wallet.switching') : currentNetwork.name}
      </Button>
    )
  }

  return (
    <div className={cn("w-48", className)}>
      <Select
        value={currentNetwork?.id?.toString() || ''}
        onValueChange={handleNetworkSwitch}
        disabled={switching}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <img
                src={currentNetwork.logo}
                alt={currentNetwork.name}
                className="h-4 w-4 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/chains/generic-chain.svg'
                }}
              />
              <span className="font-medium">{currentNetwork.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {currentNetwork.symbol}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableNetworks.map((network) => (
            <SelectItem key={network.id} value={network.id.toString()}>
              <div className="flex items-center gap-2 w-full">
                <img
                  src={network.logo}
                  alt={network.name}
                  className="h-4 w-4 rounded-full bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/chains/generic-chain.svg'
                  }}
                />
                <span className="font-medium">{network.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {network.symbol}
                </Badge>
                {network.id === currentNetwork.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
