'use client'

import { useEffect} from'react'
import { useRouter} from'next/navigation'

/**
 * Page de redirection pour /auth/login
 * Évite les erreurs 404 en redirigeant vers /auth
 */
export default function LoginPage() {
 const router = useRouter()

 useEffect(() => {
 // Redirection immédiate vers la page auth principale
 router.replace('/auth')
}, [router])

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-gray-600">Redirection...</p>
 </div>
 </div>
 )
}