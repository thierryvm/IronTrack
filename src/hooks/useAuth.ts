import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('Aucun utilisateur connecté:', error.message)
          }
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Erreur lors de la récupération de l\'utilisateur:', error)
        }
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Auth state change:', event)
        }
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  }
}