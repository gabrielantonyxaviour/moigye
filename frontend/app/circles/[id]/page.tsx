'use client'

import { useParams } from 'next/navigation'
import { useCircle } from '@/lib/hooks/use-circle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainer } from '@/components/layout/page-container'
import { CircleHeader } from './components/circle-header'
import { OverviewTab } from './components/overview-tab'
import { MembersTab } from './components/members-tab'
import { ScheduleTab } from './components/schedule-tab'
import { HistoryTab } from './components/history-tab'
import { CircleSkeleton } from './components/circle-skeleton'
import { CircleNotFound } from './components/circle-not-found'
import { useTranslation } from '@/lib/i18n'

export default function CircleDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { circle, loading, error, refetch } = useCircle(id as string)

  if (loading) return <CircleSkeleton />
  if (error || !circle) return <CircleNotFound />

  return (
    <PageContainer>
      <CircleHeader circle={circle} />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">{t('circleDetail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="members">{t('circleDetail.tabs.members')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('circleDetail.tabs.schedule')}</TabsTrigger>
          <TabsTrigger value="history">{t('circleDetail.tabs.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab circle={circle} onRefetch={refetch} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersTab circle={circle} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab circle={circle} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <HistoryTab circle={circle} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
