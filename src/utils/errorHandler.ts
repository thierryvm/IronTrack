// Gestionnaire d'erreurs pour filtrer les erreurs d'extensions de navigateur

export const isExtensionError = (error: Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // Signatures typiques des erreurs d'extensions
  const extensionErrors = [
    'A listener indicated an asynchronous response by returning true',
    'message channel closed before a response was received',
    'Extension context invalidated',
    'Could not establish connection',
    'runtime.lastError'
  ]
  
  return extensionErrors.some(signature => 
    errorMessage.includes(signature)
  )
}

export const logError = (error: Error | string, context: string) => {
  if (isExtensionError(error)) {
    // Ne pas logger les erreurs d'extensions (pollution des logs)
    return
  }
  
  console.error(`[${context}] Error:`, error)
}

export const setupGlobalErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Filtrer les erreurs d'extensions dans la console
    window.addEventListener('error', (event) => {
      if (isExtensionError(event.error || event.message)) {
        event.preventDefault()
        return false
      }
    })

    // Filtrer les promesses rejetées d'extensions
    window.addEventListener('unhandledrejection', (event) => {
      if (isExtensionError(event.reason)) {
        event.preventDefault()
        return false
      }
    })
  }
}