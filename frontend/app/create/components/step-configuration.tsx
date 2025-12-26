'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/lib/i18n'
import { useChainId, getNativeCurrencySymbol } from '@/lib/web3'

export type Frequency = 'weekly' | 'monthly'

interface StepConfigurationProps {
  contributionAmount: number
  frequency: Frequency
  memberCount: number
  onContributionChange: (value: number) => void
  onFrequencyChange: (value: Frequency) => void
  onMemberCountChange: (value: number) => void
  onNext: () => void
  onBack: () => void
}

export function StepConfiguration({
  contributionAmount,
  frequency,
  memberCount,
  onContributionChange,
  onFrequencyChange,
  onMemberCountChange,
  onNext,
  onBack,
}: StepConfigurationProps) {
  const { t } = useTranslation()
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)
  const isValid = contributionAmount > 0 && memberCount >= 2

  const [contributionInput, setContributionInput] = useState(contributionAmount.toString())

  // Sync from parent when contributionAmount changes externally
  useEffect(() => {
    setContributionInput(contributionAmount.toString())
  }, [contributionAmount])

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">{t('create.configuration.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contribution">{t('create.configuration.contribution')}</Label>
          <div className="relative">
            <Input
              id="contribution"
              type="text"
              inputMode="decimal"
              placeholder="0.0005"
              value={contributionInput}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty, digits, and one decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setContributionInput(value)
                  // Only update parent if it's a valid complete number
                  const num = parseFloat(value)
                  if (!isNaN(num)) {
                    onContributionChange(num)
                  } else if (value === '') {
                    onContributionChange(0)
                  }
                }
              }}
              onBlur={() => {
                // On blur, normalize the display
                const num = parseFloat(contributionInput) || 0
                setContributionInput(num.toString())
                onContributionChange(num)
              }}
              className="bg-background pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currencySymbol}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('create.configuration.frequency')}</Label>
          <Select value={frequency} onValueChange={(v) => onFrequencyChange(v as Frequency)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t('create.configuration.weekly')}</SelectItem>
              <SelectItem value="monthly">{t('create.configuration.monthly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('create.configuration.members')}</Label>
            <span className="text-primary font-semibold">{memberCount}{t('common.people')}</span>
          </div>
          <Slider
            value={[memberCount]}
            onValueChange={(v) => onMemberCountChange(v[0])}
            min={2}
            max={20}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2{t('common.people')}</span>
            <span>20{t('common.people')}</span>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('create.configuration.round')}</span>
            <span className="font-medium">{memberCount}{t('common.rounds')}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('create.configuration.roundsInfo')}
          </p>
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
