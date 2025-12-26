'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberAvatar } from '@/components/ui/member-avatar'
import { useTranslation } from '@/lib/i18n'
import { formatAddress } from '@/lib/web3'
import { Users } from 'lucide-react'
import type { Member } from '@/lib/types/subgraph'

interface MemberListPreviewProps {
  members: Member[]
}

const MAX_DISPLAY = 8

export function MemberListPreview({ members }: MemberListPreviewProps) {
  const { t } = useTranslation()

  const displayMembers = members.slice(0, MAX_DISPLAY)
  const remainingCount = members.length - MAX_DISPLAY

  if (members.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {t('join.members.empty')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{t('join.members.title')}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {t('join.members.participating', { count: members.length })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {displayMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-1">
              <MemberAvatar
                name={formatAddress(member.address)}
                size="md"
              />
              <span className="text-xs text-muted-foreground">
                {formatAddress(member.address)}
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm text-muted-foreground">
                +{remainingCount}
              </div>
              <span className="text-xs text-muted-foreground">{t('join.members.more')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
