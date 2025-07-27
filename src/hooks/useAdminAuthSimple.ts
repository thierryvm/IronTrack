'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * Hook admin ultra-simplifié pour diagnostic
 * But: Isoler si le problème vient de l'auth de base ou de la logique admin
 */
export const useAdminAuthSimple = () => {
  const [debugState, setDebugState] = useState({
    step: 'init',
    user: null as User | null,
    hasUserRoles: false,
    isAdmin: false,
    error: null as string | null
  })

  useEffect(() => {
    console.log('[useAdminAuthSimple] 🚀 Hook démarré')
    setDebugState(prev => ({ ...prev, step: 'checking_auth' }))

    const checkSimpleAuth = async () => {
      try {
        const supabase = createClient()
        console.log('[useAdminAuthSimple] 📡 Client Supabase créé')

        // Étape 1: Vérifier auth de base
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('[useAdminAuthSimple] 👤 getUser result:', { user: user?.email, error: authError })

        if (authError) {
          console.error('[useAdminAuthSimple] ❌ Erreur auth:', authError)
          setDebugState({
            step: 'auth_error',
            user: null,
            hasUserRoles: false,
            isAdmin: false,
            error: authError.message
          })
          return
        }

        if (!user) {
          console.log('[useAdminAuthSimple] 🚫 Pas d\'utilisateur connecté')
          setDebugState({
            step: 'no_user',
            user: null,
            hasUserRoles: false,
            isAdmin: false,
            error: null
          })
          return
        }

        console.log('[useAdminAuthSimple] ✅ Utilisateur trouvé:', user.email)
        
        // Étape 2: Vérifier user_roles (version simple)
        console.log('[useAdminAuthSimple] 🔍 Vérification user_roles...')
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)

        console.log('[useAdminAuthSimple] 🎭 Roles result:', { roles, error: rolesError })

        const hasRoles = roles && roles.length > 0
        const isAdmin = hasRoles && roles.some(r => ['admin', 'super_admin', 'moderator'].includes(r.role))

        console.log('[useAdminAuthSimple] 🎯 Final state:', { hasRoles, isAdmin })

        setDebugState({
          step: 'complete',
          user,
          hasUserRoles: Boolean(hasRoles),
          isAdmin: Boolean(isAdmin),
          error: rolesError?.message || null
        })

      } catch (error) {
        console.error('[useAdminAuthSimple] 💥 Erreur générale:', error)
        setDebugState({
          step: 'general_error',
          user: null,
          hasUserRoles: false,
          isAdmin: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    checkSimpleAuth()
  }, [])

  console.log('[useAdminAuthSimple] 📊 État actuel:', debugState)

  return {
    user: debugState.user,
    isAdmin: debugState.isAdmin,
    loading: debugState.step === 'init' || debugState.step === 'checking_auth',
    error: debugState.error,
    debugInfo: debugState
  }
}