'use client'

import Link from 'next/link'
import { ChevronRight, Dumbbell } from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Card, CardContent } from '@/components/ui/card'

import type { ExerciseItem } from './homepage-types'

interface RecentExercisesCardProps {
  exercises: ExerciseItem[]
}

export default function RecentExercisesCard({ exercises }: RecentExercisesCardProps) {
  return (
    <Card className="h-full rounded-[30px] border-border/80 bg-card/88 shadow-sm">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Mémoires récentes
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Tes derniers exercices</h2>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="flex flex-1 flex-col rounded-[26px] border border-dashed border-border/80 bg-background/65 p-5 text-center">
            <div className="flex-1">
              <p className="text-base font-medium text-foreground">Aucun exercice récent</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Commence ta base d’exercices pour alimenter ton cockpit quotidien.
              </p>
            </div>

            <ActionButton asChild tone="primary" className="mt-4 justify-center">
              <Link href="/exercises/new">Créer un exercice</Link>
            </ActionButton>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="space-y-3">
              {exercises.slice(0, 4).map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-border/70 bg-background/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">{exercise.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{exercise.muscle_group}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{exercise.displayValue}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {exercise.displayLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <ActionButton asChild tone="secondary" className="mt-auto w-full justify-between">
              <Link href="/exercises">
                <span>Voir la bibliothèque complète</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" data-icon="inline-end" />
              </Link>
            </ActionButton>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
