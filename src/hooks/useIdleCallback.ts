'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

/**
 * Hook pour différer l'exécution d'un callback quand le browser est idle
 * Utilise requestIdleCallback si disponible, sinon setTimeout
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = [],
  timeout: number = 100
) {
  const callbackRef = useRef(callback)
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const deferredCallback = useCallback(() => {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(() => {
          callbackRef.current()
        }, { timeout })
      } else {
        // Fallback pour les browsers qui ne supportent pas requestIdleCallback
        setTimeout(() => {
          callbackRef.current()
        }, timeout)
      }
    } else {
      // Server-side, exécuter immédiatement
      callbackRef.current()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return deferredCallback
}

/**
 * Hook pour différer le chargement d'un composant lourd
 */
export function useDeferredComponent<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  
  const deferredLoad = useIdleCallback(() => {
    loader()
      .then(comp => {
        setComponent(comp)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, deps)

  useEffect(() => {
    deferredLoad()
  }, [deferredLoad])

  return { component, loading }
}