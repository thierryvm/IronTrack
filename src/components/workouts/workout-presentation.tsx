import {
  Activity,
  Clock3,
  Dumbbell,
  Flower2,
  HeartPulse,
  MoonStar,
  PersonStanding,
  ShieldHalf,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react'

import {
  getWorkoutTypeMeta,
  isWorkoutCompleted,
  isWorkoutPlanned,
  type WorkoutStatus,
  type WorkoutType,
} from '@/components/calendar/calendar-utils'

const workoutIcons: Record<WorkoutType, LucideIcon> = {
  Musculation: Dumbbell,
  Cardio: HeartPulse,
  'Étirement': PersonStanding,
  'Cours collectif': Users,
  Gainage: Activity,
  Natation: Waves,
  Crossfit: ShieldHalf,
  Yoga: Flower2,
  Pilates: Clock3,
  Repos: MoonStar,
}

export function getWorkoutPresentation(type: WorkoutType) {
  return {
    Icon: workoutIcons[type],
    meta: getWorkoutTypeMeta(type),
  }
}

export function getWorkoutStatusPresentation(status: WorkoutStatus) {
  if (isWorkoutCompleted(status)) {
    return {
      label: 'Terminée',
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    }
  }

  if (isWorkoutPlanned(status)) {
    return {
      label: 'Planifiée',
      className: 'border-primary/20 bg-primary/10 text-primary',
    }
  }

  if (status === 'Annulé') {
    return {
      label: 'Annulée',
      className: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    }
  }

  return {
    label: status,
    className: 'border-border bg-background/60 text-foreground',
  }
}
