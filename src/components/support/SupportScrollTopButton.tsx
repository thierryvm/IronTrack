'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'

const VISIBILITY_OFFSET = 320

export default function SupportScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > VISIBILITY_OFFSET)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Remonter en haut de la page"
      onClick={scrollToTop}
      className={[
        'fixed bottom-24 right-4 z-40 h-10 w-10 rounded-full border-primary/20 bg-background/72 text-primary shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm',
        'hover:border-primary/35 hover:bg-background/88 hover:text-primary',
        'md:bottom-6 md:right-6',
        'transition-all duration-200 motion-reduce:transition-none',
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      ].join(' ')}
    >
      <ArrowUp className="size-[18px]" aria-hidden="true" />
    </Button>
  )
}
