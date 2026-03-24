"use client"
import { useRouter} from'next/navigation'
import { useEffect} from'react'

export default function WorkoutDetailPage() {
 const router = useRouter()

 useEffect(() => {
 // Rediriger vers la page des séances - les détails sont maintenant dans la modal
 router.replace('/workouts')
}, [router])

 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-gray-600">Redirection...</p>
 </div>
 </div>
 )
} 