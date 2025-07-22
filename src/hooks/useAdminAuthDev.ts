// Hook d'authentification admin pour développement - Version ultra-simplifiée
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin' | 'moderator'
  granted_at: string
  is_active: boolean
}

export interface AdminStats {
  open_tickets: number
  in_progress_tickets: number
  tickets_24h: number
  tickets_7d: number
  new_users_24h: number
  new_users_7d: number
  admin_users: number
  workouts_24h: number
  workouts_7d: number
}

export const useAdminAuthDev = () => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Version ultra-simplifiée pour le développement
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[ADMIN_DEV] Initializing...')
        setLoading(true)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          console.log('[ADMIN_DEV] No authenticated user')
          setError('Utilisateur non connecté')
          setLoading(false)
          return
        }

        console.log('[ADMIN_DEV] Auth user found:', authUser.id)

        // Récupérer le profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, role, is_banned')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          console.error('[ADMIN_DEV] Profile error:', profileError)
          setError(`Erreur profil: ${profileError.message}`)
          setLoading(false)
          return
        }

        console.log('[ADMIN_DEV] Profile found:', profile)

        // Pour le développement : donner l'accès admin à tous les utilisateurs connectés
        const adminUser: AdminUser = {
          id: authUser.id,
          email: profile.email || authUser.email || 'dev@irontrack.com',
          role: profile.role || 'super_admin', // Forcer super_admin pour dev
          granted_at: new Date().toISOString(),
          is_active: !profile.is_banned
        }

        console.log('[ADMIN_DEV] Admin access granted:', adminUser)
        setUser(adminUser)
        setError(null)

      } catch (error) {
        console.error('[ADMIN_DEV] Init failed:', error)
        setError(`Erreur: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [supabase])

  const hasPermission = (requiredRole: 'moderator' | 'admin' | 'super_admin'): boolean => {
    if (!user) return false
    
    // Pour le développement : toujours autoriser
    console.log('[ADMIN_DEV] Permission check:', { user: user.role, required: requiredRole })
    return true
  }

  const logAdminAction = async (action: string, targetType: string, targetId?: string, details?: Record<string, unknown>) => {
    console.log('[ADMIN_DEV] Logging action:', { action, targetType, targetId, details })
    // Version simplifiée pour dev
  }

  const getAdminStats = async (): Promise<AdminStats | null> => {
    try {
      console.log('[ADMIN_DEV] Getting stats...')
      
      // Stats basiques pour le développement
      const { data: tickets } = await supabase.from('support_tickets').select('status, created_at')
      const { data: profiles } = await supabase.from('profiles').select('created_at, role')
      
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const stats: AdminStats = {
        open_tickets: tickets?.filter(t => t.status === 'open').length || 0,
        in_progress_tickets: tickets?.filter(t => t.status === 'in_progress').length || 0,
        tickets_24h: tickets?.filter(t => new Date(t.created_at) >= oneDayAgo).length || 0,
        tickets_7d: tickets?.filter(t => new Date(t.created_at) >= sevenDaysAgo).length || 0,
        new_users_24h: profiles?.filter(p => new Date(p.created_at) >= oneDayAgo).length || 0,
        new_users_7d: profiles?.filter(p => new Date(p.created_at) >= sevenDaysAgo).length || 0,
        admin_users: profiles?.filter(p => ['admin', 'super_admin', 'moderator'].includes(p.role)).length || 1,
        workouts_24h: 5, // Valeurs de dev
        workouts_7d: 25
      }

      console.log('[ADMIN_DEV] Stats:', stats)
      return stats

    } catch (error) {
      console.error('[ADMIN_DEV] Stats error:', error)
      return null
    }
  }

  return {
    user,
    loading,
    error,
    hasPermission,
    logAdminAction,
    getAdminStats
  }
}