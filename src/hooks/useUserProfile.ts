import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  pseudo: string | null
  avatar_url: string | null
}

export interface UseUserProfileReturn {
  profile: UserProfile | null
  displayName: string
  isLoading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDisplayName = (profile: UserProfile | null): string => {
    if (!profile) return 'Utilisateur'
    
    // Ordre de priorité : pseudo > full_name > email (partie avant @)
    // Le pseudo a la priorité quand il est défini par l'utilisateur
    if (profile.pseudo?.trim()) {
      return profile.pseudo.trim()
    }
    
    if (profile.full_name?.trim()) {
      return profile.full_name.trim()
    }
    
    if (profile.email) {
      return profile.email.split('@')[0]
    }
    
    return 'Utilisateur'
  }

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      // Vérifier d'abord si l'utilisateur est connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Erreur d'authentification: ${userError.message}`)
      }
      
      if (!user) {
        setProfile(null)
        return
      }

      // Récupérer le profil utilisateur
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, pseudo, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Si le profil n'existe pas, créer un profil basique
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              pseudo: user.user_metadata?.name || null
            })
            .select('id, email, full_name, pseudo, avatar_url')
            .single()

          if (insertError) {
            throw new Error(`Erreur de création du profil: ${insertError.message}`)
          }

          setProfile(newProfile)
        } else {
          throw new Error(`Erreur de récupération du profil: ${profileError.message}`)
        }
      } else {
        setProfile(data)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Erreur useUserProfile:', errorMessage)
      
      // Fallback sécurisé - utiliser les données auth si disponibles
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          pseudo: user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    displayName: getDisplayName(profile),
    isLoading,
    error,
    refreshProfile: fetchProfile
  }
}