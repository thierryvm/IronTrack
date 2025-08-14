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
      let isExtensionError = false
      let errorMessage = ''
      
      if (event.type === 'error') {
        // Erreurs JavaScript classiques
        const error = event as ErrorEvent
        errorMessage = error.message || ''
        isExtensionError = (
          error.filename?.includes('content.js') ||
          error.filename?.includes('extension') ||
          errorMessage.includes('runtime.lastError') ||
          errorMessage.includes('message port closed') ||
          errorMessage.includes('Could not establish connection') ||
          errorMessage.includes('Receiving end does not exist')
        )
      } else if (event.type === 'unhandledrejection') {
        // Promise rejections
        const promiseError = event as PromiseRejectionEvent
        if (typeof promiseError.reason === 'string') {
          errorMessage = promiseError.reason
        } else if (promiseError.reason?.message) {
          errorMessage = promiseError.reason.message
        } else if (promiseError.reason?.toString) {
          errorMessage = promiseError.reason.toString()
        }
        
        isExtensionError = (
          errorMessage.includes('message port closed') ||
          errorMessage.includes('Extension context invalidated') ||
          errorMessage.includes('chrome-extension://') ||
          errorMessage.includes('moz-extension://') ||
          errorMessage.includes('runtime.lastError') ||
          errorMessage.includes('Could not establish connection') ||
          errorMessage.includes('Receiving end does not exist') ||
          errorMessage.includes('listener indicated an asynchronous response')
        )
      }

      if (isExtensionError) {
        // Bloquer silencieusement les erreurs d'extensions
        event.preventDefault?.()
        event.stopPropagation?.()
        return false
      }
    }

    // Intercepter les runtime.lastError spécifiquement
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Unchecked runtime.lastError')
      ) {
        // Ignorer silencieusement les erreurs d'extensions
        return
      }
      // Appeler console.error original pour autres erreurs
      originalConsoleError.apply(console, args)
    }

    // Écouter les erreurs d'extensions
    window.addEventListener('error', handleExtensionErrors, true)
    window.addEventListener('unhandledrejection', handleExtensionErrors, true)

    // Cleanup
    return () => {
      console.error = originalConsoleError
      window.removeEventListener('error', handleExtensionErrors, true)
      window.removeEventListener('unhandledrejection', handleExtensionErrors, true)
    }
  }, [])

  return null // Composant invisible
}