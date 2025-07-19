// Types pour le wizard de création d'exercices
// Basé sur la structure existante de la base de données

export interface WizardState {
  currentStep: number
  totalSteps: number
  exerciseType?: 'Musculation' | 'Cardio'
  selectedSuggestion?: ExerciseSuggestion
  customExercise?: Partial<CustomExercise>
  performance?: ExercisePerformance
  isComplete: boolean
}

export interface ExerciseSuggestion {
  id: string
  name: string
  label: string
  type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  values: ExerciseValues
  relevanceScore?: number
}

export interface ExerciseValues {
  // Musculation
  firstWeight?: string
  firstReps?: string
  sets?: number
  
  // Cardio
  distance?: string
  distanceUnit?: 'km' | 'm' | 'miles'
  speed?: string
  speedUnit?: 'km/h' | 'm/s' | 'mph'
  calories?: string
  duration?: string
  
  // Commun
  minutes?: string
  seconds?: string
}

export interface CustomExercise {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment_id: number
  equipment_name?: string // Nom de l'équipement pour affichage
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  description?: string
  instructions?: string
  sets?: number
  duration_minutes?: number
  duration_seconds?: number
  
  // Cardio specific
  distance?: number
  distance_unit?: string
  speed?: number
  speed_unit?: string
  calories?: number
}

export interface ExercisePerformance {
  // Musculation
  weight?: number
  reps?: number
  sets?: number
  
  // Cardio
  distance?: number
  duration?: number
  speed?: number
  calories?: number
  
  // Commun
  notes?: string
}

export interface WizardStepProps {
  state: WizardState
  onNext: (data?: Record<string, unknown>) => void
  onBack: () => void
  onComplete: (finalData: Record<string, unknown>) => Promise<void>
}

// Types pour les suggestions intelligentes
export interface UserPreferences {
  goal?: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance'
  experience?: 'Débutant' | 'Intermédiaire' | 'Avancé'
  frequency?: 'Faible' | 'Modérée' | 'Élevée'
  availability?: number // minutes
  weight?: number
  height?: number
  age?: number
}

export interface EquipmentItem {
  id: number
  name: string
  description?: string
}

export interface MuscleGroup {
  id: number
  name: string
  description?: string
  color?: string
  icon?: string
}

// Types pour les composants
export interface TypeCardProps {
  type: 'Musculation' | 'Cardio'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  selected: boolean
  onClick: () => void
}

export interface SuggestionCardProps {
  suggestion: ExerciseSuggestion
  onSelect: () => void
  delay?: number
}

export interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  variant?: 'dots' | 'bar' | 'steps'
}

export interface FormFieldProps {
  label: string
  type?: 'text' | 'select' | 'number'
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  required?: boolean
  options?: Array<{value: string | number, label: string}>
}