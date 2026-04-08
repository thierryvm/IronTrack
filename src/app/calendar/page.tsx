'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { Activity, Calendar as CalendarIcon, List } from 'lucide-react'
import { useRouter } from 'next/navigation'

import CalendarHero from '@/components/calendar/CalendarHero'
import CalendarInsightsPanel from '@/components/calendar/CalendarInsightsPanel'
import CalendarListView from '@/components/calendar/CalendarListView'
import CalendarMonthGrid from '@/components/calendar/CalendarMonthGrid'
import {
  buildMonthDays,
  formatDateToYMD,
  formatMonthLabel,
  getMonthKey,
  isWorkoutCompleted,
  isWorkoutPlanned,
  mapWorkoutToSession,
  normalizeWorkoutType,
  sortWorkouts,
  type DisplayWorkout,
  type Workout,
  type WorkoutType,
  type WorkoutWithProfile,
  WORKOUT_TYPES,
} from '@/components/calendar/calendar-utils'
import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'

interface TrainingPartnerRow {
  requester_id: string
  partner_id: string
}

export default function CalendarPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [partnersWorkouts, setPartnersWorkouts] = useState<WorkoutWithProfile[]>([])
  const [showPartnerWorkouts, setShowPartnerWorkouts] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'stats'>('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isSwipeTransition, setIsSwipeTransition] = useState(false)

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const fetchPersonalWorkouts = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })

    return (data as Workout[] | null) || []
  }, [])

  const fetchPartnerWorkouts = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data: partnerships } = await supabase
      .from('training_partners')
      .select('requester_id, partner_id')
      .or(`requester_id.eq.${userId},partner_id.eq.${userId}`)
      .eq('status', 'accepted')

    const resolvedPartnerships = (partnerships as TrainingPartnerRow[] | null) || []
    if (resolvedPartnerships.length === 0) {
      return []
    }

    const partnerIds = resolvedPartnerships.map((partnership) =>
      partnership.requester_id === userId ? partnership.partner_id : partnership.requester_id,
    )

    const { data: sharingSettings } = await supabase
      .from('partner_sharing_settings')
      .select('user_id')
      .in('user_id', partnerIds)
      .eq('partner_id', userId)
      .eq('share_workouts', true)

    const sharingPartnerIds =
      (sharingSettings as Array<{ user_id: string }> | null)?.map((setting) => setting.user_id) ||
      []

    if (sharingPartnerIds.length === 0) {
      return []
    }

    const { data } = await supabase
      .from('workouts')
      .select('*, profiles:user_id(id, pseudo, full_name, email, avatar_url)')
      .in('user_id', sharingPartnerIds)
      .order('scheduled_date', { ascending: true })

    return (data as WorkoutWithProfile[] | null) || []
  }, [])

  const refreshCalendarData = useCallback(async () => {
    if (!currentUserId) {
      return
    }

    setLoadError(null)

    try {
      const [personalWorkouts, sharedWorkouts] = await Promise.all([
        fetchPersonalWorkouts(currentUserId),
        fetchPartnerWorkouts(currentUserId),
      ])

      setWorkouts(personalWorkouts)
      setPartnersWorkouts(sharedWorkouts)
    } catch {
      setLoadError('Impossible de charger le calendrier pour le moment.')
    }
  }, [currentUserId, fetchPartnerWorkouts, fetchPersonalWorkouts])

  useEffect(() => {
    let isCancelled = false

    async function bootstrap() {
      if (isAuthLoading) {
        return
      }

      if (!isAuthenticated || !user) {
        router.replace('/auth')
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        if (isCancelled) {
          return
        }

        setCurrentUserId(user.id)

        const [personalWorkouts, sharedWorkouts] = await Promise.all([
          fetchPersonalWorkouts(user.id),
          fetchPartnerWorkouts(user.id),
        ])

        if (isCancelled) {
          return
        }

        setWorkouts(personalWorkouts)
        setPartnersWorkouts(sharedWorkouts)
      } catch {
        if (!isCancelled) {
          setLoadError('Impossible de charger le calendrier pour le moment.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isCancelled = true
    }
  }, [fetchPartnerWorkouts, fetchPersonalWorkouts, isAuthenticated, isAuthLoading, router, user])

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshCalendarData()
      }
    }

    const handleFocus = () => {
      void refreshCalendarData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [currentUserId, refreshCalendarData])

  const navigateMonth = useCallback((offset: number) => {
    setCurrentDate((previousDate) => {
      const nextDate = new Date(previousDate)
      nextDate.setMonth(previousDate.getMonth() + offset)
      return nextDate
    })
    setSelectedDate(null)
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [])

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const touchStart = touchStartRef.current
      touchStartRef.current = null

      if (!touchStart || isSwipeTransition) {
        return
      }

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const deltaTime = Date.now() - touchStart.time

      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 56 || deltaTime > 320) {
        return
      }

      setIsSwipeTransition(true)
      navigateMonth(deltaX > 0 ? -1 : 1)
      window.setTimeout(() => {
        setIsSwipeTransition(false)
      }, 260)
    },
    [isSwipeTransition, navigateMonth],
  )

  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }, [])

  const currentMonthKey = useMemo(() => getMonthKey(currentDate), [currentDate])
  const monthLabel = useMemo(() => formatMonthLabel(currentDate), [currentDate])
  const days = useMemo(() => buildMonthDays(currentDate), [currentDate])
  const todayYmd = useMemo(() => formatDateToYMD(new Date()), [])

  const currentMonthWorkouts = useMemo(
    () => sortWorkouts(workouts.filter((workout) => workout.scheduled_date.startsWith(currentMonthKey))),
    [currentMonthKey, workouts],
  )

  const currentMonthPartnerWorkouts = useMemo(
    () =>
      sortWorkouts(
        partnersWorkouts.filter((workout) => workout.scheduled_date.startsWith(currentMonthKey)),
      ),
    [currentMonthKey, partnersWorkouts],
  )

  const visibleMonthPartnerWorkouts = useMemo(
    () => (showPartnerWorkouts ? currentMonthPartnerWorkouts : []),
    [currentMonthPartnerWorkouts, showPartnerWorkouts],
  )

  const combinedMonthWorkouts = useMemo<DisplayWorkout[]>(
    () =>
      sortWorkouts([
        ...currentMonthWorkouts.map((workout) => ({ ...workout, isPartnerWorkout: false })),
        ...visibleMonthPartnerWorkouts.map((workout) => ({ ...workout, isPartnerWorkout: true })),
      ]),
    [currentMonthWorkouts, visibleMonthPartnerWorkouts],
  )

  const completedCount = useMemo(
    () => currentMonthWorkouts.filter((workout) => isWorkoutCompleted(workout.status)).length,
    [currentMonthWorkouts],
  )

  const plannedCount = useMemo(
    () => currentMonthWorkouts.filter((workout) => isWorkoutPlanned(workout.status)).length,
    [currentMonthWorkouts],
  )

  const monthlyTypeStats = useMemo(
    () =>
      WORKOUT_TYPES.map((type) => ({
        name: type,
        count: currentMonthWorkouts.filter((workout) => normalizeWorkoutType(workout) === type).length,
      })).filter((typeStat) => typeStat.count > 0) as Array<{ name: WorkoutType; count: number }>,
    [currentMonthWorkouts],
  )

  const nextPlannedWorkout = useMemo(() => {
    const plannedWorkouts = currentMonthWorkouts.filter((workout) => isWorkoutPlanned(workout.status))
    return plannedWorkouts.find((workout) => workout.scheduled_date >= todayYmd) || plannedWorkouts[0] || null
  }, [currentMonthWorkouts, todayYmd])

  const selectedDateYmd = selectedDate ? formatDateToYMD(selectedDate) : null

  const selectedDateWorkouts = useMemo<DisplayWorkout[]>(() => {
    if (!selectedDateYmd) {
      return []
    }

    return sortWorkouts([
      ...workouts
        .filter((workout) => workout.scheduled_date === selectedDateYmd)
        .map((workout) => ({ ...workout, isPartnerWorkout: false })),
      ...(showPartnerWorkouts
        ? partnersWorkouts
            .filter((workout) => workout.scheduled_date === selectedDateYmd)
            .map((workout) => ({ ...workout, isPartnerWorkout: true }))
        : []),
    ])
  }, [partnersWorkouts, selectedDateYmd, showPartnerWorkouts, workouts])

  const resolveSessionsForDate = useCallback(
    (dateYmd: string) =>
      [
        ...workouts
          .filter((workout) => workout.scheduled_date === dateYmd)
          .map((workout) => mapWorkoutToSession(workout, false)),
        ...(showPartnerWorkouts
          ? partnersWorkouts
              .filter((workout) => workout.scheduled_date === dateYmd)
              .map((workout) => mapWorkoutToSession(workout, true))
          : []),
      ].sort(
        (left, right) =>
          left.scheduledDate.localeCompare(right.scheduledDate) || left.time.localeCompare(right.time),
      ),
    [partnersWorkouts, showPartnerWorkouts, workouts],
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <CalendarHero
          monthLabel={monthLabel}
          personalCount={currentMonthWorkouts.length}
          completedCount={completedCount}
          availablePartnerCount={currentMonthPartnerWorkouts.length}
          visiblePartnerCount={visibleMonthPartnerWorkouts.length}
          hasAnyPartnerWorkouts={partnersWorkouts.length > 0}
          showPartnerWorkouts={showPartnerWorkouts}
          onCreateWorkout={() => router.push('/workouts/new')}
          onTogglePartnerWorkouts={() => {
            if (partnersWorkouts.length === 0) {
              router.push('/training-partners')
              return
            }

            setShowPartnerWorkouts((previousValue) => !previousValue)
          }}
        />

        {loadError ? (
          <Alert className="border-rose-500/20 bg-rose-500/8 text-rose-100">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <ActionButton type="button" tone="secondary" onClick={() => void refreshCalendarData()}>
                Réessayer
              </ActionButton>
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <Card className="h-[680px] rounded-[28px] border-border bg-card/84">
              <div className="h-full" />
            </Card>
            <Card className="h-[680px] rounded-[28px] border-border bg-card/84">
              <div className="h-full" />
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px] xl:items-start">
            <Card className="rounded-[28px] border-border bg-card/84 p-4 shadow-[0_20px_42px_rgba(0,0,0,0.18)] sm:p-5">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-2">
                  <TabsTrigger value="calendar" className="gap-2">
                    <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Calendrier</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" aria-hidden="true" />
                    <span>Liste</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2 md:hidden">
                    <Activity className="h-4 w-4" aria-hidden="true" />
                    <span>Stats</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="mt-5">
                  <CalendarMonthGrid
                    days={days}
                    monthLabel={monthLabel}
                    selectedDate={selectedDate}
                    onNextMonth={() => navigateMonth(1)}
                    onPreviousMonth={() => navigateMonth(-1)}
                    onResetToToday={goToToday}
                    onSelectDate={setSelectedDate}
                    onTouchEnd={handleTouchEnd}
                    onTouchStart={handleTouchStart}
                    resolveSessionsForDate={resolveSessionsForDate}
                  />
                </TabsContent>

                <TabsContent value="list" className="mt-5">
                  <CalendarListView
                    workouts={combinedMonthWorkouts}
                    onCreateWorkout={() => router.push('/workouts/new')}
                  />
                </TabsContent>

                <TabsContent value="stats" className="mt-5 md:hidden">
                  <CalendarInsightsPanel
                    monthLabel={monthLabel}
                    completedCount={completedCount}
                    plannedCount={plannedCount}
                    availablePartnerCount={currentMonthPartnerWorkouts.length}
                    monthlyTypeStats={monthlyTypeStats}
                    nextPlannedWorkout={nextPlannedWorkout}
                    selectedDate={selectedDate}
                    selectedDateWorkouts={selectedDateWorkouts}
                    onCreateWorkout={() => router.push('/workouts/new')}
                  />
                </TabsContent>
              </Tabs>
            </Card>

            <div className="hidden xl:block">
              <CalendarInsightsPanel
                monthLabel={monthLabel}
                completedCount={completedCount}
                plannedCount={plannedCount}
                availablePartnerCount={currentMonthPartnerWorkouts.length}
                monthlyTypeStats={monthlyTypeStats}
                nextPlannedWorkout={nextPlannedWorkout}
                selectedDate={selectedDate}
                selectedDateWorkouts={selectedDateWorkouts}
                onCreateWorkout={() => router.push('/workouts/new')}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
