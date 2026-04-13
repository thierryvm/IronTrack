"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  formatMonthLabel,
  isWorkoutCompleted,
  isWorkoutPlanned,
  normalizeWorkoutType,
  type Workout,
  WORKOUT_TYPES,
} from '@/components/calendar/calendar-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ActionButton from '@/components/ui/action-button'
import { Card } from '@/components/ui/card'
import WorkoutCard from '@/components/workouts/WorkoutCard'
import WorkoutDetailsDialog from '@/components/workouts/WorkoutDetailsDialog'
import WorkoutsFilters, { type WorkoutFilterStatus } from '@/components/workouts/WorkoutsFilters'
import WorkoutsHero from '@/components/workouts/WorkoutsHero'
import WorkoutsInsightsPanel from '@/components/workouts/WorkoutsInsightsPanel'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'

const PAGE_SIZE = 8

export default function WorkoutsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const userId = user?.id

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [filterStatus, setFilterStatus] = useState<WorkoutFilterStatus>('all')

  const loadWorkouts = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated || !userId) {
      return
    }

    setLoading(true)
    setLoadError(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false })

    if (error) {
      setLoadError('Impossible de charger tes séances pour le moment.')
      setLoading(false)
      return
    }

    if (data) {
      const today = new Date().toISOString().split('T')[0]
      const processedWorkouts = data.map((workout) => {
        if (workout.scheduled_date < today && workout.status === 'Planifié') {
          void supabase.from('workouts').update({ status: 'Réalisé' }).eq('id', workout.id)
          return { ...workout, status: 'Réalisé' }
        }

        return workout
      })

      setWorkouts(processedWorkouts as Workout[])
    }

    setLoading(false)
  }, [isAuthenticated, isAuthLoading, userId])

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!isAuthenticated || !userId) {
      router.replace('/auth')
      return
    }

    void loadWorkouts()
  }, [isAuthenticated, isAuthLoading, loadWorkouts, router, userId])

  useEffect(() => {
    setPage(1)
  }, [filterStatus])

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      if (filterStatus === 'completed') {
        return isWorkoutCompleted(workout.status)
      }

      if (filterStatus === 'pending') {
        return !isWorkoutCompleted(workout.status)
      }

      return true
    })
  }, [filterStatus, workouts])

  const totalPages = Math.max(1, Math.ceil(filteredWorkouts.length / PAGE_SIZE))

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const paginatedWorkouts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredWorkouts.slice(start, start + PAGE_SIZE)
  }, [filteredWorkouts, page])

  const totalCount = workouts.length

  const plannedCount = useMemo(
    () => workouts.filter((workout) => isWorkoutPlanned(workout.status)).length,
    [workouts],
  )

  const completedCount = useMemo(
    () => workouts.filter((workout) => isWorkoutCompleted(workout.status)).length,
    [workouts],
  )

  const nextPlannedWorkout = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]

    return (
      [...workouts]
        .filter((workout) => isWorkoutPlanned(workout.status))
        .sort((left, right) =>
          `${left.scheduled_date}${left.start_time || ''}`.localeCompare(
            `${right.scheduled_date}${right.start_time || ''}`,
          ),
        )
        .find((workout) => workout.scheduled_date >= today) || null
    )
  }, [workouts])

  const latestCompletedWorkout = useMemo(() => {
    return (
      [...workouts]
        .filter((workout) => isWorkoutCompleted(workout.status))
        .sort((left, right) =>
          `${right.scheduled_date}${right.start_time || ''}`.localeCompare(
            `${left.scheduled_date}${left.start_time || ''}`,
          ),
        )[0] || null
    )
  }, [workouts])

  const typeBreakdown = useMemo(
    () =>
      WORKOUT_TYPES.map((type) => ({
        name: type,
        count: filteredWorkouts.filter((workout) => normalizeWorkoutType(workout) === type).length,
      })).filter((typeStat) => typeStat.count > 0),
    [filteredWorkouts],
  )

  const changeWorkoutStatus = async (workoutId: string, newStatus: string) => {
    const supabase = createClient()

    await supabase.from('workouts').update({ status: newStatus }).eq('id', workoutId)

    void loadWorkouts()
  }

  return (
    <main className="min-h-screen bg-background">
      <WorkoutDetailsDialog
        workout={selectedWorkout}
        open={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onMarkCompleted={(workoutId) => void changeWorkoutStatus(workoutId, 'Réalisé')}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <WorkoutsHero
          monthLabel={formatMonthLabel(new Date())}
          totalCount={totalCount}
          plannedCount={plannedCount}
          completedCount={completedCount}
          onCreateWorkout={() => router.push('/workouts/new')}
        />

        {loadError ? (
          <Alert className="border-rose-500/20 bg-rose-500/8 text-rose-100">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <ActionButton type="button" tone="secondary" onClick={() => void loadWorkouts()}>
                Réessayer
              </ActionButton>
            </AlertDescription>
          </Alert>
        ) : null}

        <WorkoutsFilters
          filterStatus={filterStatus}
          activeCount={filteredWorkouts.length}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          onFilterChange={setFilterStatus}
        />

        {loading ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <Card className="h-[540px] rounded-[28px] border-border bg-card/84">
              <div className="h-full" />
            </Card>
            <Card className="h-[540px] rounded-[28px] border-border bg-card/84">
              <div className="h-full" />
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px] xl:items-start">
            <Card className="rounded-[28px] border-border bg-card/84 p-4 shadow-[0_20px_42px_rgba(0,0,0,0.18)] sm:p-5">
              {paginatedWorkouts.length > 0 ? (
                <div className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {paginatedWorkouts.map((workout) => (
                      <WorkoutCard
                        key={workout.id}
                        workout={workout}
                        onOpenDetails={setSelectedWorkout}
                        onMarkCompleted={(workoutId) => void changeWorkoutStatus(workoutId, 'Réalisé')}
                      />
                    ))}
                  </div>

                  {filteredWorkouts.length > PAGE_SIZE ? (
                    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        {filteredWorkouts.length} séance{filteredWorkouts.length > 1 ? 's' : ''} dans cette vue
                      </p>

                      <div className="flex items-center gap-2">
                        <ActionButton
                          type="button"
                          tone="secondary"
                          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                          disabled={page === 1}
                        >
                          Précédent
                        </ActionButton>
                        <ActionButton
                          type="button"
                          tone="secondary"
                          onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                          disabled={page >= totalPages}
                        >
                          Suivant
                        </ActionButton>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-background/35 px-5 py-12 text-center">
                  <div className="mx-auto max-w-md space-y-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Vue vide
                    </p>
                    <h2 className="text-2xl font-semibold text-foreground">Aucune séance dans cette vue</h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Change le filtre actif ou ajoute une nouvelle séance pour retrouver un planning exploitable.
                    </p>
                    <div className="flex justify-center">
                      <ActionButton type="button" tone="primary" onClick={() => router.push('/workouts/new')}>
                        Nouvelle séance
                      </ActionButton>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div className="xl:sticky xl:top-6">
              <WorkoutsInsightsPanel
                monthLabel={formatMonthLabel(new Date())}
                activeCount={filteredWorkouts.length}
                nextPlannedWorkout={nextPlannedWorkout}
                latestCompletedWorkout={latestCompletedWorkout}
                typeBreakdown={typeBreakdown}
                onCreateWorkout={() => router.push('/workouts/new')}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
