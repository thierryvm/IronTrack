import Link from 'next/link'
import { CalendarDays, Clock3, Target } from 'lucide-react'

import {
  formatScheduledLongDate,
  isWorkoutCompleted,
  normalizeWorkoutType,
  type Workout,
} from '@/components/calendar/calendar-utils'
import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { getWorkoutPresentation, getWorkoutStatusPresentation } from './workout-presentation'

interface WorkoutDetailsDialogProps {
  workout: Workout | null
  open: boolean
  onClose: () => void
  onMarkCompleted: (workoutId: string) => void
}

export default function WorkoutDetailsDialog({
  workout,
  open,
  onClose,
  onMarkCompleted,
}: WorkoutDetailsDialogProps) {
  if (!workout) {
    return null
  }

  const workoutType = normalizeWorkoutType(workout)
  const { Icon, meta } = getWorkoutPresentation(workoutType)
  const statusMeta = getWorkoutStatusPresentation(workout.status)
  const isCompleted = isWorkoutCompleted(workout.status)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[30px] border-border bg-card/96 p-0 shadow-[0_28px_70px_rgba(0,0,0,0.34)]">
        <div className="border-b border-border/70 px-6 py-5">
          <DialogHeader className="gap-3">
            <div className="flex items-start gap-3">
              <div className={`rounded-[18px] border border-border/70 p-3 ${meta.softCardClass}`}>
                <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={meta.badgeClass}>
                    {workoutType}
                  </Badge>
                  <Badge variant="outline" className={statusMeta.className}>
                    {statusMeta.label}
                  </Badge>
                </div>
                <DialogTitle className="text-left text-2xl font-semibold tracking-tight text-foreground">
                  {workout.name}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="sr-only">Détails de la séance</DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-border/70 bg-background/48 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Date
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                {formatScheduledLongDate(workout.scheduled_date)}
              </p>
            </div>

            <div className="rounded-[18px] border border-border/70 bg-background/48 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Heure
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
                <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                {workout.start_time ? workout.start_time.slice(0, 5) : 'Non précisée'}
              </p>
            </div>

            <div className="rounded-[18px] border border-border/70 bg-background/48 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Durée
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
                <Target className="h-4 w-4 text-primary" aria-hidden="true" />
                {workout.duration ? `${workout.duration} min` : 'Libre'}
              </p>
            </div>
          </div>

          <section className="rounded-[22px] border border-border/70 bg-background/42 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notes
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground/90">
              {workout.notes?.trim() || 'Aucune note utile ajoutée pour cette séance.'}
            </p>
          </section>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionButton
              asChild
              type="button"
              tone="secondary"
              className="justify-center gap-2 sm:flex-1"
            >
              <Link href={`/workouts/${workout.id}/edit`}>Modifier la séance</Link>
            </ActionButton>

            {!isCompleted ? (
              <ActionButton
                type="button"
                tone="primary"
                onClick={() => {
                  onMarkCompleted(String(workout.id))
                  onClose()
                }}
                className="justify-center gap-2 sm:flex-1"
              >
                Marquer comme réalisée
              </ActionButton>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
