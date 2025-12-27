/**
 * Connect Button - WEPIN Implementation
 *
 * Provides a wallet connection button for WEPIN auth flow.
 * Uses abstraction hooks for clean separation of concerns.
 */

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Wallet, Copy, ExternalLink, LogOut, Loader2 } from 'lucide-react'
import { useAccount } from './account'
import { useConnect, useDisconnect } from './connection'
import { useBalance } from './balance'
import { useWepinContext, isWepinConfigured } from './wepin-client'
import { useTranslation } from '@/lib/i18n'


interface ConnectButtonProps {
  className?: string
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const { isInitialized } = useWepinContext()
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  const { formatted, symbol, isLoading: isBalanceLoading } = useBalance()
  const { t } = useTranslation()

  const [copied, setCopied] = useState(false)

  // Generate DiceBear pixel-art avatar URL using address as seed
  const avatarUrl = useMemo(() => {
    if (!address) return null
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`
  }, [address])

  // Not configured state
  if (!isWepinConfigured()) {
    return (
      <Button
        className={`bg-muted text-muted-foreground ${className || ''}`}
        disabled
        title="WEPIN not configured"
      >
        {t('wallet.connect')}
      </Button>
    )
  }

  // Loading state while WEPIN initializes
  if (!isInitialized) {
    return (
      <Button
        disabled
        variant="outline"
        className={`gap-2 border-primary/30 text-muted-foreground ${className || ''}`}
      >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {t('wallet.initializing')}
      </Button>
    )
  }

  // Not connected - show connect button
  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => connect()}
        disabled={isConnecting}
        className={`gap-2 bg-primary hover:bg-primary/90 text-primary-foreground ${className || ''}`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('wallet.connecting')}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            {t('wallet.connect')}
          </>
        )}
      </Button>
    )
  }

  // Connected - show wallet details dropdown
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = () => {
    if (chain?.blockExplorers?.default?.url) {
      window.open(`${chain.blockExplorers.default.url}/address/${address}`, '_blank')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all ${className || ''}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">
              {isBalanceLoading ? (
                <Loader2 className="h-3 w-3 animate-spin inline text-primary" />
              ) : (
                `${parseFloat(formatted || '0').toFixed(4)} ${symbol || chain?.nativeCurrency?.symbol || 'ETH'}`
              )}
            </span>
            <div className="h-5 w-px bg-primary/30" />
            <Avatar className="h-6 w-6 ring-1 ring-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt="Wallet avatar" />
              <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {address?.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-mono text-sm">{truncatedAddress}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-border/50">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer focus:bg-primary/10 focus:text-primary">
          <Copy className="h-4 w-4 mr-2" />
          {copied ? t('wallet.copied') : t('wallet.copyAddress')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer focus:bg-primary/10 focus:text-primary">
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('wallet.viewOnExplorer')}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isDisconnecting ? t('wallet.disconnecting') : t('wallet.disconnect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
