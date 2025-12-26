'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useChainId, getNativeCurrencySymbol } from '@/lib/web3'
import type { Frequency } from './step-configuration'
import type { PayoutMethod } from './step-rules'

interface StepReviewProps {
  name: string
  description: string
  contributionAmount: number
  frequency: Frequency
  memberCount: number
  stakeRequired: number
  penaltyRate: number
  payoutMethod: PayoutMethod
  isLoading: boolean
  error: string | null
  onCreate: () => void
  onBack: () => void
}

export function StepReview({
  name,
  description,
  contributionAmount,
  frequency,
  memberCount,
  stakeRequired,
  penaltyRate,
  payoutMethod,
  isLoading,
  error,
  onCreate,
  onBack,
}: StepReviewProps) {
  const { t } = useTranslation()
  const chainId = useChainId()
  const currencySymbol = getNativeCurrencySymbol(chainId)
  const [accepted, setAccepted] = useState(false)

  const FREQUENCY_LABELS: Record<Frequency, string> = {
    weekly: t('create.configuration.weekly'),
    monthly: t('create.configuration.monthly'),
  }

  const PAYOUT_LABELS: Record<PayoutMethod, string> = {
    auction: t('create.rules.auction'),
    random: t('create.rules.random'),
    fixed: t('create.rules.fixed'),
  }

  const totalPool = contributionAmount * memberCount

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">{t('create.review.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ReviewItem label={t('create.review.circleName')} value={name} />
            {description && <ReviewItem label={t('create.review.description')} value={description} span={2} />}
            <ReviewItem label={t('create.review.contribution')} value={`${contributionAmount} ${currencySymbol}`} />
            <ReviewItem label={t('create.review.frequency')} value={FREQUENCY_LABELS[frequency]} />
            <ReviewItem label={t('create.review.members')} value={`${memberCount}${t('common.people')}`} />
            <ReviewItem label={t('create.review.rounds')} value={`${memberCount}${t('common.rounds')}`} />
            <ReviewItem label={t('create.review.stake')} value={`${stakeRequired} ${currencySymbol}`} />
            <ReviewItem label={t('create.review.penalty')} value={`${penaltyRate}%`} />
            <ReviewItem label={t('create.review.payoutMethod')} value={PAYOUT_LABELS[payoutMethod]} />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{t('create.review.schedule')}</h4>
            <p className="text-sm text-muted-foreground">
              {frequency === 'weekly' ? t('create.configuration.weekly') : t('create.configuration.monthly')}{' '}
              <span className="text-primary font-medium">{totalPool.toFixed(2)} {currencySymbol}</span> {t('create.review.poolPerRound')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('create.review.totalRounds', { count: memberCount })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            {t('create.review.terms')}
          </Label>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{t(error)}</p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            {t('common.back')}
          </Button>
          <Button onClick={onCreate} disabled={!accepted || isLoading} className="px-8">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('create.review.creating')}
              </>
            ) : (
              t('create.review.createCircle')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewItem({
  label,
  value,
  span = 1,
}: {
  label: string
  value: string
  span?: number
}) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
