'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { CircleLeaderboard } from './components/circle-leaderboard'
import { MemberLeaderboard } from './components/member-leaderboard'
import { Trophy, Users, Coins } from 'lucide-react'

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'circles' | 'members'>('circles')

  return (
    <div className="container max-w-6xl py-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold text-foreground">
            {t('leaderboard.title')}
          </h1>
        </div>
        <p className="text-muted-foreground">{t('leaderboard.subtitle')}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'circles' | 'members')}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="circles" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            {t('leaderboard.tabs.circles')}
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('leaderboard.tabs.members')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circles">
          <CircleLeaderboard />
        </TabsContent>

        <TabsContent value="members">
          <MemberLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
