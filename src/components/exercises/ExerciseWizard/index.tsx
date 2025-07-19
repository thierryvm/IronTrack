import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft } from 'lucide-react'
import { useWizardState } from './hooks/useWizardState'
import { useAnalytics } from '@/hooks/useAnalytics'
import { ProgressIndicator } from './components/ProgressIndicator'
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
  onComplete?: (finalData: any) => Promise<void>
  onCompleteWithoutPerformance?: (exerciseData: any) => Promise<void>
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
  const getStepName = (step: number) => {
    switch (step) {
      case 0: return 'Type Selection'
      case 1: return 'Suggestions List'
      case 2: return state.selectedSuggestion ? 'Performance Input' : 'Custom Form'
      case 3: return 'Performance Input'
      default: return 'Unknown'
    }
  }

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
  }, [state.currentStep, trackWizardStep])

  // Tracker l'abandon si fermeture
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!state.isComplete) {
        trackWizardAbandon(state.currentStep, getStepName(state.currentStep))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.currentStep, state.isComplete, trackWizardAbandon])

  const handleTypeSelection = (type: 'Musculation' | 'Cardio') => {
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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={state.currentStep > 0 ? prevStep : handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={state.currentStep > 0 ? "Étape précédente" : "Retour"}
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {isEditMode && initialData ? `Modifier ${initialData.name}` : 'Nouveau exercice'}
            </h1>
          </div>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Annuler"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="py-8 px-4">
        {/* Indicateur de progression */}
        <div className="max-w-4xl mx-auto mb-8">
          <ProgressIndicator
            currentStep={currentStepForProgress}
            totalSteps={totalSteps}
            variant="dots"
          />
        </div>

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
            <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
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