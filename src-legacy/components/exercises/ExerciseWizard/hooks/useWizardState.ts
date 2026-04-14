import { useState, useCallback} from'react'
import { useRouter} from'next/navigation'
import { createClient} from'@/utils/supabase/client'
import { WizardState, ExerciseSuggestion, CustomExercise, ExercisePerformance} from'@/types/exercise-wizard'
import { validateForm} from'@/utils/security'
import { toast} from'react-hot-toast'

const TOTAL_STEPS = 4

export const useWizardState = (initialData?: CustomExercise, isEditMode = false) => {
 const router = useRouter()
 const [state, setState] = useState<WizardState>(() => {
 if (isEditMode && initialData) {
 // En mode édition, démarrer directement sur le formulaire personnalisé
 return {
 currentStep: 2,
 totalSteps: TOTAL_STEPS,
 isComplete: false,
 exerciseType: initialData.exercise_type,
 customExercise: initialData
}
}
 return {
 currentStep: 0,
 totalSteps: TOTAL_STEPS,
 isComplete: false
}
})
 
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const updateState = useCallback((updates: Partial<WizardState>) => {
 setState(prev => ({ ...prev, ...updates}))
}, [])

 const nextStep = useCallback((data?: Record<string, unknown>) => {
 setState(prev => ({
 ...prev,
 currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS - 1),
 ...data
}))
}, [])

 const prevStep = useCallback(() => {
 setState(prev => ({
 ...prev,
 currentStep: Math.max(0, prev.currentStep - 1)
}))
}, [])

 const reset = useCallback(() => {
 setState({
 currentStep: 0,
 totalSteps: TOTAL_STEPS,
 isComplete: false
})
 setError(null)
}, [])

 const complete = useCallback(async (finalData: {
 exercise: CustomExercise | ExerciseSuggestion
 performance?: ExercisePerformance
}) => {
 setLoading(true)
 setError(null)

 try {
 const supabase = createClient()
 
 // Vérifier l'authentification
 const { data: { user}, error: authError} = await supabase.auth.getUser()
 if (authError || !user) {
 throw new Error('Utilisateur non connecté')
}

 let exerciseData: Record<string, unknown>

 // Préparer les données selon le type (suggestion ou exercice custom)
 if ('id' in finalData.exercise) {
 // Suggestion sélectionnée - créer l'exercice à partir de la suggestion
 const suggestion = finalData.exercise as ExerciseSuggestion
 
 // Récupérer l'ID de l'équipement depuis le nom avec fallback intelligent
 let equipmentId = 1 // Fallback par défaut
 
 const { data: equipment} = await supabase
 .from('equipment')
 .select('id, name')
 .eq('name', suggestion.equipment)
 .single()
 
 if (equipment) {
 equipmentId = equipment.id
} else {
 // Si équipement exact pas trouvé, chercher des équipements similaires
 const { data: fallbackEquipment} = await supabase
 .from('equipment')
 .select('id, name')
 .ilike('name', `%${suggestion.equipment}%`)
 .limit(1)
 .single()
 
 if (fallbackEquipment) {
 equipmentId = fallbackEquipment.id
}
}
 
 exerciseData = {
 user_id: user.id,
 name: suggestion.name,
 exercise_type: suggestion.type,
 muscle_group: suggestion.muscle_group,
 equipment_id: equipmentId,
 difficulty: suggestion.difficulty,
 image_url: suggestion.image_url, // CORRECTION : Inclure l'URL de l'image si présente
 created_at: new Date().toISOString()
}
} else {
 // Exercice personnalisé
 const custom = finalData.exercise as CustomExercise
 
 // Validation des données
 const validationResult = validateForm({
 name: custom.name,
 exercise_type: custom.exercise_type,
 muscle_group: custom.muscle_group,
 difficulty: custom.difficulty
}, {
 name: { type:'text', required: true, minLength: 1, maxLength: 100},
 exercise_type: { type:'text', required: true},
 muscle_group: { type:'text', required: true},
 difficulty: { type:'text', required: true}
})

 if (!validationResult.isValid) {
 throw new Error(validationResult.errors.join(','))
}

 exerciseData = {
 user_id: user.id,
 name: custom.name,
 exercise_type: custom.exercise_type,
 muscle_group: custom.muscle_group,
 equipment_id: custom.equipment_id,
 difficulty: custom.difficulty,
 description: custom.description,
 instructions: custom.instructions,
 image_url: custom.image_url, // CORRECTION : Inclure l'URL de l'image uploadée
 sets: custom.exercise_type ==='Musculation' ? custom.sets : null,
 duration_minutes: custom.duration_minutes,
 duration_seconds: custom.duration_seconds,
 
 // Champs spécifiques au cardio
 distance: custom.exercise_type ==='Cardio' ? custom.distance : null,
 distance_unit: custom.exercise_type ==='Cardio' ? custom.distance_unit : null,
 speed: custom.exercise_type ==='Cardio' ? custom.speed : null,
 speed_unit: custom.exercise_type ==='Cardio' ? custom.speed_unit : null,
 calories: custom.exercise_type ==='Cardio' ? custom.calories : null,
 
 created_at: new Date().toISOString()
}
}

 // Insérer l'exercice dans la base de données
 const { data: exerciseResult, error: exerciseError} = await supabase
 .from('exercises')
 .insert(exerciseData)
 .select('id')
 .single()

 if (exerciseError || !exerciseResult) {
 throw new Error(exerciseError?.message ||'Erreur lors de la création de l\'exercice')
}

 // Ajouter la performance initiale si renseignée
 if (finalData.performance) {
 const performance = finalData.performance
 
 // Préparer les données de performance
 const performanceData: Record<string, unknown> = {
 user_id: user.id,
 exercise_id: exerciseResult.id,
 performed_at: new Date().toISOString()
}

 // Ajouter les champs spécifiques selon le type
 if (exerciseData.exercise_type ==='Musculation') {
 if (performance.weight) performanceData.weight = performance.weight
 if (performance.reps) performanceData.reps = performance.reps
 if (performance.sets) performanceData.sets = performance.sets
} else if (exerciseData.exercise_type ==='Cardio') {
 if (performance.duration) performanceData.duration = performance.duration * 60 // convertir en secondes
 if (performance.distance) performanceData.distance = performance.distance
 if (performance.speed) performanceData.speed = performance.speed
 if (performance.calories) performanceData.calories = performance.calories
}

 if (performance.notes) performanceData.notes = performance.notes

 const { error: performanceError} = await supabase
 .from('performance_logs')
 .insert(performanceData)

 if (performanceError) {
 console.warn('Erreur lors de l\'ajout de la performance:', performanceError)
 // Ne pas faire échouer toute l'opération pour une erreur de performance
}
}

 // Marquer comme terminé
 setState(prev => ({ ...prev, isComplete: true}))
 
 // Afficher le succès
 toast.success('Exercice ajouté avec succès ! 🎉')
 
 // Rediriger vers la liste des exercices
 router.push('/exercises')

} catch (err) {
 const errorMessage = err instanceof Error ? err.message :'Erreur inconnue'
 setError(errorMessage)
 toast.error(errorMessage)
} finally {
 setLoading(false)
}
}, [router])

 return {
 state,
 loading,
 error,
 updateState,
 nextStep,
 prevStep,
 reset,
 complete
}
}