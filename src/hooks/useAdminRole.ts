'use client'

import { useState, useEffect, useCallback} from'react'
import { hasAdminPermission, isUserCurrentlyBanned} from'@/lib/admin-security'
import { createClient} from'@/utils/supabase/client'

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
 const { data: { user}, error: userError} = await supabase.auth.getUser()
 
 if (userError || !user) {
 setIsAdmin(false)
 setIsModerator(false)
 return
}

 // Vérifier le rôle admin via profiles, aligné avec middleware + API
 const { data: roleData, error: roleError} = await supabase
 .from('profiles')
 .select('role, is_banned, banned_until')
 .eq('id', user.id)
 .maybeSingle()


 if (roleError || !roleData) {
 setIsAdmin(false)
 setIsModerator(false)
 return
}

 if (isUserCurrentlyBanned(roleData.is_banned, roleData.banned_until)) {
 setIsAdmin(false)
 setIsModerator(false)
 return
}

 // Définir les rôles
 const hasAdminRole = hasAdminPermission(roleData.role, 'admin')
 const hasModeratorRole = hasAdminPermission(roleData.role, 'moderator')

 setIsAdmin(hasAdminRole)
 setIsModerator(hasModeratorRole)

} catch (error) {
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
 const { data: { subscription}} = supabase.auth.onAuthStateChange(() => {
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
