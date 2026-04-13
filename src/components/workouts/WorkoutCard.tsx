import Link from 'next/link'
import { CalendarDays, Clock3, PencilLine, Target } from 'lucide-react'

import {
  formatScheduledLongDate,
  isWorkoutCompleted,
  normalizeWorkoutType,
  type Workout,
} from '@/components/calendar/calendar-utils'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

import { getWorkoutPresentation, getWorkoutStatusPresentation } from './workout-presentation'

interface WorkoutCardProps {
  workout: Workout
  onOpenDetails: (workout: Workout) => void
  onMarkCompleted: (workoutId: string) => void
}

export default function WorkoutCard({
  workout,
  onOpenDetails,
  onMarkCompleted,
}: WorkoutCardProps) {
  const workoutType = normalizeWorkoutType(workout)
  const { Icon, meta } = getWorkoutPresentation(workoutType)
  const statusMeta = getWorkoutStatusPresentation(workout.status)
  const isCompleted = isWorkoutCompleted(workout.status)
  const notesPreview = workout.notes?.trim()

  return (
    <Card className="rounded-[26px] border-border bg-card/84 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.14)]">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`rounded-[18px] border border-border/70 p-3 ${meta.softCardClass}`}>
              <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={meta.badgeClass}>
                  {workoutType}
                </Badge>
                <Badge variant="outline" className={statusMeta.className}>
                  {statusMeta.label}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{workout.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {notesPreview
                    ? notesPreview.length > 96
                      ? `${notesPreview.slice(0, 96)}…`
                      : notesPreview
                    : 'Séance prête à être ouverte, modifiée ou validée sans bruit visuel.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 rounded-[20px] border border-border/70 bg-background/42 p-3 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Date
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              {formatScheduledLongDate(workout.scheduled_date)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Heure
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
              <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
              {workout.start_time ? workout.start_time.slice(0, 5) : 'Non précisée'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Durée
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              {workout.duration ? `${workout.duration} min` : 'Libre'}
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <ActionButton
            type="button"
            tone="secondary"
            onClick={() => onOpenDetails(workout)}
            className="justify-center gap-2 sm:flex-1"
          >
            Détails
          </ActionButton>

          <ActionButton asChild type="button" tone="secondary" className="justify-center gap-2 sm:flex-1">
            <Link href={`/workouts/${workout.id}/edit`}>
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              <span>Modifier</span>
            </Link>
          </ActionButton>

          {!isCompleted ? (
            <ActionButton
              type="button"
              tone="primary"
              onClick={() => onMarkCompleted(String(workout.id))}
              className="justify-center gap-2 sm:flex-[1.2]"
            >
              Valider
            </ActionButton>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
