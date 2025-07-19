"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PerformanceInput } from '@/components/exercises/ExerciseWizard/steps/PerformanceInput'
import { createClient } from '@/utils/supabase/client'
import { CustomExercise } from '@/types/exercise-wizard'
import { ArrowLeft } from 'lucide-react'

export default function AddPerformancePage() {
  const [exercise, setExercise] = useState<CustomExercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          throw new Error(error.message)
        }

        if (data) {
          // Transformer les données en format CustomExercise
          const exerciseData: CustomExercise = {
            name: data.name,
            exercise_type: data.exercise_type as 'Musculation' | 'Cardio',
            muscle_group: data.muscle_group,
            equipment_id: data.equipment_id,
            difficulty: data.difficulty,
            sets: data.sets,
            duration_minutes: data.duration_minutes,
            duration_seconds: data.duration_seconds,
            distance: data.distance,
            distance_unit: data.distance_unit,
            speed: data.speed,
            speed_unit: data.speed_unit,
            calories: data.calories
          }
          
          setExercise(exerciseData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [id])

  const handleComplete = async (finalData: { exercise: any; performance?: any }) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Ajouter la performance
      if (finalData.performance) {
        const performance = finalData.performance
        
        // Préparer les données de performance
        const performanceData: Record<string, unknown> = {
          user_id: user.id,
          exercise_id: id,
          performed_at: new Date().toISOString()
        }

        // Ajouter les champs spécifiques selon le type
        if (exercise?.exercise_type === 'Musculation') {
          if (performance.weight) performanceData.weight = performance.weight
          if (performance.reps) performanceData.reps = performance.reps
          if (performance.sets) performanceData.set_number = performance.sets
        } else if (exercise?.exercise_type === 'Cardio') {
          if (performance.duration) performanceData.duration = performance.duration * 60 // convertir en secondes
          if (performance.distance) performanceData.distance = performance.distance
          if (performance.speed) performanceData.speed = performance.speed
          if (performance.calories) performanceData.calories = performance.calories
        }

        if (performance.notes) performanceData.notes = performance.notes

        const { error } = await supabase
          .from('performance_logs')
          .insert(performanceData)

        if (error) {
          throw new Error(error.message)
        }
      }

      // Retourner directement à la page de détails sans modal
      router.push(`/exercises/${id}`)
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la performance:', err)
      throw err
    }
  }

  const handleBack = () => {
    router.push(`/exercises/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l&apos;exercice...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Erreur: {error}</div>
          <button
            onClick={() => router.push('/exercises')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Exercice non trouvé</p>
          <button
            onClick={() => router.push('/exercises')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Ajouter une performance - {exercise.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Performance Input */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <PerformanceInput
            exercise={exercise}
            onComplete={handleComplete}
            onBack={handleBack}
            onCancel={handleBack}
          />
        </div>
      </div>
    </div>
  )
}