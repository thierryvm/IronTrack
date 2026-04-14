'use client'

import { useAuth} from'@/hooks/useAuth'
import { useUserProfile} from'@/hooks/useUserProfile'

interface UserGreetingProps {
 className?: string
 showError?: boolean
}

export default function UserGreeting({ className ='', showError = false}: UserGreetingProps) {
 const { isAuthenticated, isLoading: authLoading} = useAuth()
 const { displayName, isLoading: profileLoading, error} = useUserProfile()
 
 const isLoading = authLoading || (isAuthenticated && profileLoading)

 // Skeleton optimisé pour LCP - Dimensions exactes
 if (isLoading) {
 return (
 <div className={`text-center ${className}`} style={{ minHeight:'120px'}}>
 <div className="animate-pulse">
 <div className="h-8 bg-card/20 rounded-lg w-64 mx-auto mb-4"></div>
 <div className="h-6 bg-card/10 rounded-lg w-80 mx-auto"></div>
 </div>
 </div>
 )
}

 // Contenu sans animation pour LCP critique
 const content = (
 <>
 <h1 className="text-4xl font-bold mb-4">
 Bonjour {displayName} ! 💪
 </h1>
 <p className="text-xl text-white/90">
 Prêt pour une nouvelle séance de musculation ?
 </p>
 {showError && error && (
 <p className="text-sm text-white/80 mt-2">
 ⚠️ Erreur de profil : {error}
 </p>
 )}
 </>
 )

 return (
 <div className={`text-center ${className}`} style={{ minHeight:'120px'}}>
 {content}
 </div>
 )
}