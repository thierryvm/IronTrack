import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

// Types pour la gestion des utilisateurs
export interface AdminUser {
  id: string
  email: string
  full_name?: string
  pseudo?: string
  avatar_url?: string
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  is_onboarding_complete: boolean
  created_at: string
  updated_at: string
  last_workout?: string
  total_workouts: number
  is_active: boolean // Actif récemment (basé sur last_active)
  is_banned: boolean // Explicitement banni (basé sur banned_until vs maintenant)
  banned_until?: string
  ban_reason?: string
  last_active?: string
}

export interface UserStats {
  total_workouts: number
  total_exercises: number
  last_workout?: string
  first_workout?: string
  badges_count: number
  support_tickets: number
  account_age_days: number
}

export interface BanUserOptions {
  banned_until?: Date
  ban_reason?: string
}

export const useAdminUserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)
  
  const { hasPermission, logAdminAction, refreshUserRoles } = useAdminAuth()
  const supabase = createClient()

  // Récupérer tous les utilisateurs (admin uniquement)
  const getAllUsers = useCallback(async (): Promise<AdminUser[]> => {
    if (!hasPermission('moderator')) {
      setError('Permissions insuffisantes pour cette action')
      return []
    }

    try {
      // Protection avec useRef contre les appels multiples
      if (isLoadingRef.current) {
        console.log('[DEBUG] getAllUsers déjà en cours, ignoré')
        return []
      }
      
      isLoadingRef.current = true
      setLoading(true)
      setError(null)

      console.log('[DEBUG] Récupération de tous les utilisateurs via API route...')
      
      // Utiliser la nouvelle API route sécurisée
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include', // Important pour les cookies de session
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Réponse non-JSON' }))
        throw new Error(`Erreur API (${response.status}): ${errorData.error || response.statusText}`)
      }

      const { users } = await response.json()
      
      if (!users || users.length === 0) {
        console.log('[DEBUG] Aucun utilisateur trouvé')
        return []
      }

      console.log(`[DEBUG] ${users.length} utilisateurs récupérés avec succès via API`)
      
      // Transformer les données au format AdminUser
      const transformedUsers: AdminUser[] = users.map((user: Record<string, unknown>) => ({
        id: user.id as string,
        email: (user.email as string) || '',
        full_name: user.full_name as string,
        pseudo: user.pseudo as string, // 🎯 AJOUT DU CHAMP PSEUDO
        avatar_url: user.avatar_url as string,
        role: (user.role as AdminUser['role']) || 'user',
        is_onboarding_complete: (user.is_onboarding_complete as boolean) || false,
        created_at: user.created_at as string,
        updated_at: user.updated_at as string,
        last_workout: user.last_workout as string,
        total_workouts: parseInt(String(user.workout_count)) || 0,
        is_active: user.is_active as boolean, // Actif récemment (calculé par API)
        is_banned: user.is_banned as boolean, // Banni explicitement (calculé par API)
        banned_until: user.banned_until as string,
        ban_reason: user.ban_reason as string,
        last_active: user.last_active as string
      }))

      setUsers(transformedUsers)
      
      // Logger l'action admin (déjà fait côté API)
      console.log(`[ADMIN_USERS] Chargé ${transformedUsers.length} utilisateurs avec succès`)
      
      return transformedUsers

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs'
      console.error('[ERROR] getAllUsers:', errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [hasPermission])

  // Mettre à jour le rôle d'un utilisateur (super_admin uniquement)
  const updateUserRole = useCallback(async (
    userId: string, 
    newRole: 'user' | 'moderator' | 'admin' | 'super_admin'
  ): Promise<boolean> => {
    if (!hasPermission('super_admin')) {
      setError('Seuls les super_admin peuvent modifier les rôles')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`[DEBUG] Mise à jour du rôle pour ${userId}: ${newRole}`)

      // Utiliser la nouvelle fonction RPC corrigée
      const { data, error } = await supabase
        .rpc('admin_change_user_role', {
          target_user_id: userId,
          new_role: newRole
        })

      if (error) {
        console.error('[ERROR] admin_change_user_role failed:', error)
        throw error
      }

      console.log('[DEBUG] Rôle mis à jour avec succès:', data)

      // Logger l'action admin
      try {
        await logAdminAction('update_user_role', 'user_account', userId, { new_role: newRole })
      } catch (logError) {
        console.warn('Erreur lors du logging admin action:', logError)
      }

      // Mettre à jour localement l'utilisateur au lieu de recharger toute la liste
      console.log('[DEBUG] Mise à jour locale de l\'utilisateur...')
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      )
      console.log('[DEBUG] Utilisateur mis à jour localement')
      
      // 🚀 SOLUTION CRITIQUE: Rafraîchir user_roles dans AdminAuthContext
      console.log('[DEBUG] 🔄 Rafraîchissement AdminAuthContext après modification rôle...')
      try {
        await refreshUserRoles()
        console.log('[DEBUG] ✅ AdminAuthContext rafraîchi avec succès')
      } catch (refreshError) {
        console.warn('[DEBUG] ⚠️ Erreur rafraîchissement AdminAuthContext:', refreshError)
        // Ne pas faire échouer toute l'opération pour ça
      }
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle'
      console.error('[ERROR] updateUserRole:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, refreshUserRoles, supabase])

  // Bannir ou débannir un utilisateur (admin uniquement)
  const banUser = useCallback(async (
    userId: string, 
    options: BanUserOptions = {}
  ): Promise<boolean> => {
    if (!hasPermission('admin')) {
      setError('Permissions insuffisantes pour bannir un utilisateur')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const { banned_until, ban_reason } = options
      
      console.log(`[DEBUG] ${banned_until ? 'Bannissement' : 'Débannissement'} utilisateur ${userId}`)

      const { error } = await supabase
        .rpc('ban_user_admin', {
          target_user_id: userId,
          banned_until: banned_until?.toISOString() || null,
          ban_reason: ban_reason || null
        })

      if (error) {
        console.error('[ERROR] ban_user_admin failed:', error)
        throw error
      }

      console.log('[DEBUG] Action de bannissement réussie')

      // Logger l'action admin
      try {
        await logAdminAction('ban_user', 'user_account', userId, { banned_until, ban_reason })
      } catch (logError) {
        console.warn('Erreur lors du logging admin action:', logError)
      }

      // Mettre à jour localement l'utilisateur banni
      const isBanned = !!banned_until
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_banned: isBanned, ban_reason: ban_reason, banned_until: banned_until?.toISOString() }
            : user
        )
      )
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du bannissement'
      console.error('[ERROR] banUser:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase])

  // Supprimer un utilisateur (super_admin uniquement)
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!hasPermission('super_admin')) {
      setError('Seuls les super_admin peuvent supprimer des utilisateurs')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`[DEBUG] Suppression de l'utilisateur ${userId}`)

      const { error } = await supabase
        .rpc('delete_user_admin', {
          target_user_id: userId
        })

      if (error) {
        console.error('[ERROR] delete_user_admin failed:', error)
        throw error
      }

      console.log('[DEBUG] Utilisateur supprimé avec succès')

      // Logger l'action admin
      try {
        await logAdminAction('delete_user', 'user_account', userId)
      } catch (logError) {
        console.warn('Erreur lors du logging admin action:', logError)
      }

      // Retirer l'utilisateur de la liste locale
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      console.error('[ERROR] deleteUser:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase])

  // Récupérer les statistiques d'un utilisateur spécifique
  const getUserStats = useCallback(async (userId: string): Promise<UserStats | null> => {
    if (!hasPermission('admin')) {
      setError('Permissions insuffisantes pour voir les statistiques utilisateur')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`[DEBUG] Récupération des statistiques pour l'utilisateur ${userId}`)

      const { data, error } = await supabase
        .rpc('get_user_stats_admin', {
          target_user_id: userId
        })

      if (error) {
        console.error('[ERROR] get_user_stats_admin failed:', error)
        throw error
      }

      console.log('[DEBUG] Statistiques utilisateur récupérées:', data)

      return data as UserStats

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques'
      console.error('[ERROR] getUserStats:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [hasPermission, supabase])

  // Charger automatiquement les utilisateurs au premier rendu
  useEffect(() => {
    if (hasPermission('moderator')) {
      getAllUsers()
    }
  }, [hasPermission, getAllUsers])

  // Utilitaires pour le filtrage et tri côté client
  const getActiveUsers = useCallback(() => {
    return users.filter(user => user.is_active)
  }, [users])

  const getBannedUsers = useCallback(() => {
    return users.filter(user => user.is_banned)
  }, [users])

  const getUsersByRole = useCallback((role: string) => {
    return users.filter(user => user.role === role)
  }, [users])

  const searchUsers = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return users.filter(user => 
      user.email.toLowerCase().includes(term) ||
      (user.full_name || '').toLowerCase().includes(term)
    )
  }, [users])

  return {
    // État
    users,
    loading,
    error,
    
    // Actions CRUD
    getAllUsers,
    updateUserRole,
    banUser,
    deleteUser,
    getUserStats,
    
    // Utilitaires
    getActiveUsers,
    getBannedUsers, 
    getUsersByRole,
    searchUsers,
    
    // Helpers
    clearError: () => setError(null)
  }
}