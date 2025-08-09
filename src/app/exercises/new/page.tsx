"use client"
import { useRouter } from 'next/navigation'
import { ExerciseCreationWizard } from '@/components/exercises/ExerciseCreation'
import { Exercise } from '@/types/exercise'
import { Performance } from '@/types/performance'
import { createClient } from '@/utils/supabase/client'
// Note: Remplacé toast par console.log temporairement

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

  const handleComplete = async (data: { exercise: Exercise; performance?: Performance }) => {
    const supabase = createClient()
    
    try {
      // 1. Créer l'exercice
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          name: data.exercise.name,
          exercise_type: data.exercise.exercise_type,
          muscle_group: data.exercise.muscle_group,
          equipment: data.exercise.equipment,
          difficulty: data.exercise.difficulty,
          instructions: data.exercise.instructions,
          is_template: false, // Exercice personnel
          is_public: false,   // Exercice privé par défaut
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // 2. Créer la performance si fournie
      if (data.performance && exerciseData) {
        const performanceInsert = {
          exercise_id: exerciseData.id,
          performed_at: new Date().toISOString(),
          notes: '', // Notes vides pour l'instant
          // Métriques selon le type
          ...(data.exercise.exercise_type === 'Musculation' && {
            weight: (data.performance.metrics as PerformanceMetrics).weight,
            reps: (data.performance.metrics as PerformanceMetrics).reps,
            sets: (data.performance.metrics as PerformanceMetrics).sets,
            rest_seconds: (data.performance.metrics as PerformanceMetrics).rest_seconds,
          }),
          ...(data.exercise.exercise_type === 'Cardio' && {
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

        const { error: performanceError } = await supabase
          .from('performance_logs')
          .insert(performanceInsert)

        if (performanceError) {
          console.warn('Erreur création performance:', performanceError)
          // Ne pas faire échouer la création si seule la performance échoue
        }
      }

      console.log(
        data.performance 
          ? `Exercice "${data.exercise.name}" créé avec première performance !`
          : `Exercice "${data.exercise.name}" créé avec succès !`
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