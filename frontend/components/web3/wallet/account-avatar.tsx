'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AccountAvatarProps } from '@/lib/types/web3/components'

export function AccountAvatar({
  address,
  ensAvatar,
  size = 'md',
  className
}: AccountAvatarProps) {
  // Generate DiceBear avatar URL using address as seed
  const avatarUrl = address ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}` : ensAvatar
  const generateGradient = (address?: string) => {
    if (!address) return 'from-gray-400 to-gray-600'

    const hash = address.toLowerCase()
    const colors = [
      'from-amber-400 to-amber-600',
      'from-amber-500 to-orange-500',
      'from-yellow-400 to-amber-500',
      'from-orange-400 to-amber-600',
      'from-amber-300 to-amber-500',
      'from-yellow-500 to-amber-600',
      'from-amber-400 to-yellow-600',
      'from-orange-300 to-amber-500',
      'from-amber-500 to-yellow-500',
      'from-yellow-400 to-orange-500',
    ]

    const index = parseInt(hash.slice(2, 4), 16) % colors.length
    return colors[index]
  }

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  const gradientClass = generateGradient(address)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl} alt="Account avatar" />
      <AvatarFallback 
        className={cn(
          'bg-gradient-to-br text-white font-medium',
          gradientClass
        )}
      >
        {address ? address.slice(2, 4).toUpperCase() : '??'}
      </AvatarFallback>
    </Avatar>
  )
}