import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface UseAuthReturn {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Hook d'authentification restauré avec Supabase
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Fonction pour récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Erreur récupération utilisateur:', error)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Erreur useAuth:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Vérifier l'utilisateur au montage
    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  }
}