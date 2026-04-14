import type { ComponentType } from 'react'

export interface ExerciseItem {
  id: number
  name: string
  muscle_group?: string
  exercise_type?: string
  weight?: number
  displayValue?: string
  displayLabel?: string
}

export interface HomeStats {
  totalWorkouts: number
  thisWeek: number
  currentStreak: number
  totalWeight: number
  nutritionEntriesThisWeek: number
}

export interface HomeProfileSummary {
  goal: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance' | null
  frequency: 'Faible' | 'Modérée' | 'Élevée' | null
  availability: number | null
}

export interface HomeQuickAction {
  name: string
  href?: string
  description: string
  icon: ComponentType<{ className?: string }>
  isPrimary?: boolean
  onClick?: () => void
}

export interface DatabaseExercise {
  id: number
  name: string
  exercise_type: string | null
  created_at?: string
  muscle_group?: string
}
