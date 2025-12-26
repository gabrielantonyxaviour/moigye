'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MemberAvatar } from '@/components/ui/member-avatar'
import { StatusBadge, type CircleStatus } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import { Users, Coins } from 'lucide-react'
import Link from 'next/link'

interface CircleMember {
  id: string
  name?: string
  avatar?: string
  isVerified?: boolean
}

interface CircleCardProps {
  id: string
  name: string
  status: CircleStatus
  members: CircleMember[]
  maxMembers: number
  contributionAmount: string
  contributionCurrency?: string
  nextContributionDate?: string
  className?: string
}

export function CircleCard({
  id,
  name,
  status,
  members,
  maxMembers,
  contributionAmount,
  contributionCurrency = 'VERY',
  nextContributionDate,
  className,
}: CircleCardProps) {
  const displayMembers = members.slice(0, 4)
  const remainingCount = members.length - 4

  return (
    <Link href={`/circles/${id}`}>
      <Card className={cn(
        'transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:shadow-gold/10 hover:border-gold/30',
        'bg-card border-border',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{members.length}/{maxMembers}명</span>
              </div>
            </div>
            <StatusBadge status={status} type="circle" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Member Avatars */}
          <div className="flex items-center -space-x-2">
            {displayMembers.map((member) => (
              <MemberAvatar
                key={member.id}
                src={member.avatar}
                name={member.name}
                size="sm"
                isVerified={member.isVerified}
              />
            ))}
            {remainingCount > 0 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                +{remainingCount}
              </div>
            )}
          </div>

          {/* Contribution Info */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm">
              <Coins className="h-4 w-4 text-gold" />
              <span className="font-medium text-gold">{contributionAmount}</span>
              <span className="text-muted-foreground">{contributionCurrency}</span>
            </div>
            {nextContributionDate && (
              <span className="text-xs text-muted-foreground">
                다음: {nextContributionDate}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
