"use client"
import { useRouter} from'next/navigation'
import toast from'react-hot-toast'
import { ExerciseCreationWizard} from'@/components/exercises/ExerciseCreation'
import { Exercise} from'@/types/exercise'
import { Performance} from'@/types/performance'
import { createClient} from'@/utils/supabase/client'

interface PerformanceMetrics {
 // Musculation
 weight?: number
 reps?: number
 sets?: number
 rest_seconds?: number
 
 // Cardio
 duration_seconds?: number
 distance?: number
 distance_unit?: string
 heart_rate?: number
 calories?: number
 
 // Spécialisé rameur
 rowing?: {
 stroke_rate?: number
 watts?: number
}
 
 // Spécialisé course
 running?: {
 incline?: number
}
 
 // Spécialisé vélo
 cycling?: {
 cadence?: number
 resistance?: number
}
}

export default function NewExercisePage() {
 const router = useRouter()
 
 const handleClose = () => {
 router.push('/exercises')
}

 const handleComplete = async (data: { exercise: Exercise; performance?: Performance}) => {
 const supabase = createClient()
 
 try {
 // 0. Mapper le nom d'équipement vers l'ID
 let equipment_id = 1 // Défaut
 if (data.exercise.equipment) {
 const { data: equipmentData} = await supabase
 .from('equipment')
 .select('id')
 .eq('name', data.exercise.equipment)
 .single()
 
 if (equipmentData) {
 equipment_id = equipmentData.id
}
}
 
 // 1. Créer l'exercice
 const { data: exerciseData, error: exerciseError} = await supabase
 .from('exercises')
 .insert({
 user_id: (await supabase.auth.getUser()).data.user?.id,
 name: data.exercise.name,
 exercise_type: data.exercise.exercise_type,
 muscle_group: data.exercise.muscle_group, // Texte, pas ID
 equipment_id: equipment_id,
 difficulty: data.exercise.difficulty,
 description: data.exercise.instructions,
 image_url: data.exercise.image_url, // âœ… AJOUT de l'image_url
 is_template: false,
 is_public: false
})
 .select()
 .single()

 if (exerciseError) throw exerciseError

 // 2. Créer la performance si fournie
 if (data.performance && exerciseData) {
 const performanceInsert = {
 exercise_id: exerciseData.id,
 performed_at: new Date().toISOString(),
 notes:'', // Notes vides pour l'instant
 // Métriques selon le type
 ...(data.exercise.exercise_type ==='Musculation' && {
 weight: (data.performance.metrics as PerformanceMetrics).weight,
 reps: (data.performance.metrics as PerformanceMetrics).reps,
 sets: (data.performance.metrics as PerformanceMetrics).sets,
 rest_seconds: (data.performance.metrics as PerformanceMetrics).rest_seconds,
}),
 ...(data.exercise.exercise_type ==='Cardio' && {
 duration_seconds: (data.performance.metrics as PerformanceMetrics).duration_seconds,
 distance: (data.performance.metrics as PerformanceMetrics).distance,
 distance_unit: (data.performance.metrics as PerformanceMetrics).distance_unit,
 heart_rate: (data.performance.metrics as PerformanceMetrics).heart_rate,
 calories: (data.performance.metrics as PerformanceMetrics).calories,
 stroke_rate: (data.performance.metrics as PerformanceMetrics).rowing?.stroke_rate,
 watts: (data.performance.metrics as PerformanceMetrics).rowing?.watts,
 incline: (data.performance.metrics as PerformanceMetrics).running?.incline,
 cadence: (data.performance.metrics as PerformanceMetrics).cycling?.cadence,
 resistance: (data.performance.metrics as PerformanceMetrics).cycling?.resistance,
})
}

 const { error: performanceError} = await supabase
 .from('performance_logs')
 .insert(performanceInsert)

 if (performanceError) {
 console.warn('Erreur création performance:', performanceError)
 // Ne pas faire échouer la création si seule la performance échoue
}
}

 toast.success(
 data.performance 
 ? `Exercice"${data.exercise.name}" créé avec première performance !`
 : `Exercice"${data.exercise.name}" créé avec succès !`
 )
 
 router.push('/exercises')
} catch (error) {
 console.error('Erreur création exercice:', error)
 console.error('Erreur lors de la création de l\'exercice')
}
}

 return (
 <ExerciseCreationWizard 
 onClose={handleClose}
 onComplete={handleComplete}
 />
 )
}
