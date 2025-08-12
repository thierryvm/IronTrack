// Hook d'authentification admin simplifié pour debug
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin' | 'moderator'
  granted_at: string
  is_active: boolean
}

export const useAdminAuthSimple = () => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Version simplifiée sans timeout ni redirections - STABILISÉE
  const checkAdminPermissions = useCallback(async (userId: string): Promise<AdminUser | null> => {
    try {
      console.log('[SIMPLE_AUTH] Vérification permissions pour:', userId.slice(-8))
      
      // Vérifier le rôle admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, granted_at, is_active, expires_at')
        .eq('user_id', userId)
        .in('role', ['admin', 'super_admin', 'moderator'])
        .eq('is_active', true)
        .maybeSingle()

      if (roleError) {
        console.error('[SIMPLE_AUTH] Erreur rôle:', roleError)
        throw new Error('Erreur lors de la vérification des permissions')
      }

      if (!roleData) {
        console.log('[SIMPLE_AUTH] Aucun rôle admin trouvé')
        throw new Error('Permissions administrateur insuffisantes')
      }

      console.log('[SIMPLE_AUTH] Rôle trouvé:', roleData)

      // Vérifier expiration
      if (roleData.expires_at && new Date(roleData.expires_at) < new Date()) {
        console.log('[SIMPLE_AUTH] Rôle expiré')
        throw new Error('Permissions administrateur expirées')
      }

      // Récupérer les infos utilisateur
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser?.email) {
        console.log('[SIMPLE_AUTH] Pas d\'utilisateur authentifié')
        throw new Error('Utilisateur non authentifié')
      }

      const adminUser = {
        id: userId,
        email: authUser.email,
        role: roleData.role as 'admin' | 'super_admin' | 'moderator',
        granted_at: roleData.granted_at,
        is_active: roleData.is_active
      }

      console.log('[SIMPLE_AUTH] Utilisateur admin validé:', adminUser)
      return adminUser

    } catch (error) {
      console.error('[SIMPLE_AUTH] Échec vérification:', error)
      return null
    }
  }, []) // ✅ CORRECTION CRITIQUE: Pas de dépendances pour éviter re-création

  // ✅ CORRECTION CRITIQUE: useRef pour éviter boucles infinies 
  const initialized = useRef(false)

  useEffect(() => {
    // Éviter les doubles initialisations
    if (initialized.current) return
    initialized.current = true

    const initializeAuth = async () => {
      try {
        console.log('[SIMPLE_AUTH] ⚡ Initialisation UNIQUE...')
        setLoading(true)
        setError(null)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          console.log('[SIMPLE_AUTH] Aucun utilisateur connecté')
          setError('Authentification requise')
          setLoading(false)
          return
        }

        console.log('[SIMPLE_AUTH] Utilisateur connecté:', authUser.email?.split('@')[0] + '@***')

        const adminUser = await checkAdminPermissions(authUser.id)
        
        if (!adminUser) {
          console.log('[SIMPLE_AUTH] Pas de permissions admin')
          setError('Accès administrateur non autorisé')
          setLoading(false)
          return
        }

        console.log('[SIMPLE_AUTH] ✅ Authentification réussie!')
        setUser(adminUser)
      } catch (error) {
        console.error('[SIMPLE_AUTH] Erreur initialisation:', error)
        setError('Erreur d\'authentification admin')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Cleanup pour reset lors de démontage
    return () => {
      initialized.current = false
    }
  }, []) // ✅ CORRECTION CRITIQUE: Aucune dépendance pour éviter boucles

  // Vérifier une permission spécifique
  const hasPermission = (requiredRole: 'moderator' | 'admin' | 'super_admin'): boolean => {
    if (!user) return false

    const roleHierarchy = {
      moderator: 1,
      admin: 2,
      super_admin: 3
    }

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }

  // Log d'action simplifié
  const logAdminAction = useCallback(async (
    action: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!user) return

    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: user.id,
          action,
          target_type: targetType,
          target_id: targetId,
          details: {
            ...details,
            timestamp: new Date().toISOString()
          }
        })
    } catch (error) {
      console.error('[SIMPLE_AUTH] Erreur log:', error)
    }
  }, [user, supabase])

  return {
    user,
    loading,
    error,
    hasPermission,
    logAdminAction,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    isModerator: !!user && ['moderator', 'admin', 'super_admin'].includes(user.role)
  }
}