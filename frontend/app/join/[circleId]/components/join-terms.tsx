'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatBalance, useChainId, getNativeCurrencySymbol } from '@/lib/web3'
import { Shield, AlertTriangle, Calendar } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface JoinTermsProps {
  stakeAmount: string
  penaltyRate: number
  frequency: string
  accepted: boolean
  onAcceptChange: (accepted: boolean) => void
}

export function JoinTerms({
  stakeAmount,
  penaltyRate,
  frequency,
  accepted,
  onAcceptChange,
}: JoinTermsProps) {
  const { t } = useTranslation()
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)
  const stakeFormatted = formatBalance(BigInt(stakeAmount), 18)

  const frequencyLabels: Record<string, string> = {
    daily: t('common.daily'),
    weekly: t('common.weekly'),
    biweekly: t('common.biweekly'),
    monthly: t('common.monthly'),
  }

  const frequencyLabel = frequencyLabels[frequency] || frequency

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t('join.terms.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Terms List */}
        <div className="space-y-3">
          <TermItem
            icon={<Shield className="h-4 w-4 text-secondary" />}
            title={t('join.terms.stake')}
            description={t('join.terms.stakeDesc', { amount: stakeFormatted, symbol: currencySymbol })}
          />
          <TermItem
            icon={<AlertTriangle className="h-4 w-4 text-warning" />}
            title={t('join.terms.penalty')}
            description={t('join.terms.penaltyDesc', { rate: penaltyRate })}
          />
          <TermItem
            icon={<Calendar className="h-4 w-4 text-primary" />}
            title={t('join.terms.schedule')}
            description={t('join.terms.scheduleDesc', { frequency: frequencyLabel })}
          />
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2 border-t border-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={accepted}
              onCheckedChange={(checked) => onAcceptChange(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              {t('join.terms.agree')}
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}

function TermItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}
