'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ArrowLeft } from 'lucide-react'
import { ExerciseType } from '@/types/exercise'
import { StrengthMetrics, CardioMetrics } from '@/types/performance'
import { FormField, Input, Select, Textarea, Button } from '@/components/ui/form'
import { AdaptiveMetricsForm } from './AdaptiveMetricsForm'
import { getFieldVisibility, getFieldHelpText } from '@/utils/exerciseFieldLogic'

interface ExerciseInfo {
  id: number
  name: string
  type: ExerciseType
  equipment: string
}

interface PerformanceAddFormProps {
  exercise: ExerciseInfo
  onComplete: (performanceData: StrengthMetrics | CardioMetrics, notes?: string) => Promise<void>
  onBack: () => void
}

/**
 * Formulaire d'ajout de performance pour un exercice existant
 * Réutilise la logique du PerformanceForm mais adapté pour un exercice existant
 */
export function PerformanceAddForm({ exercise, onComplete, onBack }: PerformanceAddFormProps) {
  // État pour musculation
  const [strengthData, setStrengthData] = useState<StrengthMetrics>({
    weight: 0,
    reps: 0,
    sets: 0,
    rest_seconds: 60,
    rpe: undefined
  })

  // État pour cardio
  const [cardioData, setCardioData] = useState<CardioMetrics>({
    duration_seconds: 0,
    distance: 0,
    distance_unit: 'km',
    heart_rate: undefined,
    calories: undefined,
    rowing: undefined,
    running: undefined,
    cycling: undefined
  })

  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Logique de visibilité des champs selon type d'exercice
  const fieldVisibility = getFieldVisibility(exercise.type, exercise.name, exercise.equipment)

  // Détection du type d'équipement pour métriques spécialisées
  const getEquipmentType = () => {
    const equipment = exercise.equipment.toLowerCase()
    if (equipment.includes('rameur')) return 'rowing'
    if (equipment.includes('tapis') || equipment.includes('course')) return 'running'
    if (equipment.includes('vélo') || equipment.includes('bike')) return 'cycling'
    return null
  }

  const equipmentType = getEquipmentType()

  // Validation selon le type
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (exercise.type === 'Musculation') {
      if (strengthData.weight <= 0) {
        newErrors.weight = 'Le poids doit être supérieur à 0'
      }
      if (strengthData.reps <= 0) {
        newErrors.reps = 'Le nombre de répétitions doit être supérieur à 0'
      }
      if (strengthData.sets <= 0) {
        newErrors.sets = 'Le nombre de séries doit être supérieur à 0'
      }
    } else {
      if (cardioData.duration_seconds <= 0) {
        newErrors.duration = 'La durée doit être supérieure à 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Conversion durée minutes:secondes vers secondes
  const getDurationMinutes = () => Math.floor(cardioData.duration_seconds / 60)
  const getDurationSeconds = () => cardioData.duration_seconds % 60

  const updateDuration = (minutes: number, seconds: number) => {
    const totalSeconds = (minutes * 60) + seconds
    setCardioData(prev => ({ ...prev, duration_seconds: totalSeconds }))
  }

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const performanceData = exercise.type === 'Musculation' ? strengthData : cardioData
      console.log('📤 PerformanceAddForm - Données envoyées:', performanceData)
      console.log('📝 Notes:', notes)
      console.log('🏋️ Type exercice:', exercise.type)
      
      await onComplete(performanceData, notes || undefined)
    } catch (error) {
      console.error('💥 PerformanceAddForm - Erreur handleSubmit:', error)
      console.error('📋 Détails erreur form:', JSON.stringify(error, null, 2))
      // Re-throw pour que l'erreur remonte à la page parent
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Trophy className="w-8 h-8 text-orange-800" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Nouvelle performance
        </h2>
        <p className="text-gray-600 text-lg">
          {exercise.name} • {exercise.type}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {exercise.type === 'Musculation' ? (
          // Formulaire Musculation
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField>
                <Input
                  label="Poids (kg)"
                  type="number"
                  min="0"
                  step="0.5"
                  value={strengthData.weight || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    weight: parseFloat(e.target.value) || 0 
                  }))}
                  error={errors.weight}
                  required
                />
              </FormField>

              <FormField>
                <Input
                  label="Répétitions"
                  type="number"
                  min="1"
                  value={strengthData.reps || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    reps: parseInt(e.target.value) || 0 
                  }))}
                  error={errors.reps}
                  required
                />
              </FormField>

              <FormField>
                <Input
                  label="Séries"
                  type="number"
                  min="1"
                  value={strengthData.sets || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    sets: parseInt(e.target.value) || 0 
                  }))}
                  error={errors.sets}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <Input
                  label="Repos entre séries (sec)"
                  type="number"
                  min="0"
                  value={strengthData.rest_seconds || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    rest_seconds: parseInt(e.target.value) || 60 
                  }))}
                  description="Temps de récupération entre séries"
                />
              </FormField>

              <FormField>
                <Select
                  label="RPE (optionnel)"
                  value={strengthData.rpe?.toString() || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    rpe: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  options={[
                    { value: '', label: 'Non défini' },
                    ...Array.from({ length: 10 }, (_, i) => ({
                      value: (i + 1).toString(),
                      label: `${i + 1} - ${['Très facile', 'Facile', 'Modéré', 'Difficile', 'Très difficile', 'Dur', 'Très dur', 'Extrêmement dur', 'Maximum', 'Au-delà du maximum'][i] || 'Intense'}`
                    }))
                  ]}
                  description="Rate of Perceived Exertion (1-10)"
                />
              </FormField>
            </div>
          </>
        ) : (
          // Formulaire Cardio
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Durée <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={getDurationMinutes() || ''}
                      onChange={(e) => updateDuration(parseInt(e.target.value) || 0, getDurationSeconds())}
                    />
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="Sec"
                      value={getDurationSeconds() || ''}
                      onChange={(e) => updateDuration(getDurationMinutes(), parseInt(e.target.value) || 0)}
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
              </FormField>

              {/* Distance - Masquée pour exercices statiques comme squats */}
              {fieldVisibility.distance && (
                <FormField>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Distance
                      {!fieldVisibility.distance && <span className="text-gray-400"> (non applicable)</span>}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={cardioData.distance || ''}
                        onChange={(e) => setCardioData(prev => ({ 
                          ...prev, 
                          distance: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder={getFieldHelpText('distance', exercise.type, exercise.name)}
                      />
                      <Select
                        value={cardioData.distance_unit}
                        onChange={(e) => setCardioData(prev => ({ 
                          ...prev, 
                          distance_unit: e.target.value as 'km' | 'm' | 'miles' 
                        }))}
                        options={[
                          { value: 'km', label: 'km' },
                          { value: 'm', label: 'm' },
                          { value: 'miles', label: 'miles' }
                        ]}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {getFieldHelpText('distance', exercise.type, exercise.name)}
                    </div>
                  </div>
                </FormField>
              )}
            </div>

            {/* Métriques spécialisées selon l'équipement */}
            {equipmentType === 'rowing' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Métriques rameur</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField>
                    <Input
                      label="Cadence (SPM)"
                      type="number"
                      min="16"
                      max="36"
                      value={cardioData.rowing?.stroke_rate || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        rowing: { 
                          stroke_rate: parseInt(e.target.value) || 0,
                          watts: prev.rowing?.watts || 0,
                          split_time: prev.rowing?.split_time
                        }
                      }))}
                      description="Coups par minute"
                    />
                  </FormField>
                  <FormField>
                    <Input
                      label="Puissance (watts)"
                      type="number"
                      min="50"
                      max="500"
                      value={cardioData.rowing?.watts || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        rowing: { 
                          stroke_rate: prev.rowing?.stroke_rate || 0,
                          watts: parseInt(e.target.value) || 0,
                          split_time: prev.rowing?.split_time
                        }
                      }))}
                    />
                  </FormField>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Heart Rate - Visible selon configuration */}
              {fieldVisibility.heartRate && (
                <FormField>
                  <Input
                    label="Fréquence cardiaque (BPM)"
                    type="number"
                    min="60"
                    max="200"
                    value={cardioData.heart_rate || ''}
                    onChange={(e) => setCardioData(prev => ({ 
                      ...prev, 
                      heart_rate: parseInt(e.target.value) || undefined 
                    }))}
                    description={getFieldHelpText('heartRate', exercise.type, exercise.name)}
                  />
                </FormField>
              )}

              {/* Calories - Visible selon configuration */}
              {fieldVisibility.calories && (
                <FormField>
                  <Input
                    label="Calories brûlées"
                    type="number"
                    min="0"
                    value={cardioData.calories || ''}
                    onChange={(e) => setCardioData(prev => ({ 
                      ...prev, 
                      calories: parseInt(e.target.value) || undefined 
                    }))}
                    description={getFieldHelpText('calories', exercise.type, exercise.name)}
                  />
                </FormField>
              )}
            </div>
          </>
        )}

        {/* Métriques Avancées Adaptatives */}
        <AdaptiveMetricsForm
          exerciseType={exercise.type}
          equipment={exercise.equipment || ''}
          exerciseName={exercise.name}
          cardioData={cardioData}
          strengthData={strengthData}
          setCardioData={setCardioData}
          setStrengthData={setStrengthData}
        />

        {/* Notes */}
        <FormField>
          <Textarea
            label="Notes (optionnel)"
            placeholder="Ressenti, observations, modifications..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </FormField>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Retour
          </Button>
            
          <Button
            type="submit"
            loading={isLoading}
            leftIcon={<Trophy className="w-4 h-4" />}
          >
            Enregistrer performance
          </Button>
        </div>
      </motion.form>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-800">Excellente séance !</h4>
        </div>
        <p className="text-sm text-green-700">
          Cette performance sera ajoutée à ton historique d'entraînement pour suivre tes progrès.
        </p>
      </motion.div>
    </div>
  )
}