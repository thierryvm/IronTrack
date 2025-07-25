// Gestionnaire d'erreurs pour filtrer les erreurs d'extensions de navigateur

export const isExtensionError = (error: unknown): boolean => {
  // Gérer tous les types d'erreurs possibles
  let errorMessage = ''
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error instanceof Error) {
    errorMessage = error.message || ''
  } else if (error && typeof error === 'object') {
    // Pour les objects Event ou autres
    const errorObj = error as Record<string, unknown>
    errorMessage = (errorObj.message as string) || (errorObj.reason as string) || String(error) || ''
  }
  
  // Vérifier que errorMessage est une string non vide
  if (!errorMessage || typeof errorMessage !== 'string') {
    return false
  }
  
  // Signatures typiques des erreurs d'extensions
  const extensionErrors = [
    'A listener indicated an asynchronous response by returning true',
    'message channel closed before a response was received',
    'Extension context invalidated',
    'Could not establish connection',
    'runtime.lastError',
    'message port closed',
    'Extension context',
    'chrome-extension'
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
      const errorToCheck = event.error || event.message || event
      if (isExtensionError(errorToCheck)) {
        event.preventDefault()
        return false
      }
    })

    // Filtrer les promesses rejetées d'extensions
    window.addEventListener('unhandledrejection', (event) => {
      // event.reason peut être undefined, string, Error, ou Event object
      const reasonToCheck = event.reason || event
      if (isExtensionError(reasonToCheck)) {
        event.preventDefault()
        return false
      }
    })
    
    // Filtrer les erreurs CSS/ressources liées au Hot Reload
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (
        message.includes('MIME type') && message.includes('text/html') ||
        message.includes('runtime.lastError') ||
        message.includes('message channel closed')
      ) {
        // Ignorer ces erreurs de développement
        return
      }
      originalConsoleError.apply(console, args)
    }
  }
}