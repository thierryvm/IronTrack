import { CalendarDays, Clock, Users } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

import type { DisplayWorkout, Workout, WorkoutType } from './calendar-utils'
import {
  formatLongDate,
  formatScheduledLongDate,
  getProfileDisplayName,
  getWorkoutTypeMeta,
  normalizeWorkoutType,
} from './calendar-utils'

interface CalendarInsightsPanelProps {
  monthLabel: string
  completedCount: number
  plannedCount: number
  availablePartnerCount: number
  monthlyTypeStats: Array<{ name: WorkoutType; count: number }>
  nextPlannedWorkout: Workout | null
  selectedDate: Date | null
  selectedDateWorkouts: DisplayWorkout[]
  onCreateWorkout: () => void
}

export default function CalendarInsightsPanel({
  monthLabel,
  completedCount,
  plannedCount,
  availablePartnerCount,
  monthlyTypeStats,
  nextPlannedWorkout,
  selectedDate,
  selectedDateWorkouts,
  onCreateWorkout,
}: CalendarInsightsPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Statistiques
            </p>
            <h3 className="mt-1 text-xl font-semibold capitalize text-foreground">{monthLabel}</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[18px] border border-emerald-500/15 bg-emerald-500/8 px-3 py-3 text-center">
              <p className="text-2xl font-semibold text-emerald-300">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Terminées</p>
            </div>
            <div className="rounded-[18px] border border-primary/15 bg-primary/8 px-3 py-3 text-center">
              <p className="text-2xl font-semibold text-primary">{plannedCount}</p>
              <p className="text-xs text-muted-foreground">Planifiées</p>
            </div>
            <div className="rounded-[18px] border border-border bg-background/58 px-3 py-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{availablePartnerCount}</p>
              <p className="text-xs text-muted-foreground">Partages</p>
            </div>
          </div>

          {monthlyTypeStats.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Répartition du mois</p>
              <div className="space-y-2">
                {monthlyTypeStats.map((typeStat) => {
                  const typeMeta = getWorkoutTypeMeta(typeStat.name)

                  return (
                    <div
                      key={typeStat.name}
                      className="flex items-center justify-between rounded-[18px] border border-border/70 bg-background/45 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        <span className={`h-2.5 w-2.5 rounded-full ${typeMeta.dotClass}`} />
                        {typeStat.name}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{typeStat.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Prochaine séance
          </p>

          {nextPlannedWorkout ? (
            <div className="rounded-[18px] border border-border bg-background/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">
                    {nextPlannedWorkout.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatScheduledLongDate(nextPlannedWorkout.scheduled_date)}
                  </p>
                </div>
                <Badge variant="outline" className={getWorkoutTypeMeta(normalizeWorkoutType(nextPlannedWorkout)).badgeClass}>
                  {normalizeWorkoutType(nextPlannedWorkout)}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {nextPlannedWorkout.start_time ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {nextPlannedWorkout.start_time.slice(0, 5)}
                  </span>
                ) : null}
                {nextPlannedWorkout.duration ? <span>{nextPlannedWorkout.duration} min</span> : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-border bg-background/35 px-4 py-6 text-sm text-muted-foreground">
              Aucune séance planifiée à venir sur ce mois.
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Jour sélectionné
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {selectedDate ? formatLongDate(selectedDate) : 'Sélectionne une date'}
            </h3>
          </div>

          <ActionButton type="button" tone="primary" onClick={onCreateWorkout} className="shrink-0">
            Ajouter
          </ActionButton>
        </div>

        <div className="mt-4 space-y-2">
          {selectedDate && selectedDateWorkouts.length > 0 ? (
            selectedDateWorkouts.map((workout) => {
              const workoutType = normalizeWorkoutType(workout)
              const typeMeta = getWorkoutTypeMeta(workoutType)

              return (
                <div
                  key={`${workout.isPartnerWorkout ? 'partner' : 'personal'}-${workout.id}`}
                  className={`rounded-[18px] border border-border px-3 py-3 ${typeMeta.softCardClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-foreground">{workout.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{workoutType}</span>
                        {workout.start_time ? <span>{workout.start_time.slice(0, 5)}</span> : null}
                        {workout.duration ? <span>{workout.duration} min</span> : null}
                      </div>
                    </div>

                    <Badge variant="outline" className={typeMeta.badgeClass}>
                      {workout.status}
                    </Badge>
                  </div>

                  {workout.isPartnerWorkout ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Partagée par {getProfileDisplayName(workout.profiles)}</span>
                    </div>
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="rounded-[18px] border border-dashed border-border bg-background/35 px-4 py-6 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedDate
                  ? 'Aucune séance planifiée pour cette date.'
                  : 'Clique sur un jour du calendrier pour voir le détail.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
