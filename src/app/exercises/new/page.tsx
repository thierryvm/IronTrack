'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { ExerciseCreationWizard } from '@/components/exercises/ExerciseCreation'
import { type Exercise } from '@/types/exercise'
import { type Performance } from '@/types/performance'
import { createClient } from '@/utils/supabase/client'

interface PerformanceMetrics {
  weight?: number
  reps?: number
  sets?: number
  rest_seconds?: number
  duration_seconds?: number
  distance?: number
  distance_unit?: string
  heart_rate?: number
  calories?: number
  rowing?: {
    stroke_rate?: number
    watts?: number
  }
  running?: {
    incline?: number
    speed?: number
  }
  cycling?: {
    cadence?: number
    resistance?: number
  }
}

interface ExerciseCreationPayload {
  exercise: Exercise
  performance?: Performance
}

async function resolveEquipmentId(equipmentName?: string) {
  const supabase = createClient()

  if (!equipmentName?.trim()) {
    return 1
  }

  const { data } = await supabase
    .from('equipment')
    .select('id')
    .eq('name', equipmentName)
    .maybeSingle()

  return data?.id ?? 1
}

function buildPerformanceInsert(
  payload: ExerciseCreationPayload['performance'],
  exerciseType: Exercise['exercise_type'],
) {
  if (!payload) {
    return null
  }

  const metrics = payload.metrics as PerformanceMetrics

  return {
    performed_at: new Date().toISOString(),
    notes: payload.notes ?? '',
    ...(exerciseType === 'Musculation'
      ? {
          weight: metrics.weight,
          reps: metrics.reps,
          sets: metrics.sets,
          rest_seconds: metrics.rest_seconds,
        }
      : {
          duration_seconds: metrics.duration_seconds,
          distance: metrics.distance,
          distance_unit: metrics.distance_unit,
          heart_rate: metrics.heart_rate,
          calories: metrics.calories,
          stroke_rate: metrics.rowing?.stroke_rate,
          watts: metrics.rowing?.watts,
          incline: metrics.running?.incline,
          speed: metrics.running?.speed,
          cadence: metrics.cycling?.cadence,
          resistance: metrics.cycling?.resistance,
        }),
  }
}

export default function NewExercisePage() {
  const router = useRouter()

  useEffect(() => {
    const verifySession = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth')
      }
    }

    void verifySession()
  }, [router])

  const handleClose = useCallback(() => {
    router.push('/exercises')
  }, [router])

  const handleComplete = useCallback(
    async ({ exercise, performance }: ExerciseCreationPayload) => {
      const supabase = createClient()

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        if (!user) {
          toast.error('Ta session a expiré. Reconnecte-toi pour créer un exercice.')
          router.push('/auth')
          return
        }

        const equipmentId = await resolveEquipmentId(exercise.equipment)

        const { data: createdExercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            user_id: user.id,
            name: exercise.name,
            exercise_type: exercise.exercise_type,
            muscle_group: exercise.muscle_group,
            equipment_id: equipmentId,
            difficulty: exercise.difficulty,
            description: exercise.instructions,
            image_url: exercise.image_url,
            is_template: false,
            is_public: false,
          })
          .select('id, name')
          .single()

        if (exerciseError || !createdExercise) {
          throw exerciseError ?? new Error("Impossible d'enregistrer l'exercice.")
        }

        const performanceInsert = buildPerformanceInsert(performance, exercise.exercise_type)

        if (performanceInsert) {
          const { error: performanceError } = await supabase.from('performance_logs').insert({
            exercise_id: createdExercise.id,
            ...performanceInsert,
          })

          if (performanceError) {
            throw new Error(
              "L'exercice a été créé, mais la première performance n'a pas pu être enregistrée.",
            )
          }
        }

        toast.success(
          performance
            ? `Exercice “${createdExercise.name}” créé avec sa première performance.`
            : `Exercice “${createdExercise.name}” créé avec succès.`,
        )

        router.push('/exercises')
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Une erreur inattendue a empêché la création de l'exercice."

        toast.error(message)
      }
    },
    [router],
  )

  return <ExerciseCreationWizard onClose={handleClose} onComplete={handleComplete} />
}
