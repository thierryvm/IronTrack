import { CalendarDays, Clock, Users } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'

import type { DisplayWorkout } from './calendar-utils'
import {
  formatScheduledLongDate,
  getProfileDisplayName,
  getWorkoutTypeMeta,
  normalizeWorkoutType,
} from './calendar-utils'

interface CalendarListViewProps {
  workouts: DisplayWorkout[]
  onCreateWorkout: () => void
}

export default function CalendarListView({ workouts, onCreateWorkout }: CalendarListViewProps) {
  if (workouts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border bg-background/35 px-5 py-12 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune séance sur ce mois</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ajoute ta prochaine séance pour retrouver ici une vue liste claire et exploitable.
        </p>
        <div className="mt-5 flex justify-center">
          <ActionButton type="button" tone="primary" onClick={onCreateWorkout}>
            Nouvelle séance
          </ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => {
        const normalizedType = normalizeWorkoutType(workout)
        const typeMeta = getWorkoutTypeMeta(normalizedType)

        return (
          <article
            key={`${workout.isPartnerWorkout ? 'partner' : 'personal'}-${workout.id}`}
            className="rounded-[22px] border border-border bg-background/45 px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${typeMeta.dotClass}`} />
                  <h3 className="text-base font-semibold text-foreground">{workout.name}</h3>
                  <Badge variant="outline" className={typeMeta.badgeClass}>
                    {normalizedType}
                  </Badge>
                  {workout.isPartnerWorkout ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-primary/20 bg-primary/8 text-primary"
                    >
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {getProfileDisplayName(workout.profiles)}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatScheduledLongDate(workout.scheduled_date)}</span>
                  {workout.start_time ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {workout.start_time.slice(0, 5)}
                    </span>
                  ) : null}
                  {workout.duration ? <span>{workout.duration} min</span> : null}
                </div>
              </div>

              <Badge
                variant="outline"
                className={
                  workout.status === 'Annulé'
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                    : workout.status === 'Terminé' || workout.status === 'Réalisé'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : 'border-border bg-card/80 text-foreground'
                }
              >
                {workout.status}
              </Badge>
            </div>
          </article>
        )
      })}
    </div>
  )
}
