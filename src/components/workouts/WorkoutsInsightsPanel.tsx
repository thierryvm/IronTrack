import { CalendarDays, Clock3, Target } from 'lucide-react'

import {
  formatScheduledLongDate,
  normalizeWorkoutType,
  type Workout,
  type WorkoutType,
} from '@/components/calendar/calendar-utils'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

import { getWorkoutPresentation } from './workout-presentation'

interface WorkoutsInsightsPanelProps {
  monthLabel: string
  activeCount: number
  nextPlannedWorkout: Workout | null
  latestCompletedWorkout: Workout | null
  typeBreakdown: Array<{ name: WorkoutType; count: number }>
  onCreateWorkout: () => void
}

function WorkoutSummaryCard({
  title,
  workout,
}: {
  title: string
  workout: Workout | null
}) {
  if (!workout) {
    return (
      <div className="rounded-[18px] border border-dashed border-border bg-background/35 px-4 py-5 text-sm text-muted-foreground">
        {title === 'Prochaine séance'
          ? 'Aucune séance planifiée à venir pour le moment.'
          : 'Aucune séance terminée récente à afficher.'}
      </div>
    )
  }

  const workoutType = normalizeWorkoutType(workout)
  const { meta } = getWorkoutPresentation(workoutType)

  return (
    <div className="rounded-[18px] border border-border bg-background/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{workout.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatScheduledLongDate(workout.scheduled_date)}
          </p>
        </div>
        <Badge variant="outline" className={meta.badgeClass}>
          {workoutType}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {workout.start_time ? (
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {workout.start_time.slice(0, 5)}
          </span>
        ) : null}
        {workout.duration ? (
          <span className="inline-flex items-center gap-1">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            {workout.duration} min
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default function WorkoutsInsightsPanel({
  monthLabel,
  activeCount,
  nextPlannedWorkout,
  latestCompletedWorkout,
  typeBreakdown,
  onCreateWorkout,
}: WorkoutsInsightsPanelProps) {
  return (
    <Card className="rounded-[26px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="space-y-5">
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Contexte actif
            </p>
            <h3 className="mt-1 text-xl font-semibold capitalize text-foreground">{monthLabel}</h3>
          </div>

          <div className="rounded-[18px] border border-border/70 bg-background/50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Vue filtrée
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{activeCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              séance{activeCount > 1 ? 's' : ''} dans la vue
            </p>
          </div>

          {typeBreakdown.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Répartition utile</p>
              <div className="space-y-2">
                {typeBreakdown.map((typeStat) => {
                  const { meta } = getWorkoutPresentation(typeStat.name)

                  return (
                    <div
                      key={typeStat.name}
                      className="flex items-center justify-between rounded-[18px] border border-border/70 bg-background/42 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                        {typeStat.name}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{typeStat.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="border-t border-border/70 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Prochaine séance
          </p>
          <div className="mt-3">
            <WorkoutSummaryCard title="Prochaine séance" workout={nextPlannedWorkout} />
          </div>
        </section>

        <section className="border-t border-border/70 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dernière validée
          </p>
          <div className="mt-3">
            <WorkoutSummaryCard title="Dernière validée" workout={latestCompletedWorkout} />
          </div>
        </section>

        <section className="border-t border-border/70 pt-5">
          <div className="rounded-[20px] border border-dashed border-border bg-background/35 px-4 py-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Créer sans friction</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ajoute une nouvelle séance seulement quand tu en as besoin, sans retomber dans
                    l’ancien layout plus dense que nécessaire.
                  </p>
                </div>
                <ActionButton type="button" tone="primary" onClick={onCreateWorkout}>
                  Nouvelle séance
                </ActionButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Card>
  )
}
