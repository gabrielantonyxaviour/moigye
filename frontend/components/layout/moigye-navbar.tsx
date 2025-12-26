'use client'

import { useAccount, useDisconnect, useBalance, ConnectButton } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Settings, Info, Users, CircleDollarSign, Copy, History, LogOut, Check, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfiguration } from '@/components/config/configuration-provider'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { ThemeToggleSimple } from '@/components/ui/theme-toggle'
import { useTranslation } from '@/lib/i18n'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MoigyeNavbarProps {
  className?: string
}

const showSettings = process.env.NEXT_PUBLIC_DISABLE_SETTINGS !== 'true'

export function MoigyeNavbar({ className }: MoigyeNavbarProps) {
  const { isConnected, address, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { formatted, symbol, isLoading: isBalanceLoading } = useBalance()
  const { config, isConfigured, showConfigDialog, missingVars } = useConfiguration()
  const pathname = usePathname()
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  // Generate DiceBear pixel-art avatar URL using address as seed
  const avatarUrl = useMemo(() => {
    if (!address) return null
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`
  }, [address])

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const navLinks = [
    { href: '/circles', label: t('nav.myCircles'), icon: Users },
    { href: '/explore', label: t('nav.explore'), icon: CircleDollarSign },
  ]

  return (
    <nav className={cn('border-b border-border bg-background', className)}>
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt={t('common.appName')} width={32} height={32} />
            <span className="text-xl font-bold text-gold">{t('common.appName')}</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-1 flex-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Settings */}
          {showSettings && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-sm h-9 border border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                    !isConfigured && !config.isDefaults && "border-destructive text-destructive"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('navbar.settings')}</span>
                  {missingVars.length > 0 && !config.isDefaults && (
                    <Badge className="text-xs px-1 bg-destructive text-destructive-foreground">
                      {missingVars.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 bg-popover border-border">
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">{t('navbar.appConfiguration')}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>{t('navbar.status')}:</span>
                      <Badge className={isConfigured ? "bg-gold text-gold-foreground" : "bg-destructive"}>
                        {isConfigured ? t('navbar.configured') : t('navbar.needsSetup')}
                      </Badge>
                    </div>
                  </div>
                  {missingVars.length > 0 && !config.isDefaults && (
                    <div>
                      <h4 className="text-sm font-medium text-destructive mb-1">{t('navbar.missingConfiguration')}</h4>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {missingVars.slice(0, 3).map(varName => (
                          <li key={varName} className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            <code className="text-foreground">{varName}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    onClick={showConfigDialog}
                    className="w-full bg-gold hover:bg-gold/90 text-gold-foreground"
                    size="sm"
                  >
                    {t('navbar.openSettings')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggleSimple />

          {/* Wallet / Profile */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/5">
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-medium">
                      {isBalanceLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin inline text-gold" />
                      ) : (
                        `${parseFloat(formatted || '0').toFixed(4)} ${symbol || chain?.nativeCurrency?.symbol || 'ETH'}`
                      )}
                    </span>
                    <div className="h-5 w-px bg-gold/30" />
                    <Avatar className="h-6 w-6 ring-1 ring-gold/20">
                      <AvatarImage src={avatarUrl || undefined} alt="Wallet avatar" />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                        {address?.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-mono text-sm hidden sm:inline">{truncatedAddress}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? t('wallet.copied') : t('wallet.copyAddress')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/circles" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {t('nav.myCircles')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    {t('nav.history')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => disconnect()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('wallet.disconnect')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </nav>
  )
}
