"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PerformanceAddForm } from '@/components/exercises/PerformanceAddForm'
import { createClient } from '@/utils/supabase/client'
import { ExerciseType } from '@/types/exercise'
import { StrengthMetrics, CardioMetrics } from '@/types/performance'
import { ArrowLeft, Dumbbell, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
// Note: Remplacé toast par console.log temporairement

interface ExerciseInfo {
  id: number
  name: string
  type: ExerciseType
  equipment: string
}

export default function AddPerformancePage() {
  const [exercise, setExercise] = useState<ExerciseInfo | null>(null)
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
          console.error('❌ Erreur récupération exercice:', error)
          throw new Error(error.message)
        }

        if (data) {
          // Transformer les données au nouveau format
          const exerciseData: ExerciseInfo = {
            id: data.id,
            name: data.name,
            type: data.exercise_type as ExerciseType, // 🚨 CORRECTION: exercise_type pas type
            equipment: data.equipment || 'Machine'
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

  const handleComplete = async (performanceData: StrengthMetrics | CardioMetrics, notes?: string) => {
    const supabase = createClient()
    
    try {
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      // Construire l'insert selon le type d'exercice
      const performanceInsert = {
        user_id: user.id, // 🚨 CORRECTION CRITIQUE RLS
        exercise_id: parseInt(id),
        performed_at: new Date().toISOString(),
        notes: notes || '',
        // Métriques selon le type
        ...(exercise?.type === 'Musculation' && {
          weight: (performanceData as StrengthMetrics).weight,
          reps: (performanceData as StrengthMetrics).reps,
          sets: (performanceData as StrengthMetrics).sets,
          rest_seconds: (performanceData as StrengthMetrics).rest_seconds,
        }),
        ...(exercise?.type === 'Cardio' && {
          duration_seconds: (performanceData as CardioMetrics).duration_seconds,
          distance: (performanceData as CardioMetrics).distance,
          distance_unit: (performanceData as CardioMetrics).distance_unit,
          heart_rate: (performanceData as CardioMetrics).heart_rate,
          calories: (performanceData as CardioMetrics).calories,
          stroke_rate: (performanceData as CardioMetrics).rowing?.stroke_rate,
          watts: (performanceData as CardioMetrics).rowing?.watts,
          incline: (performanceData as CardioMetrics).running?.incline,
          cadence: (performanceData as CardioMetrics).cycling?.cadence,
          resistance: (performanceData as CardioMetrics).cycling?.resistance,
        })
      }

      console.log('🚀 Données à insérer:', performanceInsert)
      
      const { data, error } = await supabase
        .from('performance_logs')
        .insert(performanceInsert)
        .select()

      console.log('📥 Réponse Supabase:', { data, error })

      if (error) {
        console.error('❌ Erreur Supabase détaillée:', error)
        throw error
      }

      console.log(`✅ Performance ajoutée à "${exercise?.name}" !`)
      router.push('/exercises')
    } catch (error) {
      console.error('💥 Erreur création performance:', error)
      console.error('📋 Détails erreur:', JSON.stringify(error, null, 2))
      console.error('❗ Erreur lors de l\'ajout de la performance')
    }
  }

  const handleBack = () => {
    router.push('/exercises')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-700">Chargement de l'exercice...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-500 mb-4 font-medium">Erreur: {error}</div>
          <Button onClick={() => router.push('/exercises')}>
            Retour aux exercices
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-700 mb-4">Exercice non trouvé</p>
          <Button onClick={() => router.push('/exercises')}>
            Retour aux exercices
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header - Design 2025 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {exercise.type === 'Musculation' ? (
                    <Dumbbell className="h-5 w-5 text-orange-800 dark:text-orange-300" />
                  ) : (
                    <Target className="h-5 w-5 text-orange-800 dark:text-orange-300" />
                  )}
                  Nouvelle performance
                </h1>
                <p className="text-sm text-gray-600">{exercise.name}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Input - Wrapper avec animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="py-8 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <PerformanceAddForm
            exercise={exercise}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        </div>
      </motion.div>
    </div>
  )
}