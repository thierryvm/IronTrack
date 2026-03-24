'use client'
import { useEffect} from'react'
import { useRouter} from'next/navigation'
import { AlertTriangle} from'lucide-react'

export default function AuthCodeErrorPage() {
 const router = useRouter()
 useEffect(() => {
 const timer = setTimeout(() => {
 router.push('/auth')
}, 5000)
 return () => clearTimeout(timer)
}, [router])

 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-600 via-red-500 to-purple-600 p-4">
 <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
 <div className="flex justify-center mb-4">
 <div className="bg-red-100 p-2 rounded-full">
 <AlertTriangle className="h-8 w-8 text-safe-error" />
 </div>
 </div>
 <h1 className="text-2xl font-bold text-foreground mb-2">Erreur de connexion</h1>
 <p className="text-gray-700 mb-4">
 Le lien d'inscription ou de connexion est invalide, expiré ou a déjà été utilisé.<br />
 Merci de recommencer la procédure.
 </p>
 <p className="text-gray-600 text-sm mb-4">Tu vas être redirigé automatiquement vers la page de connexion...</p>
 <button
 onClick={() => router.push('/auth')}
 className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold mt-2"
 >
 Retour à la connexion
 </button>
 </div>
 </div>
 )
} 