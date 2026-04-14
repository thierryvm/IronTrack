'use client'

import { useEffect } from 'react'

interface AuthBodyClassProps {
  className?: string
}

export function AuthBodyClass({ className = 'auth-screen-active' }: AuthBodyClassProps) {
  useEffect(() => {
    document.body.classList.add(className)

    return () => {
      document.body.classList.remove(className)
    }
  }, [className])

  return null
}
