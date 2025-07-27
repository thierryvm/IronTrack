'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAdminAuthFixed, AdminUser, AdminStats } from '@/hooks/useAdminAuthFixed'

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  hasPermission: (requiredRole: 'moderator' | 'admin' | 'super_admin') => boolean
  getAdminStats: () => Promise<AdminStats | null>
  logAdminAction: (action: string, targetType: string, targetId?: string, details?: Record<string, unknown>) => Promise<boolean>
  reload: () => Promise<void>
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
  console.log('[AdminAuthProvider] 🏗️ Provider initialisé - auth centralisée')
  
  // UNE SEULE instance du hook d'auth pour toute l'app admin
  const authState = useAdminAuthFixed()
  
  console.log('[AdminAuthProvider] 📤 État partagé:', {
    user: authState.user?.email || 'null',
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated
  })

  return (
    <AdminAuthContext.Provider value={authState}>
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
  
  console.log('[useAdminAuth] 📋 Context consommé:', {
    user: context.user?.email || 'null',
    hasAuth: context.isAuthenticated
  })
  
  return context
}