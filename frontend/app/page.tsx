'use client'

import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { HowItWorks } from './components/how-it-works'
import { CTASection } from './components/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </main>
  )
}
