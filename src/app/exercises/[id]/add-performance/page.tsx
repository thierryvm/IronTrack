'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Dumbbell, Target } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { PerformanceAddForm } from '@/components/exercises/PerformanceAddForm'
import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ExerciseType } from '@/types/exercise'
import { CardioMetrics, StrengthMetrics } from '@/types/performance'
import { createClient } from '@/utils/supabase/client'

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
        setError(null)

        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('exercises')
          .select('id, name, exercise_type, equipment')
          .eq('id', id)
          .single()

        if (fetchError || !data) {
          throw fetchError || new Error('Exercice introuvable.')
        }

        setExercise({
          id: data.id,
          name: data.name,
          type: data.exercise_type as ExerciseType,
          equipment: data.equipment || 'Machine',
        })
      } catch (caughtError) {
        setExercise(null)
        setError(caughtError instanceof Error ? caughtError.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    void fetchExercise()
  }, [id])

  const handleComplete = async (performanceData: StrengthMetrics | CardioMetrics, notes?: string) => {
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non connecté')
      }

      const payload = {
        user_id: user.id,
        exercise_id: Number.parseInt(id, 10),
        performed_at: new Date().toISOString(),
        notes: notes || '',
        ...(exercise?.type === 'Musculation' && {
          weight: (performanceData as StrengthMetrics).weight,
          reps: (performanceData as StrengthMetrics).reps,
          sets: (performanceData as StrengthMetrics).sets,
          rest_seconds: (performanceData as StrengthMetrics).rest_seconds,
          rpe: (performanceData as StrengthMetrics).rpe,
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
        }),
      }

      const { error: insertError } = await supabase.from('performance_logs').insert(payload)

      if (insertError) {
        throw insertError
      }

      router.push('/exercises')
    } catch {
      setError("Impossible d'enregistrer cette performance pour le moment.")
    }
  }

  const handleBack = () => {
    router.push('/exercises')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="flex min-h-[280px] items-center justify-center rounded-[30px] border-border bg-card/88 p-8 shadow-card">
            <div className="text-center">
              <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-safe-muted">Chargement de l’exercice...</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  if (error || !exercise) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <ActionButton type="button" tone="secondary" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Retour aux exercices</span>
          </ActionButton>

          <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
            <AlertDescription>{error || 'Exercice non trouvé.'}</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const ExerciseIcon = exercise.type === 'Musculation' ? Dumbbell : Target

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <ActionButton type="button" tone="secondary" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Retour aux exercices</span>
        </ActionButton>

        <Card className="rounded-[30px] border-border bg-card/88 p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ExerciseIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Nouvelle performance
                </h1>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Saisie rapide, lisible, sans ancien écran intermédiaire inutile.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-[22px] border border-border/70 bg-background/50 p-4 sm:min-w-[230px]">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  {exercise.type}
                </Badge>
                <Badge variant="outline" className="border-border bg-background/65 text-safe-muted">
                  {exercise.equipment}
                </Badge>
              </div>
              <p className="text-lg font-semibold text-foreground">{exercise.name}</p>
            </div>
          </div>
        </Card>

        <PerformanceAddForm exercise={exercise} onComplete={handleComplete} onBack={handleBack} />
      </div>
    </main>
  )
}
