import React, { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { useWizardState } from './hooks/useWizardState'
import { useAnalytics } from '@/hooks/useAnalytics'
// import { ProgressIndicator } from './components/ProgressIndicator' // Composant disponible si nécessaire
import { TypeSelection } from './steps/TypeSelection'
import { SuggestionsList } from './steps/SuggestionsList'
import { CustomForm } from './steps/CustomForm'
import { PerformanceInput } from './steps/PerformanceInput'
import { ExerciseSuggestion, CustomExercise, ExercisePerformance } from '@/types/exercise-wizard'

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
  className = '',
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
  
  const { trackWizardStep, trackWizardAbandon, trackWizardComplete, trackSuggestionSelected } = useAnalytics()
  const startTimeRef = useRef<number>(Date.now())
  const previousStepRef = useRef<number>(state.currentStep)

  // Noms des étapes pour le tracking
  const getStepName = useCallback((step: number) => {
    switch (step) {
      case 0: return 'Type Selection'
      case 1: return 'Suggestions List'
      case 2: return state.selectedSuggestion ? 'Performance Input' : 'Custom Form'
      case 3: return 'Performance Input'
      default: return 'Unknown'
    }
  }, [state.selectedSuggestion])

  // Tracker les changements d'étapes
  useEffect(() => {
    if (previousStepRef.current !== state.currentStep) {
      // Tracker la sortie de l'étape précédente
      if (previousStepRef.current >= 0) {
        trackWizardStep(previousStepRef.current, getStepName(previousStepRef.current), 'exit')
      }
      
      // Tracker l'entrée dans la nouvelle étape
      trackWizardStep(state.currentStep, getStepName(state.currentStep), 'enter')
      
      previousStepRef.current = state.currentStep
    }
  }, [state.currentStep, trackWizardStep, getStepName])

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

  const handleTypeSelection = (type: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement') => {
    nextStep({ exerciseType: type })
  }

  const handleSuggestionSelection = (suggestion: ExerciseSuggestion) => {
    trackSuggestionSelected(suggestion.id, suggestion.name, suggestion.type)
    nextStep({ selectedSuggestion: suggestion })
  }

  const handleCreateCustom = () => {
    nextStep({ selectedSuggestion: null })
  }

  const handleCustomComplete = (customExercise: CustomExercise) => {
    nextStep({ customExercise })
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

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Première ligne: Boutons de navigation + Titre sur la même ligne */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={state.currentStep > 0 ? prevStep : handleClose}
              className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
              title={state.currentStep > 0 ? "Étape précédente" : "Retour"}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode && initialData ? `Modifier ${initialData.name}` : 'Nouveau exercice'}
            </h1>
            
            {onClose && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                title="Annuler"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Deuxième ligne: Indicateur d'étape centré */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= currentStepForProgress
                      ? 'bg-orange-600'
                      : i < currentStepForProgress
                      ? 'bg-orange-200'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: i === currentStepForProgress ? 1.2 : 1,
                    backgroundColor: i <= currentStepForProgress ? '#f97316' : i < currentStepForProgress ? '#fed7aa' : '#d1d5db'
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4">

        {/* Affichage des erreurs */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-semibold text-red-800">Erreur</h4>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Contenu principal avec animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {getCurrentStepComponent()}
          </motion.div>
        </AnimatePresence>

        {/* Overlay de chargement */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl p-8 max-w-sm mx-4">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Enregistrement en cours...
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
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