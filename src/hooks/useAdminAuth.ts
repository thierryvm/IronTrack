// ============================================================================
// HOOK D'AUTHENTIFICATION ADMIN SÉCURISÉ
// ============================================================================
// Gestion des permissions admin avec vérification multi-couches

import { useState, useEffect, useCallback} from'react'
import { hasAdminPermission, isUserCurrentlyBanned} from'@/lib/admin-security'
import { createClient} from'@/utils/supabase/client'
import { useRouter} from'next/navigation'

export interface AdminUser {
 id: string
 email: string
 role:'admin' |'super_admin' |'moderator'
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

export const useAdminAuth = () => {
 const [user, setUser] = useState<AdminUser | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [initialized, setInitialized] = useState(false)
 const router = useRouter()
 const supabase = createClient()

 // Vérifier les permissions admin - DÉPENDANCES STABILISÉES
 const checkAdminPermissions = useCallback(async (userId: string): Promise<AdminUser | null> => {
 try {
 // 1. Vérifier le rôle via profiles pour rester aligné avec le middleware et les routes API
 const { data: roleData, error: roleError} = await supabase
 .from('profiles')
 .select('role, is_banned, banned_until')
 .eq('id', userId)
 .maybeSingle()

 if (roleError) {
 throw new Error('Erreur lors de la vérification des permissions')
}

 if (!roleData) {
 throw new Error('Permissions administrateur insuffisantes')
}

 // 2. Vérifier bannissement + rôle minimum
 if (isUserCurrentlyBanned(roleData.is_banned, roleData.banned_until)) {
 throw new Error('Compte administrateur temporairement bloqué')
}

 if (!hasAdminPermission(roleData.role, 'moderator')) {
 throw new Error('Permissions administrateur insuffisantes')
}

 // 3. Récupérer les infos utilisateur
 const { data: { user: authUser}} = await supabase.auth.getUser()
 if (!authUser?.email) {
 throw new Error('Utilisateur non authentifié')
}

 // 4. Log de l\'accès admin (non bloquant)
 try {
 await supabase
 .from('admin_logs')
 .insert({
 admin_id: userId,
 action:'admin_access',
 target_type:'admin_panel',
 details: {
 role: roleData.role,
 timestamp: new Date().toISOString(),
 user_agent: typeof window !=='undefined' ? navigator.userAgent :'server'
}
})
} catch {
 // Erreur de logging non critique
}

 const adminUser = {
 id: userId,
 email: authUser.email,
 role: roleData.role as'admin' |'super_admin' |'moderator',
 granted_at:'',
 is_active: true
}

 return adminUser
} catch {
 return null
}
}, []) // ✅ VIDE - supabase est stable via useState

 // Initialiser l\'authentification admin
 useEffect(() => {
 // ✅ PROTECTION: Éviter re-initialisation multiple
 if (initialized) return
 
 const initializeAuth = async () => {
 try {
 setLoading(true)
 setError(null)
 setInitialized(true)

 const { data: { user: authUser}} = await supabase.auth.getUser()
 
 if (!authUser) {
 setError('Authentification requise')
 // Éviter redirection en boucle si déjà sur auth
 if (typeof window !=='undefined' && !window.location.pathname.includes('/auth')) {
 router.push('/auth')
}
 return
}

 const adminUser = await checkAdminPermissions(authUser.id)
 
 if (!adminUser) {
 setError('Accès administrateur non autorisé')
 // Éviter redirection en boucle si déjà sur l'accueil
 if (typeof window !=='undefined' && window.location.pathname !=='/') {
 router.push('/')
}
 return
}

 setUser(adminUser)
} catch {
 setError('Erreur d\'authentification admin')
 // Éviter redirection en boucle sur erreur
 if (typeof window !=='undefined' && window.location.pathname !=='/') {
 router.push('/')
}
} finally {
 setLoading(false)
}
}

 initializeAuth()

 // Écouter les changements d\'authentification
 const { data: { subscription}} = supabase.auth.onAuthStateChange(
 async (event, session) => {
 if (event ==='SIGNED_OUT' || !session) {
 setUser(null)
 router.push('/')
} else if (event ==='SIGNED_IN' || event ==='TOKEN_REFRESHED') {
 const adminUser = await checkAdminPermissions(session.user.id)
 if (!adminUser) {
 setUser(null)
 router.push('/')
} else {
 setUser(adminUser)
}
}
}
 )

 return () => subscription.unsubscribe()
}, [initialized]) // ✅ Dépend de initialized pour éviter re-déclenchement

 // Récupérer les statistiques admin via RPC sécurisée
 const getAdminStats = async (): Promise<AdminStats | null> => {
 try {
 const { data, error} = await supabase
 .rpc('get_admin_dashboard_stats')

 if (error) throw error
 
 // RPC retourne un array, prendre le premier élément
 if (Array.isArray(data) && data.length > 0) {
 return data[0]
}
 
 return null
} catch {
 // Erreur de récupération des statistiques admin
 return null
}
}

 // Log d'une action admin - Mémoïsé pour éviter re-créations
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
 timestamp: new Date().toISOString(),
 user_agent: navigator.userAgent
}
})
} catch {
 // Erreur lors du logging de l'action admin
}
}, [user, supabase])

 // Vérifier une permission spécifique
 const hasPermission = (requiredRole:'moderator' |'admin' |'super_admin'): boolean => {
 if (!user) return false

 const roleHierarchy = {
 moderator: 1,
 admin: 2,
 super_admin: 3
}

 return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

 // Forcer la re-vérification des permissions
 const recheckPermissions = async () => {
 if (!user) return

 const updatedUser = await checkAdminPermissions(user.id)
 if (!updatedUser) {
 setUser(null)
 router.push('/')
} else {
 setUser(updatedUser)
}
}

 return {
 user,
 loading,
 error,
 hasPermission,
 getAdminStats,
 logAdminAction,
 recheckPermissions,
 isAuthenticated: !!user,
 isAdmin: user?.role ==='admin' || user?.role ==='super_admin',
 isSuperAdmin: user?.role ==='super_admin',
 isModerator: !!user && ['moderator','admin','super_admin'].includes(user.role)
}
}
