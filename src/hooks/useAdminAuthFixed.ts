'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

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
  feedback_tickets: number
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

/**
 * Hook d'authentification admin CORRIGÉ - Version simplifiée et robuste
 * Basé sur le diagnostic emergency-debug qui fonctionne parfaitement
 */
export const useAdminAuthFixed = () => {
  console.log('[useAdminAuthFixed] 🚀 Hook démarré - version corrigée')
  
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false
  })

  const supabase = createClient()

  // Fonction de vérification auth simplifiée (copie du diagnostic réussi)
  const checkAuth = useCallback(async () => {
    try {
      console.log('[useAdminAuthFixed] 📡 Vérification auth...')

      // Étape 1: Auth de base (identique au diagnostic)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('[useAdminAuthFixed] ❌ Erreur auth:', authError)
        setState({
          user: null,
          loading: false,
          error: authError.message,
          isAuthenticated: false,
          isInitialized: true
        })
        return
      }

      if (!user) {
        console.log('[useAdminAuthFixed] 🚫 Pas d\'utilisateur connecté')
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
          isInitialized: true
        })
        return
      }

      console.log('[useAdminAuthFixed] ✅ Utilisateur trouvé:', user.email)

      // Étape 2: Profile (identique au diagnostic)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[useAdminAuthFixed] ❌ Erreur profile:', profileError)
        setState({
          user: null,
          loading: false,
          error: `Erreur profile: ${profileError.message}`,
          isAuthenticated: false,
          isInitialized: true
        })
        return
      }

      // Étape 3: User roles (identique au diagnostic)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (rolesError) {
        console.error('[useAdminAuthFixed] ❌ Erreur user_roles:', rolesError)
        setState({
          user: null,
          loading: false,
          error: `Erreur roles: ${rolesError.message}`,
          isAuthenticated: false,
          isInitialized: true
        })
        return
      }

      // Vérifier si admin
      const adminRole = userRoles?.find(r => 
        ['admin', 'super_admin', 'moderator'].includes(r.role) && r.is_active
      )

      if (!adminRole) {
        console.log('[useAdminAuthFixed] 🚫 Pas de rôle admin actif')
        setState({
          user: null,
          loading: false,
          error: 'Accès admin requis',
          isAuthenticated: false,
          isInitialized: true
        })
        return
      }

      // Construire AdminUser
      const adminUser: AdminUser = {
        id: user.id,
        email: user.email || '',
        role: adminRole.role as 'admin' | 'super_admin' | 'moderator',
        granted_at: adminRole.granted_at,
        is_active: adminRole.is_active,
        full_name: profile?.full_name,
        is_banned: profile?.is_banned || false,
        ban_reason: profile?.ban_reason
      }

      console.log('[useAdminAuthFixed] 🎯 Auth admin réussie:', adminUser.role)

      setState({
        user: adminUser,
        loading: false,
        error: null,
        isAuthenticated: true,
        isInitialized: true
      })

    } catch (error) {
      console.error('[useAdminAuthFixed] 💥 Erreur générale:', error)
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isAuthenticated: false,
        isInitialized: true
      })
    }
  }, [supabase])

  // Hook hasPermission simplifié
  const hasPermission = useCallback((requiredRole: 'moderator' | 'admin' | 'super_admin') => {
    if (!state.user || !state.isAuthenticated) return false

    const roleHierarchy = {
      'moderator': 1,
      'admin': 2,
      'super_admin': 3
    }

    const userLevel = roleHierarchy[state.user.role]
    const requiredLevel = roleHierarchy[requiredRole]

    return userLevel >= requiredLevel
  }, [state.user, state.isAuthenticated])

  // Fonction getAdminStats simplifiée
  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    try {
      if (!state.isAuthenticated) return null

      console.log('[useAdminAuthFixed] 📊 Récupération stats admin...')

      const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

      if (error) {
        console.error('[useAdminAuthFixed] ❌ Erreur stats:', error)
        return null
      }

      if (data && data.length > 0) {
        return {
          total_users: data[0].total_users || 0,
          new_users_24h: data[0].new_users_24h || 0,
          new_users_7d: data[0].new_users_7d || 0,
          admin_users: data[0].admin_users || 0,
          banned_users: data[0].banned_users || 0,
          open_tickets: data[0].open_tickets || 0,
          tickets_24h: data[0].tickets_24h || 0,
          feedback_tickets: data[0].feedback_tickets || 0,
          resolved_tickets: data[0].resolved_tickets || 0,
          workouts_24h: data[0].workouts_24h || 0,
          workouts_7d: data[0].workouts_7d || 0
        }
      }

      return null
    } catch (error) {
      console.error('[useAdminAuthFixed] 💥 Erreur getAdminStats:', error)
      return null
    }
  }, [supabase, state.isAuthenticated])

  // Log admin action simplifié
  const logAdminAction = useCallback(async (
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>
  ) => {
    try {
      if (!state.user) return false

      const { error } = await supabase
        .from('admin_logs')
        .insert({
          admin_id: state.user.id,
          action,
          target_type: targetType,
          target_id: targetId || null,
          details: details || {}
        })

      if (error) {
        console.error('[useAdminAuthFixed] ❌ Erreur log action:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('[useAdminAuthFixed] 💥 Erreur logAdminAction:', error)
      return false
    }
  }, [supabase, state.user])

  // Effect principal
  useEffect(() => {
    console.log('[useAdminAuthFixed] 🔄 useEffect déclenché')
    checkAuth()
  }, [checkAuth])

  console.log('[useAdminAuthFixed] 📤 Retour état:', {
    user: state.user?.email || null,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated
  })

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    hasPermission,
    getAdminStats,
    logAdminAction,
    reload: checkAuth
  }
}