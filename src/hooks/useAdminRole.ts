'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

/**
 * Hook léger pour détecter le rôle admin sans redirection
 * Utilisé dans le header pour afficher/masquer le lien admin
 */
// ✅ Fonction debounce pour éviter appels trop fréquents
const debounce = (func: () => void, wait: number) => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(func, wait)
  }
}

export const useAdminRole = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // ✅ CORRECTION CRITIQUE: Mémoriser checkAdminRole pour éviter re-création
  const checkAdminRole = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Vérifier l'authentification
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setIsAdmin(false)
        setIsModerator(false)
        return
      }


      // Vérifier le rôle admin (sans redirection)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin', 'moderator'])
        .eq('is_active', true)
        .maybeSingle()


      if (roleError || !roleData) {
        setIsAdmin(false)
        setIsModerator(false)
        return
      }


      // Vérifier expiration
      if (roleData.expires_at && new Date(roleData.expires_at) < new Date()) {
        setIsAdmin(false)
        setIsModerator(false)
        return
      }

      // Définir les rôles
      const hasAdminRole = roleData.role === 'admin' || roleData.role === 'super_admin'
      const hasModeratorRole = ['moderator', 'admin', 'super_admin'].includes(roleData.role)

      setIsAdmin(hasAdminRole)
      setIsModerator(hasModeratorRole)

    } catch (error) {
      console.error('[ADMIN_ROLE] Check failed:', error)
      setIsAdmin(false)
      setIsModerator(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ CORRECTION CRITIQUE: Debouncer les appels onAuthStateChange
  const debouncedCheck = useCallback(
    debounce(() => checkAdminRole(), 500), // 500ms debounce
    [checkAdminRole]
  )

  useEffect(() => {
    checkAdminRole()

    // Écouter les changements d'authentification avec debounce
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      debouncedCheck()
    })

    return () => subscription.unsubscribe()
  }, [checkAdminRole, debouncedCheck])

  return {
    isAdmin,
    isModerator,
    loading
  }
}