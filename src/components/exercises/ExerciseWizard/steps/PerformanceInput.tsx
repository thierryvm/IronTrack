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
  onCancel?: () => void
  onCompleteWithoutPerformance?: (exerciseData: unknown) => Promise<void>
  isEditMode?: boolean
  exerciseId?: string
}

const StrengthPerformanceForm: React.FC<{
  performance: ExercisePerformance
  onChange: (performance: ExercisePerformance) => void
}> = ({ performance, onChange }) => (
  <div className="space-y-4">
    {/* Métriques principales */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Poids utilisé (kg)
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={performance.weight || ''}
          onChange={(e) => onChange({...performance, weight: Number(e.target.value)})}
          placeholder="60"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Poids total utilisé pour l'exercice</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Répétitions par série
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={performance.reps || ''}
          onChange={(e) => onChange({...performance, reps: Number(e.target.value)})}
          placeholder="10"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Nombre de répétitions réalisées</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre de séries
        </label>
        <NumberInput
          value={performance.sets || 3}
          onChange={(value) => onChange({...performance, sets: value})}
          min={1}
          max={10}
          className="w-full"
        />
        <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Séries complètes réalisées</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Temps de repos (min)
        </label>
        <input
          type="number"
          min="0.5"
          max="10"
          step="0.5"
          value={performance.rest_time || ''}
          onChange={(e) => onChange({...performance, rest_time: Number(e.target.value)})}
          placeholder="2"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Repos entre les séries</p>
      </div>
    </div>

    {/* Métriques avancées optionnelles */}
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Métriques avancées (optionnel)</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Temps sous tension (s)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={performance.time_under_tension || ''}
            onChange={(e) => onChange({...performance, time_under_tension: Number(e.target.value)})}
            placeholder="30"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Durée totale de la série</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RPE (1-10)
          </label>
          <select
            value={performance.rpe || ''}
            onChange={(e) => onChange({...performance, rpe: Number(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Sélectionner...</option>
            <option value="6">6 - Très facile</option>
            <option value="7">7 - Facile</option>
            <option value="8">8 - Modéré</option>
            <option value="9">9 - Difficile</option>
            <option value="10">10 - Très difficile</option>
          </select>
          <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Effort perçu (Rate of Perceived Exertion)</p>
        </div>
      </div>
    </div>

    {/* Zone commentaire */}
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Notes de séance (optionnel)
      </label>
      <textarea
        value={performance.notes || ''}
        onChange={(e) => onChange({...performance, notes: e.target.value})}
        rows={3}
        placeholder="Sensation, technique, points à améliorer..."
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
      />
      <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Remarques sur votre ressenti et technique</p>
    </div>
  </div>
)

const CardioPerformanceForm: React.FC<{
  performance: ExercisePerformance
  onChange: (performance: ExercisePerformance) => void
  exerciseName?: string
}> = ({ performance, onChange, exerciseName = '' }) => {
  const isRowing = exerciseName.toLowerCase().includes('rameur')
  const isRunning = exerciseName.toLowerCase().includes('course') || exerciseName.toLowerCase().includes('tapis')
  const isCycling = exerciseName.toLowerCase().includes('vélo') || exerciseName.toLowerCase().includes('cyclisme')

  return (
    <div className="space-y-4">
      {/* Métriques principales: Distance et Durée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Distance {isRowing ? '(optionnel)' : '(km)'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step={isRowing ? "50" : "0.1"}
              value={performance.distance || ''}
              onChange={(e) => onChange({...performance, distance: Number(e.target.value)})}
              placeholder={isRowing ? "2000" : "5.0"}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            {isRowing && (
              <select
                value={performance.distance_unit || 'meters'}
                onChange={(e) => onChange({...performance, distance_unit: e.target.value})}
                className="w-20 sm:w-24 px-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="meters">mètres</option>
                <option value="km">km</option>
              </select>
            )}
          </div>
          {isRowing && (
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Laissez vide si vous ne connaissez pas la distance</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durée (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={performance.duration || ''}
            onChange={(e) => onChange({...performance, duration: Number(e.target.value)})}
            placeholder="30"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Métriques d'intensité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRowing ? 'Vitesse (optionnel)' : 'Vitesse (km/h)'}
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={performance.speed || ''}
            onChange={(e) => onChange({...performance, speed: Number(e.target.value)})}
            placeholder={isRowing ? "12.0" : "12.0"}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          {isRowing && (
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Vitesse en km/h si affichée sur l'écran du rameur</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Calories brûlées
          </label>
          <input
            type="number"
            min="0"
            value={performance.calories || ''}
            onChange={(e) => onChange({...performance, calories: Number(e.target.value)})}
            placeholder={isRowing ? "120" : "250"}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Métriques spécifiques selon l'exercice */}
      {isRowing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coups/minute (SPM)
            </label>
            <input
              type="number"
              min="16"
              max="36"
              value={performance.stroke_rate || ''}
              onChange={(e) => onChange({...performance, stroke_rate: Number(e.target.value)})}
              placeholder="24"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Affiché sur l'écran du rameur - Laissez vide si introuvable</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Puissance (Watts)
            </label>
            <input
              type="number"
              min="50"
              value={performance.watts || ''}
              onChange={(e) => onChange({...performance, watts: Number(e.target.value)})}
              placeholder="120"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Affiché sur l'écran du rameur - Laissez vide si introuvable</p>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rythme cardiaque moyen
            </label>
            <input
              type="number"
              min="60"
              max="200"
              value={performance.heart_rate || ''}
              onChange={(e) => onChange({...performance, heart_rate: Number(e.target.value)})}
              placeholder="140"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">BPM - Zone cardio: 120-160</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inclinaison (%)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              step="0.5"
              value={performance.incline || ''}
              onChange={(e) => onChange({...performance, incline: Number(e.target.value)})}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {isCycling && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cadence (RPM)
            </label>
            <input
              type="number"
              min="50"
              max="130"
              value={performance.cadence || ''}
              onChange={(e) => onChange({...performance, cadence: Number(e.target.value)})}
              placeholder="80"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-600 dark:text-safe-muted mt-1">Optimal: 70-90 RPM</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Résistance
            </label>
            <input
              type="number"
              min="1"
              max="25"
              value={performance.resistance || ''}
              onChange={(e) => onChange({...performance, resistance: Number(e.target.value)})}
              placeholder="5"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

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
        duration: suggestion.values.duration ? Number(suggestion.values.duration) : undefined,
        distance: suggestion.values.distance ? Number(suggestion.values.distance) : undefined,
        speed: suggestion.values.speed ? Number(suggestion.values.speed) : undefined,
        calories: suggestion.values.calories ? Number(suggestion.values.calories) : undefined
      }
    }
    
    // Valeurs par défaut pour un exercice custom
    return {
      sets: 3
    }
  })

  const [showModal, setShowModal] = useState(false)
  const [notes] = useState('')
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

  const getExerciseType = () => {
    // Gérer la différence entre ExerciseSuggestion (type) et CustomExercise (exercise_type)
    if ('type' in exercise) {
      return exercise.type
    }
    return exercise.exercise_type
  }

  const isFormValid = () => {
    const exerciseType = getExerciseType()
    if (exerciseType === 'Cardio') {
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
            <Trophy className="h-8 w-8 text-orange-800 dark:text-orange-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Ta première performance
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ajoute tes performances pour suivre tes progrès ! Tu peux aussi passer cette étape et l'ajouter plus tard.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            {getExerciseType() === 'Cardio' ? (
              <Target className="h-5 w-5 text-orange-800 dark:text-orange-300" />
            ) : (
              <Dumbbell className="h-5 w-5 text-orange-800 dark:text-orange-300" />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Performance {getExerciseType() === 'Cardio' ? 'Cardio' : 'Musculation'}
            </h3>
          </div>

          {getExerciseType() === 'Cardio' ? (
            <CardioPerformanceForm 
              performance={performance} 
              onChange={setPerformance}
              exerciseName={exercise.name}
            />
          ) : (
            <StrengthPerformanceForm 
              performance={performance} 
              onChange={setPerformance}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-6 w-6" />
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
            className="flex-1 bg-orange-600 dark:bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-6 w-6" />
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