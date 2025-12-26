'use client'

import { useState } from 'react'
import { ChevronDown, Wallet, LogOut, Gift, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AccountAvatar } from '../account-avatar'
import { AddressDisplay } from '../address-display'
import { BalanceDisplay } from '../balance-display'
import { ChainSwitcher } from '../chain-switcher'
import { cn } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/config/chains'
import { getChainMetadata } from '@/lib/web3/assets'
import type { ConnectWalletProps } from '@/lib/types/web3/components'
import { useTranslation } from '@/lib/i18n'

export function ConnectWallet({
  address,
  chainId,
  isConnected = false,
  balance,
  ensName,
  ensAvatar,
  chains = [],
  onConnect,
  onDisconnect,
  onChainSwitch,
  mintTestTokens,
  mintLabel = 'Mint Test Tokens',
  showBalance = true,
  showChainSelector = true,
  className
}: ConnectWalletProps) {
  const { t } = useTranslation()
  const [connecting, setConnecting] = useState(false)
  const [showChainDialog, setShowChainDialog] = useState(false)
  const [minting, setMinting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await onConnect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await onDisconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleMint = async () => {
    if (!mintTestTokens) return
    
    setMinting(true)
    try {
      await mintTestTokens()
    } catch (error) {
      console.error('Failed to mint test tokens:', error)
    } finally {
      setMinting(false)
    }
  }

  const explorerUrl = chainId ? getExplorerUrl(chainId) : undefined

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className={cn('min-w-[140px]', className)}
      >
        {connecting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
            {t('wallet.connecting')}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {t('wallet.connect')}
          </div>
        )}
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('min-w-[160px]', className)}>
            <div className="flex items-center gap-3 w-full">
              <AccountAvatar 
                address={address}
                ensAvatar={ensAvatar}
                size="sm"
              />
              <div className="flex-1 text-left">
                <AddressDisplay 
                  address={address}
                  ensName={ensName}
                  showCopy={false}
                  showExplorer={false}
                  truncateLength={4}
                />
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3">
            <div className="flex items-center gap-3 mb-3">
              <AccountAvatar 
                address={address}
                ensAvatar={ensAvatar}
                size="md"
              />
              <div className="flex-1">
                <AddressDisplay 
                  address={address}
                  ensName={ensName}
                  chainId={chainId}
                  explorerUrl={explorerUrl}
                  truncateLength={6}
                />
              </div>
            </div>
            
            {showBalance && balance && (
              <BalanceDisplay 
                balance={balance}
                symbol={chainId ? getChainMetadata(chainId).symbol : 'ETH'}
                chainId={chainId}
                showUSD={true}
                compact
                className="mb-3"
              />
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          {showChainSelector && chains.length > 0 && (
            <>
              <DropdownMenuItem
                onClick={() => setShowChainDialog(true)}
                className="cursor-pointer"
              >
                <Network className="h-4 w-4 mr-2" />
                {t('wallet.switchNetwork')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {mintTestTokens && (
            <>
              <DropdownMenuItem
                onClick={handleMint}
                disabled={minting}
                className="cursor-pointer"
              >
                {minting ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent mr-2" />
                    {t('wallet.minting')}
                  </div>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    {mintLabel}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('wallet.disconnect')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showChainDialog} onOpenChange={setShowChainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wallet.switchNetwork')}</DialogTitle>
            <DialogDescription>
              {t('wallet.selectNetwork')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ChainSwitcher
              chains={chains}
              chainId={chainId}
              onChainSwitch={async (newChainId) => {
                if (onChainSwitch) {
                  await onChainSwitch(newChainId)
                  setShowChainDialog(false)
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}