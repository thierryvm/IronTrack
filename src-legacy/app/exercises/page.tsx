'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Dumbbell, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import ExerciseLibraryCard, {
  type ExerciseLibraryItem,
} from '@/components/exercises/ExerciseLibraryCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ActionButton from '@/components/ui/action-button'
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
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'

const ExerciseDetailsModal = dynamic(
  () =>
    import('@/components/exercises/ExerciseDetailsModal').then((mod) => ({
      default: mod.ExerciseDetailsModal,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-[24px] border border-border bg-card/80" />
    ),
  },
)

interface PerformanceData {
  exercise_id: number
  weight?: number
  reps?: number
  sets?: number
  distance?: number
  duration_seconds?: number
  performed_at: string
  speed?: number
  heart_rate?: number
  stroke_rate?: number
  watts?: number
  cadence?: number
  resistance?: number
  incline?: number
  calories?: number
}

type Exercise = ExerciseLibraryItem

const muscleGroups = [
  'Tous',
  'Pectoraux',
  'Dos',
  'Épaules',
  'Biceps',
  'Triceps',
  'Jambes',
  'Abdominaux',
  'Fessiers',
]

const PAGE_SIZE = 10

function sanitizeSearchTerm(value: string) {
  return value.trim().replace(/[%_,]/g, '')
}

async function loadExercisesWithPerformances({
  page,
  searchTerm,
  muscleGroup,
}: {
  page: number
  searchTerm: string
  muscleGroup: string
}) {
  const supabase = createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const safeSearch = sanitizeSearchTerm(searchTerm)

  let query = supabase
    .from('exercises')
    .select('*, image_url', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (safeSearch) {
    query = query.or(
      `name.ilike.%${safeSearch}%,muscle_group.ilike.%${safeSearch}%,equipment.ilike.%${safeSearch}%`,
    )
  }

  if (muscleGroup !== 'Tous') {
    query = query.eq('muscle_group', muscleGroup)
  }

  const { data: exercisesData, error: exercisesError, count } = await query.range(from, to)

  if (exercisesError || !exercisesData) {
    throw exercisesError || new Error('Impossible de charger les exercices')
  }

  const exerciseIds = exercisesData.map((exercise) => exercise.id)
  if (exerciseIds.length === 0) {
    return { exercises: [] as Exercise[], totalCount: count || 0 }
  }

  const { data: performancesData } = await supabase
    .from('performance_logs')
    .select(
      'exercise_id, weight, reps, sets, distance, duration_seconds, performed_at, speed, heart_rate, stroke_rate, watts, cadence, resistance, incline, calories',
    )
    .in('exercise_id', exerciseIds)
    .order('performed_at', { ascending: false })

  const performanceMap = new Map<number, PerformanceData>()
  for (const performance of performancesData || []) {
    if (!performanceMap.has(performance.exercise_id)) {
      performanceMap.set(performance.exercise_id, performance)
    }
  }

  return {
    exercises: exercisesData.map((exercise) => ({
      ...exercise,
      lastPerformance: performanceMap.get(exercise.id),
    })) as Exercise[],
    totalCount: count || 0,
  }
}

function ExerciseLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="h-[318px] rounded-[26px] border-border bg-card/80 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
        >
          <div className="h-full animate-pulse rounded-[20px] bg-background/65" />
        </Card>
      ))}
    </div>
  )
}

export default function ExercisesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  const deferredSearchTerm = useDeferredValue(searchTerm)

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!isAuthenticated) {
      router.replace('/auth')
    }
  }, [isAuthenticated, isAuthLoading, router])

  useEffect(() => {
    setPage(1)
  }, [deferredSearchTerm, selectedMuscleGroup])

  const loadExercises = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated) {
      return
    }

    setLoading(true)
    setLoadError(null)

    try {
      const { exercises: loadedExercises, totalCount: count } =
        await loadExercisesWithPerformances({
          page,
          searchTerm: deferredSearchTerm,
          muscleGroup: selectedMuscleGroup,
        })

      setExercises(loadedExercises)
      setTotalCount(count)
    } catch {
      setLoadError('Impossible de charger la bibliothèque exercices pour le moment.')
      setExercises([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [deferredSearchTerm, isAuthenticated, isAuthLoading, page, selectedMuscleGroup])

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return
    }

    void loadExercises()
  }, [isAuthenticated, isAuthLoading, loadExercises])

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const currentFilterSummary = useMemo(() => {
    const parts = []

    if (selectedMuscleGroup !== 'Tous') {
      parts.push(selectedMuscleGroup)
    }

    if (deferredSearchTerm.trim()) {
      parts.push(`recherche “${deferredSearchTerm.trim()}”`)
    }

    return parts.length > 0 ? parts.join(' • ') : 'tous les exercices'
  }, [deferredSearchTerm, selectedMuscleGroup])

  const handleDeleteExercise = (exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setShowDeleteModal(true)
  }

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return

    const supabase = createClient()
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseToDelete.id)

    if (error) {
      toast.error('Suppression impossible pour le moment.')
      return
    }

    toast.success(`Exercice “${exerciseToDelete.name}” supprimé.`)
    setShowDeleteModal(false)
    setExerciseToDelete(null)
    void loadExercises()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[30px] border border-border bg-card/80 px-5 py-5 shadow-[0_24px_56px_rgba(0,0,0,0.22)] sm:px-6 sm:py-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-65"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(249,115,22,0.16), transparent 28%), radial-gradient(circle at bottom left, rgba(59,130,246,0.08), transparent 36%)',
            }}
          />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Bibliothèque exercices
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Recherche claire, ajout sans friction.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Retrouve vite le bon exercice, ouvre son détail sans bruit et garde un seul vrai
                  CTA pour enrichir tes performances.
                </p>
              </div>

              <ActionButton
                type="button"
                tone="primary"
                onClick={() => router.push('/exercises/new')}
                className="gap-2 self-start"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Nouvel exercice</span>
              </ActionButton>
            </div>

            <dl className="grid gap-0 overflow-hidden rounded-[24px] border border-border/80 bg-background/48 sm:grid-cols-3 sm:divide-x sm:divide-border/70">
              <div className="px-4 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Bibliothèque
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-foreground">{totalCount}</dd>
                <p className="mt-1 text-sm text-muted-foreground">exercices trouvés</p>
              </div>
              <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Vue active
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-foreground">{page}</dd>
                <p className="mt-1 text-sm text-muted-foreground">page sur {pageCount}</p>
              </div>
              <div className="border-t border-border/70 px-4 py-4 sm:border-t-0">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Filtre
                </dt>
                <dd className="mt-2 text-lg font-semibold text-foreground">{currentFilterSummary}</dd>
                <p className="mt-1 text-sm text-muted-foreground">affichage courant</p>
              </div>
            </dl>
          </div>
        </section>

        <Card className="rounded-[26px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Recherche par nom, groupe musculaire ou équipement"
                  className="h-12 rounded-full border-border bg-background/60 pl-11"
                  aria-label="Rechercher un exercice"
                />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-4 py-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>{currentFilterSummary}</span>
              </div>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filtres par groupe musculaire"
            >
              {muscleGroups.map((group) => {
                const isActive = selectedMuscleGroup === group

                return (
                  <Button
                    key={group}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => setSelectedMuscleGroup(group)}
                    className={
                      isActive
                        ? 'rounded-full border border-primary/20 bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'rounded-full border-border bg-background/55 text-foreground hover:border-primary/20 hover:bg-accent'
                    }
                    aria-pressed={isActive}
                  >
                    {group}
                  </Button>
                )
              })}
            </div>
          </div>
        </Card>

        {loadError ? (
          <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <ActionButton
                type="button"
                tone="secondary"
                onClick={() => void loadExercises()}
              >
                Réessayer
              </ActionButton>
            </AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <ExerciseLoadingSkeleton />
        ) : exercises.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseLibraryCard
                key={exercise.id}
                exercise={exercise}
                onAddPerformance={(exerciseId) =>
                  router.push(`/exercises/${exerciseId}/add-performance`)
                }
                onViewDetails={(exerciseId) => setSelectedExerciseId(String(exerciseId))}
                onDelete={(exerciseId) => {
                  const currentExercise = exercises.find((item) => item.id === exerciseId)
                  if (currentExercise) {
                    handleDeleteExercise(currentExercise)
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-[26px] border border-dashed border-border bg-card/72 px-5 py-12 text-center shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background/55">
              <Dumbbell className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Aucun exercice trouvé</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Essaie un autre filtre ou crée un nouvel exercice pour démarrer une bibliothèque plus
              utile.
            </p>
            <div className="mt-5 flex justify-center">
              <ActionButton
                type="button"
                tone="primary"
                onClick={() => router.push('/exercises/new')}
              >
                Nouvel exercice
              </ActionButton>
            </div>
          </Card>
        )}

        {pageCount > 1 ? (
          <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-card/72 px-4 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> sur{' '}
              <span className="font-semibold text-foreground">{pageCount}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Précédent
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedExerciseId ? (
        <ExerciseDetailsModal
          exerciseId={selectedExerciseId}
          isOpen={Boolean(selectedExerciseId)}
          onClose={() => setSelectedExerciseId(null)}
        />
      ) : null}

      <Dialog
        open={showDeleteModal && Boolean(exerciseToDelete)}
        onOpenChange={() => setShowDeleteModal(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {exerciseToDelete
                ? `Supprimer “${exerciseToDelete.name}” effacera aussi ses performances associées.`
                : 'Cette action est irréversible.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDeleteExercise()}
              className="flex-1"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
