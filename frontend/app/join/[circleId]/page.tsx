'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAccount } from '@/lib/web3'
import { useCircle } from '@/lib/hooks/use-circle'
import { useJoinCircle } from '@/lib/hooks/use-join-circle'
import { CirclePreview } from './components/circle-preview'
import { MemberListPreview } from './components/member-list-preview'
import { JoinTerms } from './components/join-terms'
import { JoinAction } from './components/join-action'
import { JoinSuccess } from './components/join-success'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Users, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import type { Address } from 'viem'

type JoinState = 'preview' | 'joining' | 'success'

export default function JoinPage() {
  const { t } = useTranslation()
  const { circleId } = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { circle, loading, error } = useCircle(circleId as string)
  const { join, isLoading: isJoining } = useJoinCircle(circle?.address as Address)

  const [joinState, setJoinState] = useState<JoinState>('preview')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Check membership
  const isMember = circle?.members.some(
    (m) => m.address.toLowerCase() === address?.toLowerCase()
  )
  const isFull = circle && circle.memberCount >= circle.totalRounds
  const circleStatus = circle ? getCircleStatus(circle.status) : 'forming'

  const handleJoin = async () => {
    if (!circle) return

    try {
      setJoinState('joining')
      const stakeAmount = BigInt(circle.stakeRequired)
      const contributionAmount = BigInt(circle.contributionAmount)
      const result = await join(stakeAmount, contributionAmount)

      if (result.success) {
        setTxHash(result.hash)
        setJoinState('success')
      } else {
        setJoinState('preview')
      }
    } catch {
      setJoinState('preview')
    }
  }

  // Loading state
  if (loading) {
    return <JoinPageSkeleton />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('join.error')}
        message={t('join.errorLoadingCircle')}
      />
    )
  }

  // Not found state
  if (!circle) {
    return (
      <ErrorState
        title={t('join.notFound')}
        message={t('join.notFoundDesc')}
      />
    )
  }

  // Already member state
  if (isMember) {
    return (
      <InfoState
        icon={<Users className="h-12 w-12 text-gold" />}
        title={t('join.alreadyMember')}
        message={t('join.alreadyMemberDesc')}
        actionLabel={t('join.viewCircle')}
        onAction={() => router.push(`/circles/${circle.id}`)}
      />
    )
  }

  // Full state
  if (isFull) {
    return (
      <InfoState
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        title={t('join.fullCircle')}
        message={t('join.fullCircleDesc')}
        actionLabel={t('join.browseOther')}
        onAction={() => router.push('/explore')}
      />
    )
  }

  // Success state
  if (joinState === 'success') {
    return (
      <JoinSuccess
        circleName={circle.name}
        circleId={circle.id}
        txHash={txHash}
      />
    )
  }

  // Main join flow
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground text-center">
          {t('join.title')}
        </h1>

        <CirclePreview
          circle={circle}
          status={circleStatus}
        />

        <MemberListPreview members={circle.members} />

        <JoinTerms
          stakeAmount={circle.stakeRequired}
          penaltyRate={circle.penaltyRate}
          frequency={circle.frequency}
          accepted={termsAccepted}
          onAcceptChange={setTermsAccepted}
        />

        <JoinAction
          stakeAmount={circle.stakeRequired}
          contributionAmount={circle.contributionAmount}
          isConnected={isConnected}
          termsAccepted={termsAccepted}
          isJoining={joinState === 'joining' || isJoining}
          onJoin={handleJoin}
        />
      </div>
    </div>
  )
}

function getCircleStatus(status: number): 'forming' | 'active' | 'completed' {
  switch (status) {
    case 0: return 'forming'
    case 1: return 'active'
    case 2: return 'completed'
    default: return 'forming'
  }
}

function JoinPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  )
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
          <button
            onClick={onAction}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
