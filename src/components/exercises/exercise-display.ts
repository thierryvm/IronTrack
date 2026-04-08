import { Activity, Dumbbell, type LucideIcon } from 'lucide-react'

export interface ExercisePerformanceSnapshot {
  weight?: number
  reps?: number
  sets?: number
  distance?: number
  duration_seconds?: number
  stroke_rate?: number
  watts?: number
  heart_rate?: number
  incline?: number
  cadence?: number
  resistance?: number
  calories?: number
  speed?: number
  performed_at: string
}

export interface ExerciseSummaryInput {
  exerciseType: 'Musculation' | 'Cardio'
  exerciseName?: string
  equipment?: string
  performance?: ExercisePerformanceSnapshot
}

export interface ExerciseDifficultyMeta {
  label: string
  className: string
}

export interface ExerciseVisualMeta {
  icon: LucideIcon
  accentClass: string
  backdropClass: string
  badgeClass: string
  imageTintClass: string
}

export interface ExercisePerformanceSummary {
  headline: string
  supporting: string
  dateLabel: string
  isEmpty: boolean
}

export function getDifficultyMeta(difficulty: string | number | undefined | null): ExerciseDifficultyMeta {
  const value = String(difficulty ?? '').trim().toLowerCase()

  if (value === 'débutant' || value === 'debutant' || value === 'beginner' || value === '1') {
    return {
      label: 'Débutant',
      className: 'border-emerald-500/20 bg-emerald-500/12 text-safe-success',
    }
  }

  if (
    value === 'intermédiaire' ||
    value === 'intermediaire' ||
    value === 'intermediate' ||
    value === '2'
  ) {
    return {
      label: 'Intermédiaire',
      className: 'border-amber-500/20 bg-amber-500/12 text-safe-warning',
    }
  }

  if (value === 'avancé' || value === 'avance' || value === 'advanced' || value === '3') {
    return {
      label: 'Avancé',
      className: 'border-rose-500/20 bg-rose-500/12 text-safe-error',
    }
  }

  return {
    label: String(difficulty || 'Niveau libre'),
    className: 'border-border bg-background/70 text-safe-muted',
  }
}

export function getExerciseVisualMeta(
  exerciseType: 'Musculation' | 'Cardio',
): ExerciseVisualMeta {
  if (exerciseType === 'Cardio') {
    return {
      icon: Activity,
      accentClass: 'text-sky-300',
      backdropClass: 'from-sky-500/12 to-cyan-500/12',
      badgeClass: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
      imageTintClass: 'from-sky-950/15 via-sky-950/20 to-cyan-950/45',
    }
  }

  return {
    icon: Dumbbell,
    accentClass: 'text-primary',
    backdropClass: 'from-primary/14 to-orange-500/8',
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
    imageTintClass: 'from-orange-950/15 via-orange-950/20 to-orange-950/48',
  }
}

function formatDate(value?: string) {
  if (!value) {
    return 'Pas encore daté'
  }

  return new Date(value).toLocaleDateString('fr-FR')
}

function isRowingExercise(exerciseName?: string, equipment?: string) {
  const source = `${exerciseName ?? ''} ${equipment ?? ''}`.toLowerCase()
  return source.includes('rameur') || source.includes('rowing')
}

function formatDurationCompact(durationSeconds?: number) {
  if (!durationSeconds || Number.isNaN(durationSeconds)) {
    return null
  }

  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60))
  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return minutes > 0 ? `${hours} h ${minutes.toString().padStart(2, '0')}` : `${hours} h`
}

function formatDistanceCompact(
  distance?: number,
  options?: { exerciseName?: string; equipment?: string },
) {
  if (!distance || Number.isNaN(distance)) {
    return null
  }

  if (isRowingExercise(options?.exerciseName, options?.equipment)) {
    return `${distance} m`
  }

  if (distance > 100) {
    return `${(distance / 1000).toFixed(distance >= 10000 ? 0 : 1).replace('.0', '')} km`
  }

  return `${distance.toString().replace('.0', '')} km`
}

export function summarizeExercisePerformance({
  exerciseType,
  exerciseName,
  equipment,
  performance,
}: ExerciseSummaryInput): ExercisePerformanceSummary {
  if (!performance) {
    return {
      headline: 'Aucune performance enregistrée',
      supporting: 'Ajoute un premier log pour comparer tes prochaines séries.',
      dateLabel: 'En attente',
      isEmpty: true,
    }
  }

  if (exerciseType === 'Musculation') {
    const headlineParts = []

    if (performance.weight) headlineParts.push(`${performance.weight} kg`)
    if (performance.reps) headlineParts.push(`${performance.reps} reps`)
    if (performance.sets) headlineParts.push(`${performance.sets} séries`)

    return {
      headline: headlineParts.join(' • ') || 'Performance musculation',
      supporting: 'Dernière charge utile enregistrée',
      dateLabel: formatDate(performance.performed_at),
      isEmpty: false,
    }
  }

  const headlineParts = [
    formatDistanceCompact(performance.distance, { exerciseName, equipment }),
    formatDurationCompact(performance.duration_seconds),
    performance.heart_rate ? `${performance.heart_rate} BPM` : null,
  ].filter(Boolean)

  const supportingParts = [
    performance.speed ? `${performance.speed} km/h` : null,
    performance.watts ? `${performance.watts} W` : null,
    performance.calories ? `${performance.calories} kcal` : null,
  ].filter(Boolean)

  return {
    headline: headlineParts.join(' • ') || 'Performance cardio',
    supporting: supportingParts.join(' • ') || 'Mesure cardio récente',
    dateLabel: formatDate(performance.performed_at),
    isEmpty: false,
  }
}
