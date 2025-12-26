'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Gavel, Shuffle, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { useChainId, getNativeCurrencySymbol } from '@/lib/web3'

export type PayoutMethod = 'auction' | 'random' | 'fixed'

interface StepRulesProps {
  stakeRequired: number
  penaltyRate: number
  payoutMethod: PayoutMethod
  contributionAmount: number
  onStakeChange: (value: number) => void
  onPenaltyChange: (value: number) => void
  onPayoutMethodChange: (value: PayoutMethod) => void
  onNext: () => void
  onBack: () => void
}

export function StepRules({
  stakeRequired,
  penaltyRate,
  payoutMethod,
  contributionAmount,
  onStakeChange,
  onPenaltyChange,
  onPayoutMethodChange,
  onNext,
  onBack,
}: StepRulesProps) {
  const { t } = useTranslation()
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)
  const defaultStake = contributionAmount * 2

  // Use string state for input to allow typing "0", "0.", etc.
  const [stakeInput, setStakeInput] = useState(stakeRequired.toString())

  // Sync from parent when stakeRequired changes externally
  useEffect(() => {
    setStakeInput(stakeRequired.toString())
  }, [stakeRequired])

  const isValid = stakeRequired > 0

  const PAYOUT_OPTIONS = [
    { value: 'auction' as const, label: t('create.rules.auction'), icon: Gavel, desc: t('create.rules.auctionDesc') },
    { value: 'random' as const, label: t('create.rules.random'), icon: Shuffle, desc: t('create.rules.randomDesc') },
    { value: 'fixed' as const, label: t('create.rules.fixed'), icon: ListOrdered, desc: t('create.rules.fixedDesc') },
  ]

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">{t('create.rules.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="stake">{t('create.rules.stake')}</Label>
          <div className="relative">
            <Input
              id="stake"
              type="text"
              inputMode="decimal"
              placeholder={defaultStake.toString()}
              value={stakeInput}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty, digits, and one decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setStakeInput(value)
                  // Only update parent if it's a valid complete number
                  const num = parseFloat(value)
                  if (!isNaN(num)) {
                    onStakeChange(num)
                  } else if (value === '') {
                    onStakeChange(0)
                  }
                }
              }}
              onBlur={() => {
                // On blur, normalize the display (remove trailing dots, etc.)
                const num = parseFloat(stakeInput) || 0
                setStakeInput(num.toString())
                onStakeChange(num)
              }}
              className="bg-background pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currencySymbol}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('create.rules.stakeRecommendation')} ({defaultStake.toFixed(4)} {currencySymbol})
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('create.rules.penalty')}</Label>
            <span className="text-primary font-semibold">{penaltyRate}%</span>
          </div>
          <Slider
            value={[penaltyRate]}
            onValueChange={(v) => onPenaltyChange(v[0])}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>10%</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t('create.rules.payoutMethod')}</Label>
          <RadioGroup
            value={payoutMethod}
            onValueChange={(v) => onPayoutMethodChange(v as PayoutMethod)}
            className="grid grid-cols-3 gap-3"
          >
            {PAYOUT_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = payoutMethod === option.value
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <Icon className={cn('h-6 w-6', isSelected && 'text-primary')} />
                  <span className={cn('font-medium text-sm', isSelected && 'text-primary')}>{option.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{option.desc}</span>
                </Label>
              )
            })}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            {t('common.back')}
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            {t('common.next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
