'use client'

import Image from 'next/image'
import { Activity, Clock3, Dumbbell, Eye, HeartPulse, Plus, Trash2 } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PerformanceData {
  weight?: number
  reps?: number
  sets?: number
  distance?: number
  duration?: number
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

export interface ExerciseLibraryItem {
  id: number
  name: string
  muscle_group: string
  equipment: string
  difficulty: 'Debutant' | 'Débutant' | 'Intermédiaire' | 'Avancé' | string | number
  exercise_type: 'Musculation' | 'Cardio'
  description?: string
  image_url?: string
  lastPerformance?: PerformanceData
}

interface ExerciseLibraryCardProps {
  exercise: ExerciseLibraryItem
  onAddPerformance: (exerciseId: number) => void
  onViewDetails: (exerciseId: number) => void
  onDelete?: (exerciseId: number) => void
}

function getDifficultyMeta(difficulty: ExerciseLibraryItem['difficulty']) {
  const value = String(difficulty ?? '').trim().toLowerCase()

  if (value === 'débutant' || value === 'debutant' || value === 'beginner' || value === '1') {
    return {
      label: 'Débutant',
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
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
      className: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    }
  }

  if (value === 'avancé' || value === 'avance' || value === 'advanced' || value === '3') {
    return {
      label: 'Avancé',
      className: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    }
  }

  return {
    label: String(difficulty || 'Niveau libre'),
    className: 'border-border bg-background/70 text-foreground',
  }
}

function formatPerformance(exercise: ExerciseLibraryItem, performance?: PerformanceData) {
  if (!performance) {
    return {
      summary: 'Aucune performance enregistrée',
      detail: 'Ajoute une première mesure pour comparer tes prochaines séries.',
    }
  }

  if (exercise.exercise_type === 'Musculation') {
    const parts = []

    if (performance.weight) parts.push(`${performance.weight} kg`)
    if (performance.reps) parts.push(`${performance.reps} reps`)
    if (performance.sets) parts.push(`${performance.sets} séries`)

    return {
      summary: parts.join(' • ') || 'Performance musculation',
      detail: new Date(performance.performed_at).toLocaleDateString('fr-FR'),
    }
  }

  const cardioParts = []

  if (performance.distance) {
    cardioParts.push(
      performance.distance > 100 ? `${(performance.distance / 1000).toFixed(1)} km` : `${performance.distance} km`,
    )
  }
  if (performance.duration) {
    cardioParts.push(`${Math.round(performance.duration / 60)} min`)
  }
  if (performance.heart_rate) {
    cardioParts.push(`${performance.heart_rate} BPM`)
  }

  return {
    summary: cardioParts.join(' • ') || 'Performance cardio',
    detail: new Date(performance.performed_at).toLocaleDateString('fr-FR'),
  }
}

function getExerciseVisual(exercise: ExerciseLibraryItem) {
  if (exercise.exercise_type === 'Cardio') {
    return {
      icon: HeartPulse,
      accentClass: 'text-sky-300',
      backdropClass: 'from-sky-500/12 to-cyan-500/12',
      typeClass: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    }
  }

  return {
    icon: Dumbbell,
    accentClass: 'text-primary',
    backdropClass: 'from-primary/14 to-orange-500/8',
    typeClass: 'border-primary/20 bg-primary/10 text-primary',
  }
}

export default function ExerciseLibraryCard({
  exercise,
  onAddPerformance,
  onViewDetails,
  onDelete,
}: ExerciseLibraryCardProps) {
  const difficultyMeta = getDifficultyMeta(exercise.difficulty)
  const performanceMeta = formatPerformance(exercise, exercise.lastPerformance)
  const visualMeta = getExerciseVisual(exercise)
  const VisualIcon = visualMeta.icon

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-[26px] border-border bg-card/84 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div
        className={cn(
          'relative aspect-[16/10] overflow-hidden border-b border-border/70 bg-background',
          `bg-gradient-to-br ${visualMeta.backdropClass}`,
        )}
      >
        {exercise.image_url ? (
          <Image
            src={exercise.image_url}
            alt={`Illustration de ${exercise.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <VisualIcon className={cn('h-14 w-14', visualMeta.accentClass)} aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={visualMeta.typeClass}>
            {exercise.exercise_type}
          </Badge>
        </div>

        <div className="absolute right-4 top-4">
          <Badge variant="outline" className={difficultyMeta.className}>
            {difficultyMeta.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{exercise.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {exercise.description ||
                'Exercice prêt à être enrichi avec description, notes d’exécution et performances utiles.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border bg-background/65 text-foreground">
              {exercise.muscle_group || 'Groupe non défini'}
            </Badge>
            <Badge variant="outline" className="border-border bg-background/65 text-muted-foreground">
              {exercise.equipment || 'Équipement libre'}
            </Badge>
          </div>
        </div>

        <div className="rounded-[20px] border border-border/70 bg-background/45 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {exercise.exercise_type === 'Cardio' ? (
              <Activity className="h-4 w-4 text-sky-300" aria-hidden="true" />
            ) : (
              <Dumbbell className="h-4 w-4 text-primary" aria-hidden="true" />
            )}
            Dernière performance
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{performanceMeta.summary}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{performanceMeta.detail}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <ActionButton
            type="button"
            tone="primary"
            onClick={() => onAddPerformance(exercise.id)}
            className="flex-1 gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Performance</span>
          </ActionButton>

          <ActionButton
            type="button"
            tone="secondary"
            onClick={() => onViewDetails(exercise.id)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span>Détails</span>
          </ActionButton>

          {onDelete ? (
            <ActionButton
              type="button"
              tone="icon"
              onClick={() => onDelete(exercise.id)}
              aria-label={`Supprimer ${exercise.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </ActionButton>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
