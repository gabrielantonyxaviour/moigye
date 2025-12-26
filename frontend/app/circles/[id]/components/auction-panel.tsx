'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccount } from '@/lib/web3'
import { useBid } from '@/lib/hooks/use-bid'
import { useMemberStatus } from '@/lib/hooks/use-member-status'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'
import { Gavel, Clock, Loader2 } from 'lucide-react'
import type { Circle, Round } from '@/lib/types/subgraph'
import type { Address } from 'viem'

const EXPLORER_URL = 'https://www.veryscan.io/tx/'

interface AuctionPanelProps {
  circle: Circle
  currentRound: Round | undefined
}

export function AuctionPanel({ circle, currentRound }: AuctionPanelProps) {
  const { t } = useTranslation()
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const { address } = useAccount()
  const { placeBid, isLoading, reset } = useBid(circle.address as Address)
  const { isMember, hasContributed } = useMemberStatus(
    circle.address as Address,
    address
  )

  // Calculate time remaining
  useEffect(() => {
    // No round data - show not started
    if (!currentRound?.deadline) {
      setTimeLeft(t('circleDetail.auction.notStarted'))
      return
    }

    const deadline = parseInt(currentRound.deadline) * 1000
    const updateTimer = () => {
      const now = Date.now()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft(t('circleDetail.auction.ended'))
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeLeft(t('circleDetail.auction.daysHours', { days, hours: hours % 24 }))
      } else if (hours > 0) {
        setTimeLeft(t('circleDetail.auction.hoursMinutes', { hours, minutes }))
      } else {
        setTimeLeft(t('circleDetail.auction.minutesSeconds', { minutes, seconds }))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentRound?.deadline, t])

  const handleBid = async () => {
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= 0 || amount > 100) return

    // Convert percentage to basis points (1% = 100bp)
    const basisPoints = BigInt(Math.floor(amount * 100))
    const toastId = toast.loading(t('circleDetail.auction.placingBid'))

    try {
      const result = await placeBid(basisPoints)
      setBidAmount('')
      reset()

      if (result.success) {
        toast.success(t('circleDetail.auction.bidPlaced'), {
          id: toastId,
          description: t('circleDetail.auction.bidSuccess', { amount: amount.toString() }),
          action: {
            label: t('circleDetail.modal.viewTransaction'),
            onClick: () => window.open(`${EXPLORER_URL}${result.hash}`, '_blank'),
          },
        })
      } else {
        toast.error(t('circleDetail.auction.bidFailed'), { id: toastId })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('errors.default')
      toast.error(t('circleDetail.auction.bidFailed'), {
        id: toastId,
        description: errorMsg,
      })
    }
  }

  const canBid = isMember && hasContributed && timeLeft !== t('circleDetail.auction.ended')

  return (
    <Card className="border-secondary/30 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gavel className="h-5 w-5 text-secondary" />
          {t('circleDetail.auction.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time remaining */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
          <div className="flex items-center gap-2 text-secondary">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{t('circleDetail.auction.timeRemaining')}</span>
          </div>
          <span className="font-bold text-secondary">{timeLeft || t('circleDetail.auction.calculating')}</span>
        </div>

        {/* Bid input */}
        {canBid && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bid-amount" className="text-sm">
                {t('circleDetail.auction.bidAmount')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="bid-amount"
                  type="number"
                  placeholder="e.g. 5"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="flex-1"
                />
                <Button
                  onClick={handleBid}
                  disabled={isLoading || !bidAmount}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('circleDetail.auction.bid')
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('circleDetail.auction.bidHint')}
              </p>
            </div>
          </div>
        )}

        {!canBid && isMember && !hasContributed && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('circleDetail.auction.completePaymentFirst')}
          </div>
        )}

        {!isMember && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('circleDetail.auction.joinCircleFirst')}
          </div>
        )}

        {/* Current bids placeholder */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">{t('circleDetail.auction.currentBids')}</p>
          <div className="text-center py-4 text-sm text-muted-foreground">
            {t('circleDetail.auction.noBids')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
