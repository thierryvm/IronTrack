'use client'

import Image from 'next/image'
import { Clock3, Eye, Plus, Trash2 } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  type ExercisePerformanceSnapshot,
  getDifficultyMeta,
  getExerciseVisualMeta,
  summarizeExercisePerformance,
} from '@/components/exercises/exercise-display'
import { cn } from '@/lib/utils'

export interface ExerciseLibraryItem {
  id: number
  name: string
  muscle_group: string
  equipment: string
  difficulty: 'Debutant' | 'Débutant' | 'Intermédiaire' | 'Avancé' | string | number
  exercise_type: 'Musculation' | 'Cardio'
  description?: string
  image_url?: string
  lastPerformance?: ExercisePerformanceSnapshot
}

interface ExerciseLibraryCardProps {
  exercise: ExerciseLibraryItem
  onAddPerformance: (exerciseId: number) => void
  onViewDetails: (exerciseId: number) => void
  onDelete?: (exerciseId: number) => void
}

export default function ExerciseLibraryCard({
  exercise,
  onAddPerformance,
  onViewDetails,
  onDelete,
}: ExerciseLibraryCardProps) {
  const difficultyMeta = getDifficultyMeta(exercise.difficulty)
  const performanceMeta = summarizeExercisePerformance({
    exerciseType: exercise.exercise_type,
    exerciseName: exercise.name,
    equipment: exercise.equipment,
    performance: exercise.lastPerformance,
  })
  const visualMeta = getExerciseVisualMeta(exercise.exercise_type)
  const VisualIcon = visualMeta.icon

  return (
    <Card className="flex h-full min-h-[296px] flex-col rounded-[24px] border-border bg-card/84 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'relative size-[92px] shrink-0 overflow-hidden rounded-[22px] border border-border/70 bg-background',
            `bg-gradient-to-br ${visualMeta.backdropClass}`,
          )}
        >
          {exercise.image_url ? (
            <>
              <Image
                src={exercise.image_url}
                alt={`Illustration de ${exercise.name}`}
                fill
                sizes="92px"
                className="object-cover object-center"
              />
              <div
                aria-hidden="true"
                className={cn('absolute inset-0 bg-gradient-to-br', visualMeta.imageTintClass)}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <VisualIcon className={cn('h-10 w-10', visualMeta.accentClass)} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={visualMeta.badgeClass}>
              {exercise.exercise_type}
            </Badge>
            <Badge variant="outline" className={difficultyMeta.className}>
              {difficultyMeta.label}
            </Badge>
          </div>

          <div>
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
              {exercise.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {exercise.description ||
                'Exercice prêt à être enrichi avec une exécution claire et des performances utiles.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border bg-background/65 text-foreground">
              {exercise.muscle_group || 'Groupe non défini'}
            </Badge>
            <Badge variant="outline" className="border-border bg-background/65 text-safe-muted">
              {exercise.equipment || 'Équipement libre'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-border/70 bg-background/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Dernière performance</p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-safe-muted">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{performanceMeta.dateLabel}</span>
          </div>
        </div>

        <p className="mt-3 text-base font-semibold leading-6 text-foreground">
          {performanceMeta.headline}
        </p>
        <p
          className={cn(
            'mt-2 text-sm leading-6',
            performanceMeta.isEmpty ? 'text-safe-muted' : 'text-muted-foreground',
          )}
        >
          {performanceMeta.supporting}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 pt-4">
        <ActionButton
          type="button"
          tone="primary"
          onClick={() => onAddPerformance(exercise.id)}
          className="w-full justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Ajouter perf</span>
        </ActionButton>

        <ActionButton
          type="button"
          tone="secondary"
          onClick={() => onViewDetails(exercise.id)}
          className="gap-2 whitespace-nowrap"
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
    </Card>
  )
}
