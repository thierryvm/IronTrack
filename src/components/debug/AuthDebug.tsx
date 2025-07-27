'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * Composant de debug pour vérifier l'état d'authentification global
 */
export function AuthDebug() {
  const [authState, setAuthState] = useState<{
    user: User | null
    loading: boolean
    error: string | null
  }>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const supabase = createClient()
    
    const checkAuth = async () => {
      console.log('[AuthDebug] Vérification authentification globale...')
      
      try {
        // Vérifier session actuelle
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('[AuthDebug] Erreur auth:', error)
          setAuthState({
            user: null,
            loading: false,
            error: error.message
          })
          return
        }

        console.log('[AuthDebug] Utilisateur trouvé:', user ? `${user.email} (${user.id})` : 'null')
        
        setAuthState({
          user,
          loading: false,
          error: null
        })
        
        // Si utilisateur connecté, vérifier user_roles
        if (user) {
          console.log('[AuthDebug] Vérification user_roles...')
          
          const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
          
          if (rolesError) {
            console.error('[AuthDebug] Erreur user_roles:', rolesError)
          } else {
            console.log('[AuthDebug] user_roles pour cet utilisateur:', userRoles)
          }
        }
        
      } catch (error) {
        console.error('[AuthDebug] Erreur générale:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    checkAuth()
  }, [])

  if (authState.loading) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg z-50">
        <div className="font-semibold">🔍 AuthDebug</div>
        <div className="text-sm">Vérification auth...</div>
      </div>
    )
  }

  if (authState.error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg z-50 max-w-sm">
        <div className="font-semibold">❌ AuthDebug Error</div>
        <div className="text-sm">{authState.error}</div>
      </div>
    )
  }

  if (!authState.user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg z-50">
        <div className="font-semibold">🚫 AuthDebug</div>
        <div className="text-sm">Aucun utilisateur connecté</div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg z-50 max-w-sm">
      <div className="font-semibold">✅ AuthDebug</div>
      <div className="text-sm">
        <div>User: {authState.user.email}</div>
        <div>ID: {authState.user.id}</div>
      </div>
    </div>
  )
}