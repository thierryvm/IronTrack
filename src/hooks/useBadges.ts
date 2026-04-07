import { useState, useEffect} from'react'
import { createClient} from'@/utils/supabase/client'

export interface Badge {
 id: number
 name: string
 description: string
 icon: string
 color: string
 condition_type: string
 condition_value: number
}

export interface UserBadge extends Badge {
 earned_at: string
}

export function useBadges(enabled = true) {
 const [badges, setBadges] = useState<Badge[]>([])
 const [userBadges, setUserBadges] = useState<UserBadge[]>([])
 const [loading, setLoading] = useState(true)
 const [newBadgeEarned, setNewBadgeEarned] = useState<UserBadge | null>(null)

 const supabase = createClient()

 // Charger tous les badges disponibles
 const loadBadges = async () => {
 try {
 const { data, error} = await supabase
 .from('badges')
 .select('*')
 .order('condition_value', { ascending: true})
 
 if (error) {
 console.error('Erreur chargement badges:', error)
 console.error('Détails erreur:', JSON.stringify(error, null, 2))
} else {
 setBadges(data || [])
}
} catch (error) {
 console.error('Erreur badges:', error)
}
}

 // Charger les badges de l'utilisateur
 const loadUserBadges = async () => {
 try {
 const { data: { user}} = await supabase.auth.getUser()
 if (!user) return

 const { data, error} = await supabase
 .from('user_badges')
 .select(`
 *,
 badges (
 id,
 name,
 description,
 icon,
 color,
 condition_type,
 condition_value
 )
 `)
 .eq('user_id', user.id)
 .order('earned_at', { ascending: false})
 
 if (error) {
 console.error('Erreur chargement badges utilisateur:', error)
} else {
 // Transformer les données pour correspondre à l'interface UserBadge
 const transformedBadges = data?.map(item => ({
 ...item.badges,
 earned_at: item.earned_at
})) || []
 setUserBadges(transformedBadges)
}
} catch (error) {
 console.error('Erreur badges utilisateur:', error)
}
}

 // Vérifier et attribuer les badges
 const checkAndAwardBadges = async () => {
 try {
 const { data: { user}} = await supabase.auth.getUser()
 if (!user) return

 // Récupérer les stats actuelles
 const { data: workouts} = await supabase
 .from('workouts')
 .select('*')
 .eq('user_id', user.id)
 .in('status', ['Réalisé','Terminé'])

 if (!workouts) return

 const now = new Date()
 const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
 const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

 const totalSessions = workouts.length
 const weeklySessions = workouts.filter(w => {
 const workoutDate = new Date(w.scheduled_date)
 return workoutDate >= weekStart && workoutDate < weekEnd
}).length

 // Vérifier chaque badge
 for (const badge of badges) {
 const alreadyEarned = userBadges.some(ub => ub.name === badge.name)
 if (alreadyEarned) continue

 let shouldEarn = false

 switch (badge.condition_type) {
 case'total_sessions':
 shouldEarn = totalSessions >= badge.condition_value
 break
 case'weekly_sessions':
 shouldEarn = weeklySessions >= badge.condition_value
 break
 // Ajouter d'autres conditions selon les besoins
}

 if (shouldEarn) {
 // Attribuer le badge
 const { error} = await supabase
 .from('user_badges')
 .insert({
 user_id: user.id,
 badge_id: badge.id
})

 if (!error) {
 const newBadge: UserBadge = {
 ...badge,
 earned_at: new Date().toISOString()
}
 setUserBadges(prev => [newBadge, ...prev])
 setNewBadgeEarned(newBadge)
 
 // Faire disparaître la notification après 5 secondes
 setTimeout(() => setNewBadgeEarned(null), 5000)
}
}
}
} catch (error) {
 console.error('Erreur vérification badges:', error)
}
}

 // Calculer le prochain badge à atteindre
 const getNextBadge = () => {
 const earnedBadgeIds = userBadges.map(ub => ub.name)
 const nextBadge = badges.find(b => !earnedBadgeIds.includes(b.name))
 return nextBadge
}

 // Calculer le progrès vers le prochain badge
 const getBadgeProgress = (badge: Badge, stats: { totalSessions: number; weeklySessions: number}) => {
 switch (badge.condition_type) {
 case'total_sessions':
 return Math.min((stats.totalSessions / badge.condition_value) * 100, 100)
 case'weekly_sessions':
 return Math.min((stats.weeklySessions / badge.condition_value) * 100, 100)
 default:
 return 0
}
}

 useEffect(() => {
 if (!enabled) {
 setLoading(false)
 return
}

 const initializeBadges = async () => {
 setLoading(true)
 await loadBadges()
 await loadUserBadges()
 setLoading(false)
}

 initializeBadges()
}, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

 // Vérifier les badges quand les badges sont chargés
 useEffect(() => {
 if (!enabled) return
 if (badges.length > 0 && !loading) {
 checkAndAwardBadges()
}
}, [badges, enabled, loading]) // eslint-disable-line react-hooks/exhaustive-deps

 return {
 badges,
 userBadges,
 loading,
 newBadgeEarned,
 checkAndAwardBadges,
 getNextBadge,
 getBadgeProgress,
 loadUserBadges
}
}
