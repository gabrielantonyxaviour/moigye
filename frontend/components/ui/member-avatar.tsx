'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

interface MemberAvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  isVerified?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

const badgeSizeClasses = {
  sm: 'h-3 w-3 -bottom-0.5 -right-0.5',
  md: 'h-4 w-4 -bottom-0.5 -right-0.5',
  lg: 'h-5 w-5 -bottom-1 -right-1',
}

export function MemberAvatar({
  src,
  name,
  size = 'md',
  isVerified = false,
  className,
}: MemberAvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(
        sizeClasses[size],
        'ring-2 ring-gold/30 ring-offset-2 ring-offset-background'
      )}>
        <AvatarImage src={src} alt={name || 'Member'} />
        <AvatarFallback className="bg-gold/20 text-gold font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {isVerified && (
        <div className={cn(
          'absolute bg-background rounded-full',
          badgeSizeClasses[size]
        )}>
          <CheckCircle className="h-full w-full text-success fill-success/20" />
        </div>
      )}
    </div>
  )
}
