'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Clock3, Edit3, Plus, Trophy, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  type ExercisePerformanceSnapshot,
  getDifficultyMeta,
  getExerciseVisualMeta,
  summarizeExercisePerformance,
} from '@/components/exercises/exercise-display'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

interface CardioMetrics {
  distance?: number
  running?: { speed?: number; incline?: number }
  rowing?: { stroke_rate?: number; watts?: number }
  cycling?: { cadence?: number; resistance?: number }
}

interface StrengthMetrics {
  weight?: number
  reps?: number
  sets?: number
}

interface Exercise {
  id: number
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé' | string
  description?: string
  instructions?: string
  image_url?: string
  default_cardio_metrics?: CardioMetrics | null
  default_strength_metrics?: StrengthMetrics | null
}

interface Performance extends ExercisePerformanceSnapshot {
  id: number
  notes?: string
  calories?: number
}

interface ExerciseDetailsModalProps {
  exerciseId: string
  isOpen: boolean
  onClose: () => void
}

function getCompletionScore(exercise: Exercise) {
  let score = 60
  if (exercise.description) score += 20
  if (exercise.instructions) score += 15
  if (exercise.image_url) score += 5
  return score
}

function getCompletionMeta(score: number) {
  if (score >= 95) return 'border-emerald-500/20 bg-emerald-500/10 text-safe-success'
  if (score >= 80) return 'border-primary/20 bg-primary/10 text-primary'
  if (score >= 60) return 'border-amber-500/20 bg-amber-500/10 text-safe-warning'
  return 'border-destructive/20 bg-destructive/10 text-safe-error'
}

function buildDefaultMetricRows(exercise: Exercise) {
  if (exercise.exercise_type === 'Cardio' && exercise.default_cardio_metrics) {
    const metrics = exercise.default_cardio_metrics
    return [
      metrics.distance
        ? {
            label: 'Distance de départ',
            value:
              metrics.distance >= 1000
                ? `${(metrics.distance / 1000).toFixed(1)} km`
                : `${metrics.distance} m`,
          }
        : null,
      metrics.running?.speed ? { label: 'Vitesse cible', value: `${metrics.running.speed} km/h` } : null,
      metrics.running?.incline ? { label: 'Inclinaison', value: `${metrics.running.incline}%` } : null,
      metrics.rowing?.stroke_rate
        ? { label: 'Cadence rameur', value: `${metrics.rowing.stroke_rate} spm` }
        : null,
      metrics.rowing?.watts ? { label: 'Puissance rameur', value: `${metrics.rowing.watts} W` } : null,
      metrics.cycling?.cadence ? { label: 'Cadence vélo', value: `${metrics.cycling.cadence} rpm` } : null,
      metrics.cycling?.resistance ? { label: 'Résistance vélo', value: `${metrics.cycling.resistance}` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>
  }

  if (exercise.exercise_type === 'Musculation' && exercise.default_strength_metrics) {
    const metrics = exercise.default_strength_metrics
    return [
      metrics.weight ? { label: 'Charge de départ', value: `${metrics.weight} kg` } : null,
      metrics.reps ? { label: 'Répétitions', value: `${metrics.reps}` } : null,
      metrics.sets ? { label: 'Séries', value: `${metrics.sets}` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>
  }

  return []
}

export function ExerciseDetailsModal({
  exerciseId,
  isOpen,
  onClose,
}: ExerciseDetailsModalProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [performances, setPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [perfToDelete, setPerfToDelete] = useState<Performance | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const loadExerciseData = useCallback(async () => {
    try {
      setLoading(true)
      setErrorMessage(null)

      const supabase = createClient()

      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select(
          'id, name, exercise_type, muscle_group, equipment, difficulty, description, instructions, image_url, default_cardio_metrics, default_strength_metrics',
        )
        .eq('id', exerciseId)
        .single()

      if (exerciseError || !exerciseData) {
        throw exerciseError || new Error('Impossible de charger cet exercice.')
      }

      const { data: performanceData, error: performanceError } = await supabase
        .from('performance_logs')
        .select(
          'id, performed_at, weight, reps, sets, duration_seconds, distance, calories, speed, heart_rate, stroke_rate, watts, incline, cadence, resistance, notes',
        )
        .eq('exercise_id', exerciseId)
        .order('performed_at', { ascending: false })

      if (performanceError) {
        throw performanceError
      }

      setExercise(exerciseData)
      setPerformances((performanceData ?? []) as Performance[])
    } catch {
      setExercise(null)
      setPerformances([])
      setErrorMessage('Impossible de charger la fiche exercice pour le moment.')
    } finally {
      setLoading(false)
    }
  }, [exerciseId])

  useEffect(() => {
    if (isOpen && exerciseId) {
      void loadExerciseData()
    }
  }, [exerciseId, isOpen, loadExerciseData])

  const handleDeletePerformance = async () => {
    if (!perfToDelete) {
      return
    }

    try {
      setIsDeleting(true)
      const supabase = createClient()
      const { error } = await supabase.from('performance_logs').delete().eq('id', perfToDelete.id)

      if (error) {
        throw error
      }

      await loadExerciseData()
      setDeleteModalOpen(false)
      setPerfToDelete(null)
    } catch {
      setErrorMessage('Suppression impossible pour le moment.')
    } finally {
      setIsDeleting(false)
    }
  }

  const difficultyMeta = useMemo(() => getDifficultyMeta(exercise?.difficulty), [exercise?.difficulty])
  const visualMeta = useMemo(
    () => getExerciseVisualMeta(exercise?.exercise_type ?? 'Musculation'),
    [exercise?.exercise_type],
  )
  const completionScore = useMemo(() => (exercise ? getCompletionScore(exercise) : 0), [exercise])
  const latestPerformance = performances[0]
  const latestPerformanceSummary = useMemo(
    () =>
      summarizeExercisePerformance({
        exerciseType: exercise?.exercise_type ?? 'Musculation',
        exerciseName: exercise?.name,
        equipment: exercise?.equipment,
        performance: latestPerformance,
      }),
    [exercise?.equipment, exercise?.exercise_type, exercise?.name, latestPerformance],
  )
  const defaultMetricRows = useMemo(() => (exercise ? buildDefaultMetricRows(exercise) : []), [exercise])
  const VisualIcon = visualMeta.icon

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] max-w-[min(720px,calc(100vw-1rem))] gap-0 overflow-hidden rounded-[30px] border-border bg-card p-0 shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{exercise ? `Fiche exercice ${exercise.name}` : 'Fiche exercice'}</DialogTitle>
          <DialogDescription>
            Consultation des informations détaillées et de l’historique des performances.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-b border-border/70 bg-card/95 px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            className="rounded-full border-border bg-background/60"
            aria-label="Retour à la liste des exercices"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" aria-hidden="true" />
          </Button>

          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Fiche exercice
            </p>
            <h2 className="text-base font-semibold text-foreground">
              {exercise?.name || 'Détails de l’exercice'}
            </h2>
          </div>

          <div className="size-10" aria-hidden="true" />
        </div>

        <div className="max-h-[calc(92vh-73px)] overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : errorMessage ? (
            <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : exercise ? (
            <div className="space-y-4">
              <Card className="rounded-[26px] border-border bg-card p-5">
                <div className="flex flex-col gap-5">
                  <div
                    className={cn(
                      'relative size-[104px] shrink-0 overflow-hidden rounded-[24px] border border-border/70 bg-background',
                      `bg-gradient-to-br ${visualMeta.backdropClass}`,
                    )}
                  >
                    {exercise.image_url ? (
                      <>
                        <Image
                          src={exercise.image_url}
                          alt={`Illustration de ${exercise.name}`}
                          fill
                          sizes="104px"
                          className="object-cover object-center"
                        />
                        <div
                          aria-hidden="true"
                          className={cn('absolute inset-0 bg-gradient-to-br', visualMeta.imageTintClass)}
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <VisualIcon className={cn('h-11 w-11', visualMeta.accentClass)} aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={visualMeta.badgeClass}>
                        {exercise.exercise_type}
                      </Badge>
                      <Badge variant="outline" className={difficultyMeta.className}>
                        {difficultyMeta.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('border-border bg-background/65', getCompletionMeta(completionScore))}
                      >
                        Profil {completionScore}%
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{exercise.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {exercise.description ||
                          'Ajoute une description claire pour rendre la bibliothèque plus facile à scanner.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-border bg-background/65 text-foreground">
                        {exercise.muscle_group || 'Groupe non défini'}
                      </Badge>
                      <Badge variant="outline" className="border-border bg-background/65 text-safe-muted">
                        {exercise.equipment || 'Équipement libre'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="rounded-[26px] border-border bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
                    Actions rapides
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-foreground">Enrichis cette fiche sans friction</h4>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Le CTA principal sert à ajouter une performance. L’édition reste disponible juste dessous.
                  </p>

                  <div className="mt-5 space-y-3">
                    <ActionButton
                      type="button"
                      tone="primary"
                      onClick={() => {
                        onClose()
                        router.push(`/exercises/${exerciseId}/add-performance`)
                      }}
                      className="w-full justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Ajouter une performance</span>
                    </ActionButton>

                    <ActionButton
                      type="button"
                      tone="secondary"
                      onClick={() => {
                        onClose()
                        router.push(`/exercises/${exerciseId}/edit-exercise`)
                      }}
                      className="w-full justify-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                      <span>Modifier l’exercice</span>
                    </ActionButton>
                  </div>
                </Card>

                <Card className="rounded-[26px] border-border bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
                    Dernier repère
                  </p>
                  <div className="mt-4 rounded-[20px] border border-border/70 bg-background/55 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-foreground">
                          {latestPerformanceSummary.headline}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {latestPerformanceSummary.supporting}
                        </p>
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-safe-muted">
                          {latestPerformanceSummary.dateLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-safe-muted">Type</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{exercise.exercise_type}</p>
                    </div>
                    <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-safe-muted">Niveau</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{difficultyMeta.label}</p>
                    </div>
                    <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-safe-muted">Historique</p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {performances.length} log{performances.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="rounded-[24px] border-border bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">Description</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {exercise.description ||
                      'Description absente pour l’instant. Ajoute un repère simple pour reconnaître vite cet exercice.'}
                  </p>
                </Card>

                <Card className="rounded-[24px] border-border bg-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">Exécution</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {exercise.instructions ||
                      'Instructions non renseignées. Une séquence courte et concrète améliorera beaucoup la qualité d’usage.'}
                  </p>
                </Card>
              </div>

              {defaultMetricRows.length > 0 && performances.length === 0 ? (
                <Card className="rounded-[24px] border-primary/15 bg-card p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Point de départ
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-foreground">
                        Valeurs recommandées pour la première séance
                      </h4>
                    </div>
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      Départ guidé
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {defaultMetricRows.map((row) => (
                      <div
                        key={row.label}
                        className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-safe-muted">
                          {row.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}

              <Card className="rounded-[26px] border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
                      Historique
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-foreground">
                      Performances enregistrées
                    </h4>
                  </div>
                  <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                    {performances.length}
                  </Badge>
                </div>

                {performances.length === 0 ? (
                  <div className="mt-5 rounded-[20px] border border-dashed border-border/80 bg-background/45 px-5 py-8 text-center">
                    <Trophy className="mx-auto h-9 w-9 text-safe-muted" aria-hidden="true" />
                    <p className="mt-3 text-base font-medium text-foreground">Aucune performance enregistrée</p>
                    <p className="mt-2 text-sm text-safe-muted">
                      Commence par un premier log pour transformer cette fiche en outil de progression.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {performances.map((performance) => {
                      const performanceSummary = summarizeExercisePerformance({
                        exerciseType: exercise.exercise_type,
                        exerciseName: exercise.name,
                        equipment: exercise.equipment,
                        performance,
                      })

                      return (
                        <div
                          key={performance.id}
                          className="rounded-[20px] border border-border/70 bg-card/70 px-4 py-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-semibold text-foreground">
                                  {performanceSummary.headline}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs text-safe-muted">
                                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                  {performanceSummary.dateLabel}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {performanceSummary.supporting}
                              </p>
                              {performance.notes ? (
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">{performance.notes}</p>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  onClose()
                                  router.push(`/exercises/${exerciseId}/edit-performance/${performance.id}`)
                                }}
                                className="rounded-full border-border bg-background/60"
                                aria-label="Modifier cette performance"
                              >
                                <Edit3 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setPerfToDelete(performance)
                                  setDeleteModalOpen(true)
                                }}
                                className="rounded-full border-destructive/20 bg-destructive/5 text-safe-error hover:bg-destructive/10"
                                aria-label="Supprimer cette performance"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
              <AlertDescription>Exercice introuvable.</AlertDescription>
            </Alert>
          )}
        </div>

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-sm rounded-[24px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>Supprimer la performance</DialogTitle>
              <DialogDescription>
                Cette action retire définitivement cette entrée de l’historique.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeletePerformance()}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
