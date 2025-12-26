'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'

interface StepBasicInfoProps {
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onNext: () => void
}

export function StepBasicInfo({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onNext,
}: StepBasicInfoProps) {
  const { t } = useTranslation()
  const isValid = name.trim().length >= 2

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">{t('create.basicInfo.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="circle-name">{t('create.basicInfo.circleName')}</Label>
          <Input
            id="circle-name"
            placeholder={t('create.basicInfo.circleNamePlaceholder')}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-background"
          />
          {name.length > 0 && name.length < 2 && (
            <p className="text-sm text-destructive">{t('create.basicInfo.nameMinLength')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="circle-description">{t('create.basicInfo.description')}</Label>
          <Textarea
            id="circle-description"
            placeholder={t('create.basicInfo.descriptionPlaceholder')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="bg-background min-h-[100px]"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onNext} disabled={!isValid} className="px-8">
            {t('common.next')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
