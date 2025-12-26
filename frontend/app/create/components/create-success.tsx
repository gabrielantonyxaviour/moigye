'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import type { Address } from 'viem'

interface CreateSuccessProps {
  circleName: string
  circleId: bigint
  circleAddress: Address
  txHash: string
}

// Get the app URL from environment or fall back to window.location.origin
function getAppUrl(): string {
  // Use NEXT_PUBLIC_APP_URL in production
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback to current origin (for development)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export function CreateSuccess({
  circleName,
  circleId,
  circleAddress,
  txHash,
}: CreateSuccessProps) {
  const { t } = useTranslation()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const inviteLink = `${getAppUrl()}/circles/${circleId}?join=true`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(circleAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const explorerUrl = `https://www.oklink.com/amoy/tx/${txHash}`

  return (
    <Card className="border-success/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <Check className="h-8 w-8 text-success" />
        </div>
        <CardTitle className="text-2xl">{t('create.success.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <InfoRow label={t('create.success.circleName')} value={circleName} />
          <InfoRow label={t('create.success.circleId')} value={circleId.toString()} />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">{t('create.success.contractAddress')}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono">{truncateAddress(circleAddress)}</span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-muted rounded transition-colors"
                title={t('common.copy')}
              >
                {copiedAddress ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('create.success.inviteLink')}</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg truncate"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('common.shareInvite')}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button asChild className="w-full">
            <Link href={`/circles/${circleId}`}>{t('common.viewCircle')}</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              {t('common.viewTx')}
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
