import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ArrowLeft, Save, Target, Dumbbell } from 'lucide-react'
import { ExercisePerformance, ExerciseSuggestion, CustomExercise } from '@/types/exercise-wizard'
import { NumberInput } from '@/components/ui/NumberInput'
import { FinalSummaryModal } from '../components/FinalSummaryModal'

interface PerformanceInputProps {
  exercise: ExerciseSuggestion | CustomExercise
  onComplete: (data: { exercise: ExerciseSuggestion | CustomExercise, performance?: ExercisePerformance }) => Promise<void>
  onBack: () => void
}

const StrengthPerformanceForm: React.FC<{
  performance: ExercisePerformance
  onChange: (performance: ExercisePerformance) => void
}> = ({ performance, onChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poids (kg)
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={performance.weight || ''}
          onChange={(e) => onChange({...performance, weight: Number(e.target.value)})}
          placeholder="60"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Répétitions
        </label>
        <input
          type="number"
          min="1"
          value={performance.reps || ''}
          onChange={(e) => onChange({...performance, reps: Number(e.target.value)})}
          placeholder="10"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nombre de séries
      </label>
      <NumberInput
        value={performance.sets || 3}
        onChange={(value) => onChange({...performance, sets: value})}
        min={1}
        max={10}
        className="w-full"
      />
    </div>
  </div>
)

const CardioPerformanceForm: React.FC<{
  performance: ExercisePerformance
  onChange: (performance: ExercisePerformance) => void
}> = ({ performance, onChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distance (km)
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={performance.distance || ''}
          onChange={(e) => onChange({...performance, distance: Number(e.target.value)})}
          placeholder="5.0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Durée (minutes)
        </label>
        <input
          type="number"
          min="1"
          value={performance.duration || ''}
          onChange={(e) => onChange({...performance, duration: Number(e.target.value)})}
          placeholder="30"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vitesse (km/h)
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={performance.speed || ''}
          onChange={(e) => onChange({...performance, speed: Number(e.target.value)})}
          placeholder="10.0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calories brûlées
        </label>
        <input
          type="number"
          min="0"
          value={performance.calories || ''}
          onChange={(e) => onChange({...performance, calories: Number(e.target.value)})}
          placeholder="300"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  </div>
)

export const PerformanceInput: React.FC<PerformanceInputProps> = ({ 
  exercise, 
  onComplete, 
  onBack
}) => {
  const [performance, setPerformance] = useState<ExercisePerformance>(() => {
    // Pré-remplir avec les valeurs suggérées si disponibles
    if ('values' in exercise) {
      const suggestion = exercise as ExerciseSuggestion
      return {
        weight: suggestion.values.firstWeight ? Number(suggestion.values.firstWeight) : undefined,
        reps: suggestion.values.firstReps ? Number(suggestion.values.firstReps) : undefined,
        sets: suggestion.values.sets || 3,
        duration: suggestion.values.duration_minutes || undefined,
        distance: suggestion.values.distance || undefined,
        speed: suggestion.values.speed || undefined,
        calories: suggestion.values.calories || undefined
      }
    }
    
    // Pré-remplir avec les valeurs custom si disponibles
    const customEx = exercise as CustomExercise
    const initialPerf: ExercisePerformance = {
      sets: customEx.sets || 3
    }
    if (customEx.weight) initialPerf.weight = customEx.weight
    if (customEx.reps) initialPerf.reps = customEx.reps
    if (customEx.distance) initialPerf.distance = customEx.distance
    if (customEx.duration_minutes) initialPerf.duration = customEx.duration_minutes
    if (customEx.speed) initialPerf.speed = customEx.speed
    if (customEx.calories) initialPerf.calories = customEx.calories
    
    return initialPerf
  })

  const [showModal, setShowModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setLoading(true)
      const performanceData: ExercisePerformance = {
        ...performance,
        notes: notes.trim() || undefined
      }
      
      await onComplete({ exercise, performance: performanceData })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      setLoading(true)
      await onComplete({ exercise })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (exercise.exercise_type === 'Cardio') {
      return performance.duration || performance.distance
    } else {
      return performance.weight && performance.reps
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ta première performance
          </h2>
          <p className="text-gray-600">
            Ajoute tes performances pour suivre tes progrès ! Tu peux aussi passer cette étape et l&apos;ajouter plus tard.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            {exercise.exercise_type === 'Cardio' ? (
              <Target className="h-5 w-5 text-orange-500" />
            ) : (
              <Dumbbell className="h-5 w-5 text-orange-500" />
            )}
            <h3 className="font-semibold text-gray-900">
              Performance {exercise.exercise_type === 'Cardio' ? 'Cardio' : 'Musculation'}
            </h3>
          </div>

          {exercise.exercise_type === 'Cardio' ? (
            <CardioPerformanceForm 
              performance={performance} 
              onChange={setPerformance} 
            />
          ) : (
            <StrengthPerformanceForm 
              performance={performance} 
              onChange={setPerformance} 
            />
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoute des notes sur ta séance..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Passer
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            disabled={!isFormValid() || loading}
            className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Terminer
          </button>
        </div>
      </motion.div>

      {/* Modal de confirmation */}
      <FinalSummaryModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        exercise={exercise}
        performance={performance}
        onConfirm={handleComplete}
        loading={loading}
      />
    </>
  )
}