'use client'

import Image from 'next/image'

interface HeaderUserAvatarProps {
  userAvatar: string | null
  userInitials: string
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = {
  sm: {
    box: 'h-8 w-8',
    font: 'text-sm',
    px: 32,
  },
  md: {
    box: 'h-10 w-10',
    font: 'text-sm',
    px: 40,
  },
  lg: {
    box: 'h-12 w-12',
    font: 'text-lg',
    px: 48,
  },
} as const

export default function HeaderUserAvatar({
  userAvatar,
  userInitials,
  size = 'sm',
}: HeaderUserAvatarProps) {
  const currentSize = avatarSizes[size]

  if (userAvatar) {
    return (
      <Image
        src={userAvatar}
        alt="Avatar"
        className={`${currentSize.box} rounded-full object-cover`}
        width={currentSize.px}
        height={currentSize.px}
        sizes={`${currentSize.px}px`}
        quality={70}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={`${currentSize.box} flex items-center justify-center rounded-full bg-primary font-semibold text-white ${currentSize.font}`}
      aria-hidden="true"
    >
      {userInitials}
    </div>
  )
}
