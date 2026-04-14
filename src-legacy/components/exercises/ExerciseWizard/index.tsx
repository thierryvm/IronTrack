import React, { useEffect, useRef, useCallback} from'react'
import { motion, AnimatePresence} from'framer-motion'
import { X, ArrowLeft} from'lucide-react'
import { useWizardState} from'./hooks/useWizardState'
import { useAnalytics} from'@/hooks/useAnalytics'
import { TypeSelection} from'./steps/TypeSelection'
import { SuggestionsList} from'./steps/SuggestionsList'
import { CustomForm} from'./steps/CustomForm'
import { PerformanceInput} from'./steps/PerformanceInput'
import { ExerciseSuggestion, CustomExercise, ExercisePerformance} from'@/types/exercise-wizard'

// ✅ SÉCURITÉ : Sanitisation des erreurs et validation
const sanitizeErrorMessage = (error: string | null | undefined): string => {
 if (!error) return''
 
 // Supprimer les informations sensibles
 return error
 .replace(/password|token|key|secret|api/gi,'[REDACTED]')
 .replace(/\b\d{4,}\b/g,'[NUMBERS]')
 .slice(0, 200) // Limiter la longueur
}

const sanitizeClassName = (className: string): string => {
 // Validation basique pour éviter l'injection de classes malveillantes
 return className.replace(/[<>"']/g,'').slice(0, 200)
}

interface ExerciseWizardProps {
 onClose?: () => void
 className?: string
 initialData?: CustomExercise
 isEditMode?: boolean
 exerciseId?: string
 onComplete?: (finalData: unknown) => Promise<void>
 onCompleteWithoutPerformance?: (exerciseData: unknown) => Promise<void>
}

export const ExerciseWizard: React.FC<ExerciseWizardProps> = ({ 
 onClose, 
 className ='',
 initialData,
 isEditMode = false,
 exerciseId,
 onComplete,
 onCompleteWithoutPerformance
}) => {
 const {
 state,
 loading,
 error,
 nextStep,
 prevStep,
 complete
} = useWizardState(initialData, isEditMode)
 
 const { trackWizardStep, trackWizardAbandon, trackWizardComplete, trackSuggestionSelected} = useAnalytics()
 const startTimeRef = useRef<number>(Date.now())
 const previousStepRef = useRef<number>(state.currentStep)
 
 // ✅ ACCESSIBILITÉ : Références pour la gestion du focus
 const modalRef = useRef<HTMLDivElement>(null)
 const previouslyFocusedElement = useRef<HTMLElement | null>(null)

 // Noms des étapes pour le tracking
 const getStepName = useCallback((step: number) => {
 switch (step) {
 case 0: return'Type Selection'
 case 1: return'Suggestions List'
 case 2: return state.selectedSuggestion ?'Performance Input' :'Custom Form'
 case 3: return'Performance Input'
 default: return'Unknown'
}
}, [state.selectedSuggestion])

 // Tracker les changements d'étapes
 useEffect(() => {
 if (previousStepRef.current !== state.currentStep) {
 // Tracker la sortie de l'étape précédente
 if (previousStepRef.current >= 0) {
 trackWizardStep(previousStepRef.current, getStepName(previousStepRef.current),'exit')
}
 
 // Tracker l'entrée dans la nouvelle étape
 trackWizardStep(state.currentStep, getStepName(state.currentStep),'enter')
 
 previousStepRef.current = state.currentStep
}
}, [state.currentStep, trackWizardStep, getStepName])

 // ✅ ACCESSIBILITÉ : Gestion du focus à l'ouverture
 useEffect(() => {
 // Sauvegarder l'élément actuellement focusé
 const activeElement = document.activeElement as HTMLElement
 if (activeElement && activeElement !== document.body) {
 previouslyFocusedElement.current = activeElement
}
 
 // Focus sur le modal après un court délai
 const timer = setTimeout(() => {
 if (modalRef.current) {
 modalRef.current.focus()
}
}, 100)
 
 return () => clearTimeout(timer)
}, [])

 // ✅ ACCESSIBILITÉ : Gestion de la touche Escape
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key ==='Escape' && onClose) {
 e.preventDefault()
 handleClose()
}
}
 
 document.addEventListener('keydown', handleKeyDown)
 return () => document.removeEventListener('keydown', handleKeyDown)
}, [onClose])

 // Tracker l'abandon si fermeture
 useEffect(() => {
 const handleBeforeUnload = () => {
 if (!state.isComplete) {
 trackWizardAbandon(state.currentStep, getStepName(state.currentStep))
}
}

 window.addEventListener('beforeunload', handleBeforeUnload)
 return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [state.currentStep, state.isComplete, trackWizardAbandon, getStepName])

 const handleTypeSelection = (type:'Musculation' |'Cardio' |'Fitness' |'Étirement' |'Échauffement') => {
 nextStep({ exerciseType: type})
}

 const handleSuggestionSelection = (suggestion: ExerciseSuggestion) => {
 trackSuggestionSelected(suggestion.id, suggestion.name, suggestion.type)
 nextStep({ selectedSuggestion: suggestion})
}

 const handleCreateCustom = () => {
 nextStep({ selectedSuggestion: null})
}

 const handleCustomComplete = (customExercise: CustomExercise) => {
 nextStep({ customExercise})
}

 const handlePerformanceComplete = async (data: {
 exercise: ExerciseSuggestion | CustomExercise
 performance?: ExercisePerformance
}) => {
 // Tracker la completion
 const duration = Date.now() - startTimeRef.current
 trackWizardComplete(totalSteps, duration)
 
 if (onComplete) {
 await onComplete(data)
} else {
 await complete(data)
}
}

 const handleClose = () => {
 if (!state.isComplete) {
 trackWizardAbandon(state.currentStep, getStepName(state.currentStep))
}
 
 // ✅ ACCESSIBILITÉ : Restaurer le focus précédent
 if (previouslyFocusedElement.current && document.contains(previouslyFocusedElement.current)) {
 try {
 previouslyFocusedElement.current.focus()
} catch (error) {
 console.warn('Failed to restore focus:', error)
}
}
 
 onClose?.()
}

 const getCurrentStepComponent = () => {
 switch (state.currentStep) {
 case 0:
 return (
 <TypeSelection
 selectedType={state.exerciseType}
 onNext={handleTypeSelection}
 />
 )
 case 1:
 return (
 <SuggestionsList
 exerciseType={state.exerciseType!}
 onSelectSuggestion={handleSuggestionSelection}
 onCreateCustom={handleCreateCustom}
 />
 )
 case 2:
 // Si une suggestion a été sélectionnée, passer directement à la performance
 if (state.selectedSuggestion) {
 return (
 <PerformanceInput
 exercise={state.selectedSuggestion}
 onComplete={handlePerformanceComplete}
 onBack={prevStep}
 onCancel={handleClose}
 onCompleteWithoutPerformance={onCompleteWithoutPerformance}
 isEditMode={isEditMode}
 exerciseId={exerciseId}
 />
 )
}
 // Sinon, afficher le formulaire personnalisé
 return (
 <CustomForm
 exerciseType={state.exerciseType!}
 onComplete={handleCustomComplete}
 onBack={prevStep}
 onCancel={handleClose}
 onCompleteWithoutPerformance={onCompleteWithoutPerformance}
 initialData={state.customExercise}
 isEditMode={isEditMode}
 />
 )
 case 3:
 return (
 <PerformanceInput
 exercise={state.customExercise as CustomExercise}
 onComplete={handlePerformanceComplete}
 onBack={prevStep}
 onCancel={handleClose}
 onCompleteWithoutPerformance={onCompleteWithoutPerformance}
 isEditMode={isEditMode}
 exerciseId={exerciseId}
 />
 )
 default:
 return null
}
}

 // Calculer le nombre total d'étapes dynamiquement
 const totalSteps = state.selectedSuggestion ? 3 : 4
 const currentStepForProgress = state.selectedSuggestion && state.currentStep >= 2 
 ? state.currentStep - 1 
 : state.currentStep

 // ✅ SÉCURITÉ : Sanitisation des données affichées
 const sanitizedError = sanitizeErrorMessage(error)
 const safeClassName = sanitizeClassName(className)

 return (
 <div 
 ref={modalRef}
 className={`min-h-screen bg-background ${safeClassName}`}
 role="dialog"
 aria-modal="true"
 aria-labelledby="wizard-title"
 aria-describedby="wizard-description"
 tabIndex={-1}
 >
 {/* Header */}
 <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2">
 <div className="max-w-4xl mx-auto">
 {/* Première ligne: Boutons de navigation + Titre sur la même ligne */}
 <div className="flex items-center justify-between mb-2">
 <button
 onClick={state.currentStep > 0 ? prevStep : handleClose}
 className="p-2 hover:bg-muted rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
 aria-label={state.currentStep > 0 ?"Retourner à l'étape précédente" :"Fermer et retourner à la liste des exercices"}
 type="button"
 >
 <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
 </button>
 
 <h1 
 id="wizard-title"
 className="text-lg font-semibold text-foreground"
 >
 {isEditMode && initialData ? `Modifier ${initialData.name}` :'Nouveau exercice'}
 </h1>
 
 {onClose && (
 <button
 onClick={handleClose}
 className="p-2 hover:bg-muted rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
 aria-label="Annuler et fermer la création d'exercice"
 type="button"
 >
 <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
 </button>
 )}
 </div>
 
 {/* Deuxième ligne: Indicateur d'étape centré */}
 <div className="flex justify-center">
 <div 
 className="flex items-center gap-2"
 role="progressbar"
 aria-valuenow={currentStepForProgress + 1}
 aria-valuemin={1}
 aria-valuemax={totalSteps}
 aria-label={`Étape ${currentStepForProgress + 1} sur ${totalSteps}`}
 id="wizard-description"
 >
 {Array.from({ length: totalSteps}, (_, i) => (
 <motion.div
 key={i}
 className={`w-2 h-2 rounded-full transition-colors ${
 i <= currentStepForProgress
 ?'bg-primary'
 : i < currentStepForProgress
 ?'bg-orange-200'
 :'bg-gray-200'
}`}
 initial={{ scale: 0.8}}
 animate={{ 
 scale: i === currentStepForProgress ? 1.2 : 1,
 backgroundColor: i <= currentStepForProgress ?'#f97316' : i < currentStepForProgress ?'#fed7aa' :'#d1d5db'
}}
 transition={{ duration: 0.3}}
 aria-hidden="true"
 />
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="py-8 px-4">

 {/* ✅ SÉCURITÉ : Affichage sécurisé des erreurs */}
 {sanitizedError && (
 <motion.div
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 className="max-w-4xl mx-auto mb-6"
 >
 <div 
 className="bg-red-50 border border-red-200 rounded-lg p-4"
 role="alert"
 aria-live="assertive"
 >
 <div className="flex items-center gap-2">
 <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
 <X className="w-3 h-3 text-white" aria-hidden="true" />
 </div>
 <h4 className="font-semibold text-red-800">Erreur</h4>
 </div>
 <p className="text-sm text-red-700 mt-1">{sanitizedError}</p>
 </div>
 </motion.div>
 )}

 {/* Contenu principal avec animations */}
 <AnimatePresence mode="wait">
 <motion.div
 key={state.currentStep}
 initial={{ opacity: 0, x: 20}}
 animate={{ opacity: 1, x: 0}}
 exit={{ opacity: 0, x: -20}}
 transition={{ duration: 0.3}}
 className="max-w-4xl mx-auto"
 >
 {getCurrentStepComponent()}
 </motion.div>
 </AnimatePresence>

 {/* Overlay de chargement */}
 {loading && (
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
 >
 <div className="bg-card border border-border rounded-xl p-8 max-w-sm mx-4">
 <div className="flex items-center gap-4">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 <div>
 <h3 className="font-semibold text-foreground">
 Enregistrement en cours...
 </h3>
 <p className="text-sm text-gray-600">
 Création de ton exercice
 </p>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 )
}

export default ExerciseWizard