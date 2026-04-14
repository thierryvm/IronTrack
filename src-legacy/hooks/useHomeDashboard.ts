'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/utils/supabase/client'

import type {
  DatabaseExercise,
  ExerciseItem,
  HomeProfileSummary,
  HomeStats,
} from '@/components/HomePage/homepage-types'

const emptyStats: HomeStats = {
  totalWorkouts: 0,
  thisWeek: 0,
  currentStreak: 0,
  totalWeight: 0,
  nutritionEntriesThisWeek: 0,
}

const emptyProfileSummary: HomeProfileSummary = {
  goal: null,
  frequency: null,
  availability: null,
}

function startOfIsoWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + diff)
  return start
}

function getCurrentWorkoutStreak(workoutDates: string[]): number {
  const uniqueDates = Array.from(
    new Set(
      workoutDates.map((date) => {
        const parsed = new Date(date)
        parsed.setHours(0, 0, 0, 0)
        return parsed.toISOString()
      }),
    ),
  )
    .map((date) => new Date(date))
    .sort((first, second) => second.getTime() - first.getTime())

  if (uniqueDates.length === 0) {
    return 0
  }

  let streak = 1

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = uniqueDates[index - 1]
    const current = uniqueDates[index]
    const expected = new Date(previous)
    expected.setDate(expected.getDate() - 1)

    if (current.toDateString() === expected.toDateString()) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

export function useHomeDashboard() {
  const [stats, setStats] = useState<HomeStats>(emptyStats)
  const [profileSummary, setProfileSummary] = useState<HomeProfileSummary>(emptyProfileSummary)
  const [recentExercises, setRecentExercises] = useState<ExerciseItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStats(emptyStats)
        setProfileSummary(emptyProfileSummary)
        setRecentExercises([])
        setLoading(false)
        return
      }

      const now = new Date()
      const weekStart = startOfIsoWeek(now).toISOString()

      const [
        { count: totalWorkouts, error: totalWorkoutsError },
        { count: thisWeek, error: thisWeekError },
        { data: recentWorkouts, error: recentWorkoutsError },
        { count: nutritionEntriesThisWeek, error: nutritionError },
        { data: profileSummaryData, error: profileError },
      ] = await Promise.all([
        supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['Réalisé', 'Terminé', 'Completed']),
        supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['Réalisé', 'Terminé', 'Completed'])
          .gte('created_at', weekStart),
        supabase
          .from('workouts')
          .select('created_at')
          .eq('user_id', user.id)
          .in('status', ['Réalisé', 'Terminé', 'Completed'])
          .order('created_at', { ascending: false })
          .limit(90),
        supabase
          .from('nutrition_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('date', weekStart.split('T')[0]),
        supabase
          .from('profiles')
          .select('goal, frequency, availability')
          .eq('id', user.id)
          .single(),
      ])

      const hasBlockingProfileError = Boolean(profileError && profileError.code !== 'PGRST116')

      if (
        totalWorkoutsError ||
        thisWeekError ||
        recentWorkoutsError ||
        nutritionError ||
        hasBlockingProfileError
      ) {
        setStats(emptyStats)
        setProfileSummary(emptyProfileSummary)
        setRecentExercises([])
        setLoading(false)
        return
      }

      const currentStreak = getCurrentWorkoutStreak(
        (recentWorkouts || []).map((workout) => workout.created_at),
      )

      setStats({
        totalWorkouts: totalWorkouts || 0,
        thisWeek: thisWeek || 0,
        currentStreak,
        totalWeight: 0,
        nutritionEntriesThisWeek: nutritionEntriesThisWeek || 0,
      })
      setProfileSummary({
        goal: profileSummaryData?.goal ?? null,
        frequency: profileSummaryData?.frequency ?? null,
        availability: profileSummaryData?.availability ?? null,
      })
      setLoading(false)

      const loadDeferredInsights = async () => {
        const [{ data: perfLogs }, { data: exercises, error: exercisesError }] = await Promise.all([
          supabase.from('performance_logs').select('weight, reps, sets').eq('user_id', user.id),
          supabase
            .from('exercises')
            .select('id, name, muscle_group, exercise_type')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
        ])

        const totalWeight =
          perfLogs?.reduce((sum, log) => {
            return sum + (log.weight || 0) * (log.reps || 0) * (log.sets || 1)
          }, 0) || 0

        setStats((previous) => ({ ...previous, totalWeight }))

        if (exercisesError || !exercises?.length) {
          return
        }

        const exerciseIds = exercises.map((exercise) => exercise.id)
        const { data: allPerformances } = await supabase
          .from('performance_logs')
          .select('*')
          .in('exercise_id', exerciseIds)
          .order('performed_at', { ascending: false })

        const recentWithData = exercises.map((exercise) => {
          const lastPerformance = allPerformances?.find(
            (performance) => performance.exercise_id === exercise.id
          )

          let displayValue = 'Aucune donnée'
          let displayLabel = 'Dernière performance'
          const metrics: string[] = []

          if (lastPerformance) {
            if (exercise.exercise_type === 'Musculation') {
              if (lastPerformance.weight && lastPerformance.weight > 0) {
                metrics.push(`${lastPerformance.weight} kg`)
                if (lastPerformance.reps) metrics.push(`${lastPerformance.reps} reps`)
                if (lastPerformance.sets && lastPerformance.sets > 1) {
                  metrics.push(`${lastPerformance.sets} sets`)
                }
                displayValue = metrics.join(' •')
                displayLabel = 'Dernière série'
              } else {
                displayValue = 'Poids du corps'
                if (lastPerformance.reps) {
                  displayValue += ` • ${lastPerformance.reps} reps`
                }
                displayLabel = 'Dernière série'
              }
            } else {
              if (lastPerformance.duration) {
                const minutes = Math.floor(lastPerformance.duration / 60)
                const seconds = lastPerformance.duration % 60
                metrics.push(`${minutes}:${seconds.toString().padStart(2, '0')}`)
              }

              if (lastPerformance.distance) {
                const unit = lastPerformance.distance_unit || 'km'

                if (unit === 'km' && lastPerformance.distance >= 1000) {
                  const displayDistance = lastPerformance.distance / 1000
                  const formattedDistance =
                    displayDistance % 1 === 0
                      ? displayDistance.toString()
                      : displayDistance.toFixed(1)
                  metrics.push(`${formattedDistance} km`)
                } else if (unit === 'm' && lastPerformance.distance >= 1000) {
                  const displayDistance = lastPerformance.distance / 1000
                  const formattedDistance =
                    displayDistance % 1 === 0
                      ? displayDistance.toString()
                      : displayDistance.toFixed(1)
                  metrics.push(`${formattedDistance} km`)
                } else {
                  metrics.push(`${lastPerformance.distance}${unit}`)
                }
              }

              displayValue = metrics.length > 0 ? metrics.slice(0, 2).join(' •') : 'Aucune donnée'
              displayLabel = 'Dernière session'
            }
          }

          return {
            id: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscle_group || 'Général',
            exercise_type: exercise.exercise_type || undefined,
            weight: lastPerformance?.weight || 0,
            displayValue,
            displayLabel,
          }
        })

        setRecentExercises(recentWithData)
      }

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          void loadDeferredInsights()
        }, 450)
      } else {
        void loadDeferredInsights()
      }
    } catch {
      setStats(emptyStats)
      setProfileSummary(emptyProfileSummary)
      setRecentExercises([])
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    stats,
    profileSummary,
    recentExercises,
    loading,
    reload: loadDashboardData,
  }
}
