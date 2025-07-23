import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAdminAuthComplete } from '@/hooks/useAdminAuthComplete'

// Types pour la gestion des utilisateurs
export interface AdminUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  is_onboarding_complete: boolean
  created_at: string
  updated_at: string
  last_workout?: string
  total_workouts: number
  is_active: boolean
  banned_until?: string
  ban_reason?: string
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
  
  const { hasPermission, logAdminAction } = useAdminAuthComplete()
  const supabase = createClient()

  // Récupérer tous les utilisateurs (admin uniquement)
  const getAllUsers = useCallback(async (): Promise<AdminUser[]> => {
    if (!hasPermission('admin')) {
      setError('Permissions insuffisantes pour cette action')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      console.log('[DEBUG] Récupération de tous les utilisateurs via RPC...')
      
      const { data, error: rpcError } = await supabase
        .rpc('get_all_users_admin')

      if (rpcError) {
        console.error('[ERROR] RPC get_all_users_admin failed:', rpcError)
        throw rpcError
      }

      if (!data) {
        console.log('[DEBUG] Aucun utilisateur trouvé')
        return []
      }

      console.log(`[DEBUG] ${data.length} utilisateurs récupérés avec succès`)
      
      // Transformer les données au format AdminUser
      const transformedUsers: AdminUser[] = data.map((user: Record<string, unknown>) => ({
        id: user.id as string,
        email: (user.email as string) || '',
        full_name: user.full_name as string,
        avatar_url: user.avatar_url as string,
        role: (user.role as AdminUser['role']) || 'user',
        is_onboarding_complete: (user.is_onboarding_complete as boolean) || false,
        created_at: user.created_at as string,
        updated_at: user.updated_at as string,
        last_workout: user.last_workout as string,
        total_workouts: parseInt(String(user.total_workouts)) || 0,
        is_active: user.is_active as boolean,
        banned_until: user.banned_until as string,
        ban_reason: user.ban_reason as string
      }))

      setUsers(transformedUsers)
      
      // Logger l'action admin
      await logAdminAction('view_all_users', 'users', undefined, { 
        users_count: transformedUsers.length 
      })
      
      return transformedUsers

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs'
      console.error('[ERROR] getAllUsers:', errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase])

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

      const { error } = await supabase
        .rpc('update_user_role_admin', {
          target_user_id: userId,
          new_role: newRole
        })

      if (error) {
        console.error('[ERROR] update_user_role_admin failed:', error)
        throw error
      }

      console.log('[DEBUG] Rôle mis à jour avec succès')

      // Logger l'action admin
      await logAdminAction('update_user_role', 'users', userId, {
        user_id: userId,
        new_role: newRole
      })

      // Recharger la liste des utilisateurs
      await getAllUsers()
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rôle'
      console.error('[ERROR] updateUserRole:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase, getAllUsers])

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
      await logAdminAction(
        banned_until ? 'ban_user' : 'unban_user', 
        'users', 
        userId, 
        {
          user_id: userId,
          banned_until: banned_until?.toISOString(),
          ban_reason
        }
      )

      // Recharger la liste des utilisateurs
      await getAllUsers()
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du bannissement'
      console.error('[ERROR] banUser:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase, getAllUsers])

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
      await logAdminAction('delete_user', 'users', userId, {
        user_id: userId
      })

      // Recharger la liste des utilisateurs
      await getAllUsers()
      
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      console.error('[ERROR] deleteUser:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [hasPermission, logAdminAction, supabase, getAllUsers])

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
    if (hasPermission('admin')) {
      getAllUsers()
    }
  }, [hasPermission, getAllUsers])

  // Utilitaires pour le filtrage et tri côté client
  const getActiveUsers = useCallback(() => {
    return users.filter(user => user.is_active)
  }, [users])

  const getBannedUsers = useCallback(() => {
    return users.filter(user => !user.is_active)
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