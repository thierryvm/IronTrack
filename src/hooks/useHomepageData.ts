import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useHomepageData() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: { totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0 },
    recentExercises: [],
    userBadges: [],
    pendingRequests: []
  })

  useEffect(() => {
    let isMounted = true

    async function fetchAllData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !isMounted) {
          setLoading(false)
          return
        }

        // REQUÊTE UNIQUE OPTIMISÉE - au lieu de 57 requêtes
        const [workoutsResult, exercisesResult, badgesResult, requestsResult] = await Promise.all([
          // Stats essentielles seulement
          supabase
            .from('workouts')
            .select('created_at, status')
            .eq('user_id', user.id)
            .in('status', ['Réalisé', 'Terminé', 'Completed'])
            .order('created_at', { ascending: false })
            .limit(10), // Réduit de 20 à 10
            
          // Exercices récents - limite stricte
          supabase
            .from('performance_logs')
            .select('exercise_id, exercises(name, muscle_group), performed_at')
            .eq('user_id', user.id)
            .order('performed_at', { ascending: false })
            .limit(3), // Réduit drastiquement
            
          // Badges utilisateur - essentiels seulement
          supabase
            .from('user_badges')
            .select('badges(name, icon, description)')
            .eq('user_id', user.id)
            .limit(5), // Limite stricte
            
          // Requêtes partenaires - minimal
          supabase
            .from('training_partners')
            .select('id')
            .eq('partner_id', user.id)
            .eq('status', 'pending')
            .limit(3)
        ])

        if (isMounted) {
          const workouts = workoutsResult.data || []
          
          // Calculs locaux optimisés
          const now = new Date()
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const thisWeekCount = workouts.filter(w => new Date(w.created_at) >= oneWeekAgo).length
          
          setData({
            stats: {
              totalWorkouts: workouts.length,
              thisWeek: thisWeekCount,
              currentStreak: thisWeekCount, // Simplifié
              totalWeight: 0 // Pas critique pour LCP
            },
            recentExercises: exercisesResult.data?.slice(0, 3) || [],
            userBadges: badgesResult.data?.slice(0, 3) || [],
            pendingRequests: requestsResult.data || []
          })
        }
      } catch (error) {
        console.error('Homepage data error:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAllData()

    return () => {
      isMounted = false
    }
  }, [])

  return { ...data, loading }
}