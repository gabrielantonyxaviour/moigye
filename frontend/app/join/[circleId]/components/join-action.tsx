'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConnectButton, formatBalance, useBalance, useAccount, useChainId, getNativeCurrencySymbol } from '@/lib/web3'
import { Loader2, Wallet, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface JoinActionProps {
  stakeAmount: string
  contributionAmount: string
  isConnected: boolean
  termsAccepted: boolean
  isJoining: boolean
  onJoin: () => void
}

export function JoinAction({
  stakeAmount,
  contributionAmount,
  isConnected,
  termsAccepted,
  isJoining,
  onJoin,
}: JoinActionProps) {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { balance } = useBalance({ address })
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)

  const stake = BigInt(stakeAmount)
  const contribution = BigInt(contributionAmount)
  const total = stake + contribution

  const stakeFormatted = formatBalance(stake, 18)
  const contributionFormatted = formatBalance(contribution, 18)
  const totalFormatted = formatBalance(total, 18)

  const userBalance = balance ?? BigInt(0)
  const hasInsufficientBalance = userBalance < total

  // Not connected state
  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('common.connectWalletToJoin')}
            </p>
          </div>
          <ConnectButton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6 space-y-4">
        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('common.stake')}</span>
            <span className="text-foreground">{stakeFormatted} {currencySymbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('common.firstContribution')}</span>
            <span className="text-foreground">{contributionFormatted} {currencySymbol}</span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">{t('common.totalPayment')}</span>
              <span className="text-primary">{totalFormatted} {currencySymbol}</span>
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {hasInsufficientBalance && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              {t('common.insufficientBalance', { balance: formatBalance(userBalance, 18), symbol: currencySymbol })}
            </p>
          </div>
        )}

        {/* Join Button */}
        <Button
          onClick={onJoin}
          disabled={!termsAccepted || isJoining || hasInsufficientBalance}
          className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isJoining ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('common.processing')}
            </>
          ) : (
            t('common.joinCircle', { amount: totalFormatted, symbol: currencySymbol })
          )}
        </Button>

        {/* Helper Text */}
        {!termsAccepted && (
          <p className="text-xs text-center text-muted-foreground">
            {t('common.mustAcceptTerms')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
