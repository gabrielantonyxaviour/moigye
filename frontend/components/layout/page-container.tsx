'use client'

import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  centerTitle?: boolean
}

export function PageContainer({ children, className, title, subtitle, centerTitle }: PageContainerProps) {
  return (
    <main className={cn(
      "min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/95",
      className
    )}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {(title || subtitle) && (
          <div className={cn("mb-6 md:mb-8", centerTitle && "text-center")}>
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
