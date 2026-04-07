'use client'

import { useParams} from'next/navigation'
import { useEffect, useState} from'react'
import { createClient} from'@/utils/supabase/client'
import Link from'next/link'
import { ArrowLeft, Edit, Plus, BarChart3} from'lucide-react'

interface Exercise {
 id: string
 name: string
 description?: string
 muscle_groups?: string[]
 equipment?: string
 difficulty?: string
 type?: string
}

interface PerformanceLog {
 id: string
 weight?: number
 reps?: number
 sets?: number
 duration?: number
 distance?: number
 date: string
}

export default function ExerciseDetailPage() {
 const params = useParams()
 // const router = useRouter() // Non utilisé actuellement
 const exerciseId = params.id as string
 
 const [exercise, setExercise] = useState<Exercise | null>(null)
 const [performances, setPerformances] = useState<PerformanceLog[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 loadExerciseData()
}, [exerciseId])

 const loadExerciseData = async () => {
 try {
 const supabase = createClient()
 
 // Charger l'exercice
 const { data: exerciseData, error: exerciseError} = await supabase
 .from('exercises')
 .select('*')
 .eq('id', exerciseId)
 .single()
 
 if (exerciseError) {
 throw new Error(`Exercice non trouvé: ${exerciseError.message}`)
}
 
 setExercise(exerciseData)
 
 // Charger les performances récentes (correction colonne created_at)
 const { data: performanceData, error: performanceError} = await supabase
 .from('performance_logs')
 .select('*')
 .eq('exercise_id', exerciseId)
 .order('date', { ascending: false})
 .limit(10)
 
 if (performanceError) {
 console.warn('Erreur chargement performances:', performanceError)
} else {
 setPerformances(performanceData || [])
}
 
} catch (err) {
 setError(err instanceof Error ? err.message :'Erreur inconnue')
} finally {
 setLoading(false)
}
}

 if (loading) {
 return (
 <div className="min-h-screen bg-background">
 <div className="max-w-4xl mx-auto px-4 py-8">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
 <div className="h-32 bg-gray-300 rounded mb-4"></div>
 <div className="h-64 bg-gray-300 rounded"></div>
 </div>
 </div>
 </div>
 )
}

 if (error || !exercise) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-foreground mb-4">
 Exercice non trouvé
 </h1>
 <p className="text-muted-foreground mb-6">
 {error ||"L'exercice demandé n'existe pas."}
 </p>
 <Link
 href="/exercises"
 className="inline-flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Retour aux exercices
 </Link>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-background">
 <div className="max-w-4xl mx-auto px-4 py-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <Link
 href="/exercises"
 className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Retour aux exercices
 </Link>
 
 <div className="flex items-center gap-2">
 <Link
 href={`/exercises/${exerciseId}/edit-exercise`}
 className="inline-flex items-center gap-2 px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted transition-colors"
 >
 <Edit className="w-4 h-4" />
 Modifier
 </Link>
 <Link
 href={`/exercises/${exerciseId}/add-performance`}
 className="inline-flex items-center gap-2 px-4 py-2 text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Ajouter performance
 </Link>
 </div>
 </div>

 {/* Exercise Info */}
 <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-6">
 <h1 className="text-3xl font-bold text-foreground mb-4">
 {exercise.name}
 </h1>
 
 {exercise.description && (
 <p className="text-muted-foreground mb-4">
 {exercise.description}
 </p>
 )}
 
 <div className="flex flex-wrap gap-4 text-sm">
 {exercise.muscle_groups && Array.isArray(exercise.muscle_groups) && (
 <div>
 <span className="font-medium text-foreground">Muscles : </span>
 <span className="text-muted-foreground">
 {exercise.muscle_groups.join(',')}
 </span>
 </div>
 )}
 {exercise.equipment && (
 <div>
 <span className="font-medium text-foreground">Équipement : </span>
 <span className="text-muted-foreground">{exercise.equipment}</span>
 </div>
 )}
 {exercise.difficulty && (
 <div>
 <span className="font-medium text-foreground">Difficulté : </span>
 <span className="text-muted-foreground">{exercise.difficulty}</span>
 </div>
 )}
 </div>
 </div>

 {/* Recent Performances */}
 <div className="bg-card border border-border rounded-lg shadow-sm p-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold text-foreground">
 Performances récentes
 </h2>
 <Link
 href={`/progress?exercise=${exerciseId}`}
 className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
 >
 <BarChart3 className="w-4 h-4" />
 Voir progression
 </Link>
 </div>
 
 {performances.length > 0 ? (
 <div className="space-y-2">
 {performances.map((performance) => (
 <div
 key={performance.id}
 className="flex items-center justify-between p-2 bg-muted rounded-lg"
 >
 <div className="flex items-center gap-4">
 {performance.weight && (
 <span className="text-sm font-medium text-foreground">
 {performance.weight}kg
 </span>
 )}
 {performance.reps && (
 <span className="text-sm text-muted-foreground">
 {performance.reps} reps
 </span>
 )}
 {performance.sets && (
 <span className="text-sm text-muted-foreground">
 {performance.sets} sets
 </span>
 )}
 {performance.duration && (
 <span className="text-sm text-muted-foreground">
 {performance.duration}s
 </span>
 )}
 {performance.distance && (
 <span className="text-sm text-muted-foreground">
 {performance.distance}m
 </span>
 )}
 </div>
 <span className="text-xs text-safe-muted">
 {new Date(performance.date).toLocaleDateString('fr-FR', {
 day:'numeric',
 month:'short',
 year:'numeric'
})}
 </span>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <p className="text-muted-foreground mb-4">
 Aucune performance enregistrée pour cet exercice
 </p>
 <Link
 href={`/exercises/${exerciseId}/add-performance`}
 className="inline-flex items-center gap-2 px-4 py-2 text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Ajouter la première performance
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}
