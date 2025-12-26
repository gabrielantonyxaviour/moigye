'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useContribute } from '@/lib/hooks/use-contribute'
import { formatUnits } from 'viem'
import { Coins, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'
import type { Circle } from '@/lib/types/subgraph'
import type { Address } from 'viem'

const EXPLORER_URL = 'https://www.veryscan.io/tx/'

interface ContributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circle: Circle
  onSuccess?: () => void
}

type Step = 'form' | 'closed-for-tx'

export function ContributionModal({ open, onOpenChange, circle, onSuccess }: ContributionModalProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('form')

  const { contribute, reset } = useContribute(circle.address as Address)

  const contributionAmount = BigInt(circle.contributionAmount)
  const contributionFormatted = formatUnits(contributionAmount, 18)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('form')
      reset()
    }
  }, [open, reset])

  const handleContribute = async () => {
    // IMPORTANT: Close the dialog BEFORE executing the transaction
    // WEPIN opens its own widget which would be blocked by our dialog overlay
    setStep('closed-for-tx')

    const toastId = toast.loading(t('circleDetail.modal.processing'))

    try {
      const result = await contribute(contributionAmount)

      if (!result.success) {
        throw new Error('Contribution transaction failed')
      }

      toast.success(t('circleDetail.modal.success'), {
        id: toastId,
        description: t('circleDetail.modal.successMessage', { amount: contributionFormatted }),
        action: {
          label: t('circleDetail.modal.viewTransaction'),
          onClick: () => window.open(`${EXPLORER_URL}${result.hash}`, '_blank'),
        },
      })

      onOpenChange(false)

      // Wait for subgraph to index before refetching (typically takes 2-5 seconds)
      setTimeout(() => {
        onSuccess?.()
      }, 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('errors.default')
      toast.error(t('circleDetail.modal.failed'), {
        id: toastId,
        description: errorMsg,
      })
      // Re-open dialog on error so user can retry
      setStep('form')
    }
  }

  const handleClose = () => {
    if (step === 'closed-for-tx') return // Don't close while tx is pending
    onOpenChange(false)
  }

  // Hide dialog when transaction is in progress (WEPIN widget needs to be on top)
  const isDialogOpen = open && step !== 'closed-for-tx'

  return (
    <Dialog open={isDialogOpen} onOpenChange={step === 'form' ? handleClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-gold" />
            {t('circleDetail.modal.contribute')}
          </DialogTitle>
          <DialogDescription>
            {t('circleDetail.modal.roundContribution', { round: circle.currentRound })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Amount card */}
          <Card className="p-4 bg-muted/50 border-gold/30">
            <p className="text-sm text-muted-foreground mb-1">{t('circleDetail.modal.contributionAmount')}</p>
            <p className="text-2xl font-bold text-gold">
              {contributionFormatted} VERY
            </p>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{t('circleDetail.modal.warningNoRefund')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleContribute}
            className="bg-gold hover:bg-gold/90 text-white"
          >
            {t('circleDetail.modal.payVery', { amount: contributionFormatted })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
