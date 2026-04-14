import { useState, useEffect} from'react'
import { createClient} from'@/utils/supabase/client'

export interface PersonalRecord {
 exercise_name: string
 max_weight: number
 max_reps: number
 record_date: string
}

export interface ProgressionStats {
 initial_weight: number | null
 current_weight: number | null
 weight_gain: number | null
 total_workouts: number
 total_performance_logs: number
}

export function useProgressionStats() {
 const [progressionStats, setProgressionStats] = useState<ProgressionStats | null>(null)
 const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 const supabase = createClient()

 const loadProgressionStats = async () => {
 try {
 const { data: { user}} = await supabase.auth.getUser()
 if (!user) return

 // Récupérer les statistiques de progression
 const { data: statsData, error: statsError} = await supabase
 .rpc('get_progression_stats', { user_uuid: user.id})

 if (statsError) {
 console.error('Erreur récupération stats progression:', statsError)
 setError('Erreur lors de la récupération des statistiques')
 return
}

 if (statsData && statsData.length > 0) {
 setProgressionStats(statsData[0])
}

 // Récupérer les records personnels
 const { data: recordsData, error: recordsError} = await supabase
 .rpc('get_personal_records', { user_uuid: user.id})

 if (recordsError) {
 console.error('Erreur récupération records personnels:', recordsError)
 setError('Erreur lors de la récupération des records')
 return
}

 if (recordsData) {
 setPersonalRecords(recordsData)
}

} catch (err) {
 console.error('Erreur progression stats:', err)
 setError('Erreur lors de la récupération des données')
} finally {
 setLoading(false)
}
}

 const updateInitialWeight = async (weight: number) => {
 try {
 const { data: { user}} = await supabase.auth.getUser()
 if (!user) return false

 const { error} = await supabase
 .from('profiles')
 .update({ initial_weight: weight})
 .eq('id', user.id)

 if (error) {
 console.error('Erreur mise à jour poids initial:', error)
 return false
}

 // Recharger les stats
 await loadProgressionStats()
 return true
} catch (err) {
 console.error('Erreur update initial weight:', err)
 return false
}
}

 useEffect(() => {
 loadProgressionStats()
}, []) // eslint-disable-line react-hooks/exhaustive-deps

 return {
 progressionStats,
 personalRecords,
 loading,
 error,
 updateInitialWeight,
 reload: loadProgressionStats
}
}