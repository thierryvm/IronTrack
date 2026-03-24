'use client'

import { useState, useEffect, useCallback} from'react'
import { useRouter} from'next/navigation'
import { ArrowLeft, Users, Apple, TrendingUp, Calendar, Loader2} from'lucide-react'
import { useAuth} from'@/hooks/useAuth'
import { motion} from'framer-motion'

interface Partnership {
 id: string
 requester_id: string
 partner_id: string
 status: string
 created_at?: string
 partner: {
 id: string
 pseudo: string | null
 full_name: string | null
 avatar_url: string | null
}
 requester: {
 id: string
 pseudo: string | null
 full_name: string | null
 avatar_url: string | null
}
}


export default function SharedDashboardPage() {
 const { user, isAuthenticated, isLoading} = useAuth()
 const router = useRouter()
 
 const [partnerships, setPartnerships] = useState<Partnership[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 const loadPartnerships = useCallback(async () => {
 if (!isAuthenticated || !user) return

 try {
 setError(null)
 setLoading(true)

 const response = await fetch('/api/training-partners')

 if (!response.ok) {
 const errorText = await response.text()
 console.error('❌ Erreur API:', errorText)
 throw new Error(`Erreur ${response.status}: ${errorText}`)
}

 const result = await response.json()

 // Filtrer seulement les partenaires acceptés
 const acceptedPartnerships = result.partnerships?.filter(
 (p: Partnership) => p.status ==='accepted'
 ) || []

 setPartnerships(acceptedPartnerships)
} catch (err) {
 console.error('Erreur chargement partenaires:', err)
 setError(err instanceof Error ? err.message :'Erreur inconnue')
} finally {
 setLoading(false)
}
}, [isAuthenticated, user])

 useEffect(() => {
 if (isAuthenticated && user) {
 loadPartnerships()
}
}, [isAuthenticated, user, loadPartnerships])

 const getPartnerInfo = (partnership: Partnership) => {
 // Si je suis le requester, mon partenaire est dans partner_id
 if (partnership.requester_id === user?.id) {
 return {
 id: partnership.partner_id,
 profile: partnership.partner,
 displayName: partnership.partner.pseudo || partnership.partner.full_name ||'Partenaire'
}
}
 // Si je suis le partner, mon partenaire est dans requester_id
 else {
 return {
 id: partnership.requester_id,
 profile: partnership.requester,
 displayName: partnership.requester.pseudo || partnership.requester.full_name ||'Partenaire'
}
}
}

 if (isLoading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-orange-800" />
 </div>
 )
}

 if (!isAuthenticated) {
 router.push('/auth')
 return null
}

 return (
 <div className="min-h-screen bg-background py-8">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl p-6 mb-8">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <button
 onClick={() => router.back()}
 className="p-2 bg-card/20 border border-border rounded-lg hover:bg-muted/50 transition-colors"
 >
 <ArrowLeft className="h-5 w-5" />
 </button>
 <div className="flex items-center space-x-2">
 <div className="bg-card border border-border /20 rounded-full p-2">
 <Users className="h-6 w-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold">Dashboard Partage</h1>
 <p className="text-purple-100">Connecté en tant que <span className="font-semibold">{user?.email}</span></p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
 <p className="text-red-700">{error}</p>
 </div>
 )}

 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="bg-card border border-border rounded-xl shadow-md p-6 animate-pulse">
 <div className="flex items-center space-x-2 mb-4">
 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
 <div className="flex-1">
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 </div>
 <div className="space-y-2">
 <div className="h-12 bg-gray-200 rounded-lg"></div>
 <div className="h-12 bg-gray-200 rounded-lg"></div>
 <div className="h-12 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 ))}
 </div>
 ) : partnerships.length === 0 ? (
 <div className="bg-card border border-border rounded-xl shadow-md p-8 text-center">
 <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4">
 <Users className="h-8 w-8 text-foreground" />
 </div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 Aucun partenaire accepté
 </h3>
 <p className="text-muted-foreground mb-4">
 Invitez des partenaires pour commencer à partager vos données.
 </p>
 <button
 onClick={() => router.push('/training-partners')}
 className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
 >
 Gérer mes partenaires
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {partnerships.map((partnership) => {
 const partnerInfo = getPartnerInfo(partnership)
 const partnerId = partnerInfo.id
 const partnerName = partnerInfo.displayName

 return (
 <motion.div
 key={partnership.id}
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="bg-card border border-border rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
 >
 <div className="flex items-center space-x-2 mb-4">
 <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
 {partnerName.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-foreground">{partnerName}</h3>
 <p className="text-sm text-gray-600">Partenaire depuis {new Date(partnership.created_at || Date.now()).toLocaleDateString('fr-FR')}</p>
 </div>
 </div>
 
 {/* Indicateur de partage */}
 <div className="mb-4 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
 <div className="flex items-center space-x-2 mb-2">
 <div className="w-2 h-2 bg-secondary rounded-full"></div>
 <span className="text-sm font-medium text-blue-800">Consulter les données de {partnerName}</span>
 </div>
 <p className="text-xs text-blue-700">Cliquez sur les sections ci-dessous pour accéder aux données partagées</p>
 </div>

 <div className="space-y-2">
 {/* Workouts */}
 <button
 onClick={() => router.push('/calendar')}
 className="w-full flex items-center justify-between p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
 >
 <div className="flex items-center space-x-2">
 <div className="bg-primary rounded-lg p-2">
 <Calendar className="h-6 w-6 text-white" />
 </div>
 <span className="font-medium text-foreground">Entraînements de {partnerName}</span>
 </div>
 <span className="text-orange-800 text-sm">Voir dans calendrier</span>
 </button>

 {/* Nutrition */}
 <button
 onClick={() => router.push(`/shared/nutrition/${partnerId}`)}
 className="w-full flex items-center justify-between p-2 bg-green-50 hover:bg-success/10 rounded-lg transition-colors"
 >
 <div className="flex items-center space-x-2">
 <div className="bg-green-500 rounded-lg p-2">
 <Apple className="h-6 w-6 text-white" />
 </div>
 <span className="font-medium text-foreground">Nutrition de {partnerName}</span>
 </div>
 <span className="text-green-600 text-sm">Disponible</span>
 </button>

 {/* Progress */}
 <button
 onClick={() => router.push(`/shared/progress/${partnerId}`)}
 className="w-full flex items-center justify-between p-2 bg-blue-50 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 disabled
 >
 <div className="flex items-center space-x-2">
 <div className="bg-secondary rounded-lg p-2">
 <TrendingUp className="h-6 w-6 text-white" />
 </div>
 <span className="font-medium text-foreground">Progrès de {partnerName}</span>
 </div>
 <span className="text-secondary text-sm">Bientôt</span>
 </button>
 </div>

 {/* Section de partage mutuel */}
 <div className="mt-4 pt-4 border-t border-border">
 <div className="flex items-center space-x-2 mb-2">
 <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
 <span className="text-sm font-medium text-amber-800">Vos données partagées avec {partnerName}</span>
 </div>
 
 <div className="grid grid-cols-3 gap-2 text-xs mb-2">
 <div className="bg-orange-50 p-2 rounded text-center">
 <div className="text-orange-800 font-medium">Entraînements</div>
 <div className="text-orange-800">Activé</div>
 </div>
 <div className="bg-green-50 p-2 rounded text-center">
 <div className="text-green-600 font-medium">Nutrition</div>
 <div className="text-safe-success">Activé</div>
 </div>
 <div className="bg-muted p-2 rounded text-center">
 <div className="text-muted-foreground font-medium">Progrès</div>
 <div className="text-gray-600">Désactivé</div>
 </div>
 </div>
 
 <button
 onClick={() => router.push(`/training-partners/${partnership.id}/settings`)}
 className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-muted hover:bg-muted rounded-lg text-sm font-medium text-foreground hover:text-foreground transition-colors"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 <span>Modifier les paramètres</span>
 </button>
 </div>
 </motion.div>
 )
})}
 </div>
 )}

 {/* Aide */}
 <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
 <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Comment ça marche ?</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
 <div>
 <h4 className="font-medium mb-2">🏃‍♂️ Entraînements</h4>
 <p>Voir les séances partagées directement dans votre calendrier avec le préfixe 👥.</p>
 </div>
 <div>
 <h4 className="font-medium mb-2">🍎 Nutrition</h4>
 <p>Consulter le journal alimentaire détaillé de vos partenaires jour par jour.</p>
 </div>
 <div>
 <h4 className="font-medium mb-2">📈 Progrès</h4>
 <p>Suivre l'évolution des performances et objectifs de vos partenaires (bientôt).</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}