'use client'

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react'
import { useAdminAuth as useAdminAuthHook, AdminUser, AdminStats } from '@/hooks/useAdminAuth'

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  hasPermission: (requiredRole: 'moderator' | 'admin' | 'super_admin') => boolean
  getAdminStats: () => Promise<AdminStats | null>
  logAdminAction: (action: string, targetType: string, targetId?: string, details?: Record<string, unknown>) => Promise<void>
  recheckPermissions: () => Promise<void>
  refreshUserRoles: () => Promise<void>
  isAdmin: boolean
  isSuperAdmin: boolean
  isModerator: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

interface AdminAuthProviderProps {
  children: ReactNode
}

/**
 * Provider d'authentification admin - UNE SEULE INSTANCE pour toute l'app admin
 * Résout le problème de double instanciation des hooks d'auth
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  // Provider initialisé - auth centralisée
  
  // UNE SEULE instance du hook d'auth pour toute l'app admin
  const authState = useAdminAuthHook()
  
  // ✅ CORRECTION CRITIQUE: Mémoriser refreshUserRoles pour éviter re-création
  const refreshUserRoles = useCallback(async () => {
    // Rafraîchissement user_roles demandé
    await authState.recheckPermissions()
    // Rafraîchissement user_roles terminé
  }, [authState.recheckPermissions])
  
  // ✅ CORRECTION CRITIQUE: Mémoriser contextValue pour éviter re-renders infinis
  const contextValue = useMemo(() => ({
    ...authState,
    refreshUserRoles
  }), [authState, refreshUserRoles])
  
  // État partagé admin géré par le provider

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  )
}

/**
 * Hook pour consommer l'authentification admin dans les pages
 * Remplace les appels directs à useAdminAuthFixed()
 */
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  
  if (!context) {
    throw new Error('useAdminAuth doit être utilisé dans un AdminAuthProvider')
  }
  
  // Context admin consommé
  
  return context
}