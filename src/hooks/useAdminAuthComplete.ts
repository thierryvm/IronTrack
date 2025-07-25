// Hook d'authentification admin COMPLET - Version production robuste
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin' | 'moderator'
  granted_at: string
  is_active: boolean
  full_name?: string
  is_banned: boolean
  ban_reason?: string
}

export interface AdminStats {
  total_users: number
  new_users_24h: number
  new_users_7d: number
  admin_users: number
  banned_users: number
  open_tickets: number
  tickets_24h: number
  resolved_tickets: number
  workouts_24h: number
  workouts_7d: number
}

interface AdminAuthState {
  user: AdminUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}

export const useAdminAuthComplete = () => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false
  })

  const supabase = createClient()

  // Fonction pour vérifier les permissions admin
  const checkAdminPermissions = useCallback(async (authUser: User): Promise<AdminUser | null> => {
    try {
      // Log supprimé pour la sécurité
      
      // Récupérer le profil complet de l'utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('[ADMIN_AUTH_COMPLETE] Profile error:', profileError)
        throw new Error(`Erreur profil: ${profileError.message}`)
      }

      if (!profile) {
        throw new Error('Profil utilisateur introuvable')
      }

      // Vérifier si l'utilisateur a un rôle admin
      const adminRoles = ['admin', 'super_admin', 'moderator']
      if (!profile.role || !adminRoles.includes(profile.role)) {
        // Log supprimé pour la sécurité
        return null
      }

      // Vérifier si l'utilisateur n'est pas banni
      if (profile.is_banned) {
        // Log supprimé pour la sécurité
        throw new Error(`Compte administrateur suspendu: ${profile.ban_reason || 'Raison non spécifiée'}`)
      }

      // Construire l'objet AdminUser
      const adminUser: AdminUser = {
        id: authUser.id,
        email: profile.email || authUser.email || '',
        role: profile.role as 'admin' | 'super_admin' | 'moderator',
        granted_at: profile.created_at,
        is_active: true,
        full_name: profile.full_name,
        is_banned: profile.is_banned || false,
        ban_reason: profile.ban_reason
      }

      // Log supprimé pour la sécurité

      return adminUser

    } catch (error) {
      console.error('[ADMIN_AUTH_COMPLETE] Permission check failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur lors de la vérification des permissions admin')
    }
  }, [supabase])

  // Initialisation de l'authentification
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // Auth init (log supprimé)

        setState(prev => ({ ...prev, loading: true, error: null }))

        // Récupérer l'utilisateur authentifié
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw new Error(`Erreur d'authentification: ${authError.message}`)
        }

        if (!authUser) {
          // No user (log supprimé)
          if (isMounted) {
            setState({
              user: null,
              loading: false,
              error: null,
              isAuthenticated: false,
              isInitialized: true
            })
          }
          return
        }

        // Vérifier les permissions admin
        const adminUser = await checkAdminPermissions(authUser)

        if (!isMounted) return

        if (adminUser) {
          setState({
            user: adminUser,
            loading: false,
            error: null,
            isAuthenticated: true,
            isInitialized: true
          })
        } else {
          setState({
            user: null,
            loading: false,
            error: 'Accès administrateur non autorisé. Permissions insuffisantes.',
            isAuthenticated: false,
            isInitialized: true
          })
        }

      } catch (error) {
        console.error('[ADMIN_AUTH_COMPLETE] Initialization error:', error)
        if (isMounted) {
          setState({
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Erreur d\'authentification admin',
            isAuthenticated: false,
            isInitialized: true
          })
        }
      }
    }

    initializeAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Auth state change (log supprimé)
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (isMounted) {
          setState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
            isInitialized: true
          })
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const adminUser = await checkAdminPermissions(session.user)
          if (isMounted) {
            if (adminUser) {
              setState({
                user: adminUser,
                loading: false,
                error: null,
                isAuthenticated: true,
                isInitialized: true
              })
            } else {
              setState({
                user: null,
                loading: false,
                error: 'Accès administrateur non autorisé',
                isAuthenticated: false,
                isInitialized: true
              })
            }
          }
        } catch (error) {
          if (isMounted) {
            setState({
              user: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Erreur d\'authentification admin',
              isAuthenticated: false,
              isInitialized: true
            })
          }
        }
      }
    })

    // Cleanup
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [checkAdminPermissions, supabase.auth])

  // Vérifier les permissions par rôle
  const hasPermission = useCallback((requiredRole: 'moderator' | 'admin' | 'super_admin'): boolean => {
    if (!state.user) return false

    const roleHierarchy = {
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    }

    const userLevel = roleHierarchy[state.user.role]
    const requiredLevel = roleHierarchy[requiredRole]

    return userLevel >= requiredLevel
  }, [state.user])

  // Logger une action admin (désactivé pour la sécurité)
  const logAdminAction = useCallback(async (): Promise<boolean> => {
    // Logging complètement désactivé pour la sécurité
    return true
  }, [])

  // Récupérer les statistiques admin
  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    if (!state.user) {
      console.warn('[ADMIN_AUTH_COMPLETE] Cannot get stats: no admin user')
      return null
    }

    try {
      // Fetching stats (log supprimé)

      // Utiliser la fonction RPC sécurisée
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

      if (error) {
        console.error('[ADMIN_AUTH_COMPLETE] Stats RPC error:', error)
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('Aucune donnée de statistiques disponible')
      }

      const stats: AdminStats = {
        total_users: Number(data[0].total_users) || 0,
        new_users_24h: Number(data[0].new_users_24h) || 0,
        new_users_7d: Number(data[0].new_users_7d) || 0,
        admin_users: Number(data[0].admin_users) || 0,
        banned_users: Number(data[0].banned_users) || 0,
        open_tickets: Number(data[0].open_tickets) || 0,
        tickets_24h: Number(data[0].tickets_24h) || 0,
        resolved_tickets: Number(data[0].resolved_tickets) || 0,
        workouts_24h: Number(data[0].workouts_24h) || 0,
        workouts_7d: Number(data[0].workouts_7d) || 0
      }

      // Stats retrieved (log supprimé)
      return stats

    } catch (error) {
      console.error('[ADMIN_AUTH_COMPLETE] Get stats failed:', error)
      return null
    }
  }, [state.user, supabase])

  // Déconnexion admin
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      if (state.user) {
        await logAdminAction()
      }

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[ADMIN_AUTH_COMPLETE] Sign out error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('[ADMIN_AUTH_COMPLETE] Sign out failed:', error)
      return false
    }
  }, [state.user, logAdminAction, supabase.auth])

  return {
    // État
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    
    // Fonctions
    hasPermission,
    logAdminAction,
    getAdminStats,
    signOut,
    
    // Infos utiles
    userRole: state.user?.role || null,
    userName: state.user?.full_name || state.user?.email || null
  }
}