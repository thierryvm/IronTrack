'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { Exercise, ExerciseType, ExerciseCreationData, DIFFICULTY_VALUE_MAPPING } from '@/types/exercise'
import { Performance, StrengthMetrics, CardioMetrics } from '@/types/performance'
import { Button } from '@/components/ui/form'

// Import des étapes simplifiées
import { TypeSelection } from './steps/TypeSelection'
import { ExerciseForm } from './steps/ExerciseForm'
import { PerformanceForm } from './steps/PerformanceForm'

interface ExerciseCreationWizardProps {
  onClose?: () => void
  onComplete?: (data: { exercise: Exercise; performance?: Performance }) => Promise<void>
  className?: string
}

interface WizardState {
  currentStep: number
  exerciseType?: ExerciseType
  exerciseData?: ExerciseCreationData
  performanceData?: StrengthMetrics | CardioMetrics
  isComplete: boolean
}

/**
 * Assistant de création d'exercices simplifié à 3 étapes
 * Architecture clean séparant Exercise (propriétés) et Performance (instances)
 */
export function ExerciseCreationWizard({
  onClose,
  onComplete,
  className = ''
}: ExerciseCreationWizardProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    isComplete: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Navigation entre étapes
  const nextStep = useCallback((data: Partial<WizardState>) => {
    setState(prev => ({
      ...prev,
      ...data,
      currentStep: prev.currentStep + 1
    }))
    setError(null)
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }))
    setError(null)
  }, [])

  // Gestionnaires d'étapes
  const handleTypeSelection = useCallback((type: ExerciseType) => {
    nextStep({ exerciseType: type })
  }, [nextStep])

  const handleExerciseForm = useCallback((exerciseData: ExerciseCreationData) => {
    nextStep({ exerciseData })
  }, [nextStep])

  const handlePerformanceForm = useCallback(async (performanceData?: StrengthMetrics | CardioMetrics) => {
    if (!state.exerciseData) {
      setError('Données exercice manquantes')
      return
    }

    setIsLoading(true)
    try {
      // Construire l'exercice complet
      const exercise: Exercise = {
        ...state.exerciseData,
        difficulty: DIFFICULTY_VALUE_MAPPING[state.exerciseData.difficulty || 'Débutant'], // Conversion texte vers nombre
        is_template: false, // Exercice personnel
        created_at: new Date(),
        updated_at: new Date()
      }

      // Construire la performance si fournie
      let performance: Performance | undefined
      if (performanceData) {
        performance = {
          exercise_id: 0, // Sera assigné après création exercice
          user_id: '', // Sera assigné côté serveur
          performed_at: new Date(),
          metrics: performanceData,
          created_at: new Date(),
          updated_at: new Date()
        }
      }

      // Appeler le callback de completion
      if (onComplete) {
        await onComplete({ exercise, performance })
      }

      setState(prev => ({ ...prev, isComplete: true }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }, [state.exerciseData, onComplete])

  // Rendu des étapes
  const renderStep = useCallback(() => {
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
          <ExerciseForm
            exerciseType={state.exerciseType!}
            initialData={state.exerciseData}
            onComplete={handleExerciseForm}
            onBack={prevStep}
          />
        )
      
      case 2:
        return (
          <PerformanceForm
            exerciseType={state.exerciseType!}
            exerciseData={state.exerciseData!}
            onComplete={handlePerformanceForm}
            onBack={prevStep}
            onSkip={() => handlePerformanceForm(undefined)}
          />
        )
      
      default:
        return null
    }
  }, [state, handleTypeSelection, handleExerciseForm, handlePerformanceForm, prevStep])

  // Titres des étapes
  const getStepTitle = useCallback(() => {
    switch (state.currentStep) {
      case 0: return 'Type d\'exercice'
      case 1: return 'Détails de l\'exercice'
      case 2: return 'Première performance'
      default: return 'Nouvel exercice'
    }
  }, [state.currentStep])

  const canGoBack = state.currentStep > 0 && !isLoading

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={canGoBack ? prevStep : onClose}
              disabled={isLoading}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {canGoBack ? 'Précédent' : 'Annuler'}
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {getStepTitle()}
            </h1>
          </div>
          
          {/* Indicateur d'étape */}
          <div className="hidden sm:flex items-center gap-2">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === state.currentStep
                    ? 'bg-orange-500'
                    : step < state.currentStep
                    ? 'bg-orange-200'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              leftIcon={<X className="w-4 h-4" />}
            >
              Fermer
            </Button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
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

        {/* Étapes avec animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Overlay de chargement */}
        {isLoading && (
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
                    Création en cours...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enregistrement de ton exercice
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