'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityState {
  announcements: string[]
  highContrast: boolean
  reducedMotion: boolean
  screenReaderActive: boolean
}

interface AccessibilityContextType extends AccessibilityState {
  announce: (message: string) => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>({
    announcements: [],
    highContrast: false,
    reducedMotion: false,
    screenReaderActive: false
  })

  // Détecter les préférences utilisateur
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    }

    const updatePreferences = () => {
      setState(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
      }))
    }

    // Initial check
    updatePreferences()

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => 
      mq.addEventListener('change', updatePreferences)
    )

    return () => {
      Object.values(mediaQueries).forEach(mq => 
        mq.removeEventListener('change', updatePreferences)
      )
    }
  }, [])

  // Détecter si un lecteur d'écran est actif
  useEffect(() => {
    // Méthode simple de détection (approximative)
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') || 
                            window.navigator.userAgent.includes('JAWS') ||
                            'speechSynthesis' in window

    setState(prev => ({ ...prev, screenReaderActive: hasScreenReader }))
  }, [])

  const announce = (message: string) => {
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message] // Garder les 5 derniers
    }))

    // Annoncer via aria-live
    const liveRegion = document.getElementById('accessibility-announcements')
    if (liveRegion) {
      liveRegion.textContent = message
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  const toggleHighContrast = () => {
    setState(prev => ({ ...prev, highContrast: !prev.highContrast }))
    document.documentElement.classList.toggle('high-contrast')
  }

  const toggleReducedMotion = () => {
    setState(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
    document.documentElement.classList.toggle('reduce-motion')
  }

  const value: AccessibilityContextType = {
    ...state,
    announce,
    toggleHighContrast,
    toggleReducedMotion,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Région live pour les annonces */}
      <div
        id="accessibility-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      {/* Styles CSS dynamiques pour accessibilité */}
      {state.highContrast && (
        <style jsx global>{`
          * {
            --tw-shadow: none !important;
            box-shadow: none !important;
          }
          .bg-gradient-to-r {
            background: #000 !important;
            color: #fff !important;
          }
          .text-gray-600 dark:text-gray-300 {
            color: #000 !important;
          }
          .bg-gray-50 dark:bg-gray-800 {
            background: #fff !important;
          }
        `}</style>
      )}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}