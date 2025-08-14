'use client'

import { useEffect } from 'react'

/**
 * 🛡️ Extension Error Shield
 * 
 * Protège contre les erreurs d'extensions navigateur qui interfèrent
 * avec l'application (content.js, message ports fermés, etc.)
 */
export default function ExtensionErrorShield() {
  useEffect(() => {
    // Handler d'erreurs global pour extensions
    const handleExtensionErrors = (event: ErrorEvent | PromiseRejectionEvent) => {
      const isExtensionError = (
        // Erreurs content.js typiques
        event.type === 'error' && 
        'filename' in event && 
        (event.filename?.includes('content.js') || event.filename?.includes('extension'))
      ) || (
        // Promise rejections d'extensions
        event.type === 'unhandledrejection' &&
        'reason' in event &&
        typeof event.reason === 'string' &&
        (
          event.reason.includes('message port closed') ||
          event.reason.includes('Extension context invalidated') ||
          event.reason.includes('chrome-extension://') ||
          event.reason.includes('moz-extension://')
        )
      )

      if (isExtensionError) {
        console.warn('🛡️ [EXTENSION SHIELD] Erreur extension bloquée:', event)
        event.preventDefault?.()
        event.stopPropagation?.()
        return false
      }
    }

    // Écouter les erreurs d'extensions
    window.addEventListener('error', handleExtensionErrors, true)
    window.addEventListener('unhandledrejection', handleExtensionErrors, true)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleExtensionErrors, true)
      window.removeEventListener('unhandledrejection', handleExtensionErrors, true)
    }
  }, [])

  return null // Composant invisible
}