'use client'

import { useState, useEffect } from 'react'
import { parseEther } from 'viem'
import { useCreateCircle, type CreateCircleParams } from '@/lib/hooks/use-create-circle'
import { PageContainer } from '@/components/layout/page-container'
import { WizardProgress } from './components/wizard-progress'
import { StepBasicInfo } from './components/step-basic-info'
import { StepConfiguration, type Frequency } from './components/step-configuration'
import { StepRules, type PayoutMethod } from './components/step-rules'
import { StepReview } from './components/step-review'
import { CreateSuccess } from './components/create-success'
import { useTranslation } from '@/lib/i18n'
import type { Address } from 'viem'

const FREQUENCY_TO_SECONDS: Record<Frequency, bigint> = {
  weekly: BigInt(7 * 24 * 60 * 60),
  monthly: BigInt(30 * 24 * 60 * 60),
}

const PAYOUT_METHOD_MAP: Record<PayoutMethod, 0 | 1 | 2> = {
  auction: 0,
  random: 1,
  fixed: 2,
}

interface FormData {
  name: string
  description: string
  contributionAmount: number
  frequency: Frequency
  memberCount: number
  stakeRequired: number
  penaltyRate: number
  payoutMethod: PayoutMethod
}

interface CreateResult {
  circleId: bigint
  circleAddress: Address
  txHash: string
}

export default function CreatePage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  // Demo prefilled data for easy testing - users can edit all fields
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    contributionAmount: 0.0005,
    frequency: 'monthly',
    memberCount: 3,
    stakeRequired: 0.001,
    penaltyRate: 5,
    payoutMethod: 'auction',
  })
  const [result, setResult] = useState<CreateResult | null>(null)

  // Set translated demo values on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: t('demo.create.name'),
      description: t('demo.create.description'),
    }))
  }, [t])

  const STEPS = [
    t('create.steps.basicInfo'),
    t('create.steps.configuration'),
    t('create.steps.rules'),
    t('create.steps.review'),
  ]

  const { createCircle, isLoading, error, reset } = useCreateCircle()

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleCreate = async () => {
    console.log('[handleCreate] Starting create flow')
    reset()
    const params: CreateCircleParams = {
      name: formData.name,
      contributionAmount: parseEther(formData.contributionAmount.toString()),
      frequency: FREQUENCY_TO_SECONDS[formData.frequency],
      totalRounds: formData.memberCount,
      stakeRequired: parseEther(formData.stakeRequired.toString()),
      penaltyRate: formData.penaltyRate * 100,
      payoutMethod: PAYOUT_METHOD_MAP[formData.payoutMethod],
    }
    console.log('[handleCreate] Params:', params)

    try {
      const txResult = await createCircle(params)
      console.log('[handleCreate] Transaction result:', txResult)

      if (txResult.success && txResult.data) {
        // Full success - we have circleId and address
        console.log('[handleCreate] Success! Setting result')
        setResult({
          circleId: txResult.data.circleId,
          circleAddress: txResult.data.circleAddress,
          txHash: txResult.hash,
        })
      } else if (txResult.success) {
        // Transaction succeeded but couldn't parse event
        // This can happen if the ABI is outdated or event changed
        console.log('[handleCreate] Transaction confirmed but missing event data')
        // Show success with limited info - user can check explorer
        setResult({
          circleId: BigInt(0),
          circleAddress: '0x0000000000000000000000000000000000000000' as Address,
          txHash: txResult.hash,
        })
      } else {
        // Transaction failed on-chain
        console.log('[handleCreate] Transaction failed on-chain')
        // Error state will be shown via the error prop
      }
    } catch (err) {
      console.error('[handleCreate] Error:', err)
      // Error is handled in hook and shown via error prop
    }
  }

  if (result) {
    return (
      <PageContainer title={t('create.title')} centerTitle>
        <div className="max-w-lg mx-auto">
          <CreateSuccess
            circleName={formData.name}
            circleId={result.circleId}
            circleAddress={result.circleAddress}
            txHash={result.txHash}
          />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title={t('create.title')} centerTitle>
      <div className="max-w-lg mx-auto">
        <WizardProgress steps={STEPS} currentStep={step} />

        {step === 0 && (
          <StepBasicInfo
            name={formData.name}
            description={formData.description}
            onNameChange={(name) => setFormData((d) => ({ ...d, name }))}
            onDescriptionChange={(description) => setFormData((d) => ({ ...d, description }))}
            onNext={handleNext}
          />
        )}

        {step === 1 && (
          <StepConfiguration
            contributionAmount={formData.contributionAmount}
            frequency={formData.frequency}
            memberCount={formData.memberCount}
            onContributionChange={(contributionAmount) =>
              setFormData((d) => ({
                ...d,
                contributionAmount,
                stakeRequired: contributionAmount * 2,
              }))
            }
            onFrequencyChange={(frequency) => setFormData((d) => ({ ...d, frequency }))}
            onMemberCountChange={(memberCount) => setFormData((d) => ({ ...d, memberCount }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 2 && (
          <StepRules
            stakeRequired={formData.stakeRequired}
            penaltyRate={formData.penaltyRate}
            payoutMethod={formData.payoutMethod}
            contributionAmount={formData.contributionAmount}
            onStakeChange={(stakeRequired) => setFormData((d) => ({ ...d, stakeRequired }))}
            onPenaltyChange={(penaltyRate) => setFormData((d) => ({ ...d, penaltyRate }))}
            onPayoutMethodChange={(payoutMethod) => setFormData((d) => ({ ...d, payoutMethod }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <StepReview
            name={formData.name}
            description={formData.description}
            contributionAmount={formData.contributionAmount}
            frequency={formData.frequency}
            memberCount={formData.memberCount}
            stakeRequired={formData.stakeRequired}
            penaltyRate={formData.penaltyRate}
            payoutMethod={formData.payoutMethod}
            isLoading={isLoading}
            error={error}
            onCreate={handleCreate}
            onBack={handleBack}
          />
        )}
      </div>
    </PageContainer>
  )
}
