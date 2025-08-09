'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, SkipForward, Target } from 'lucide-react'
import { ExerciseType, ExerciseCreationData } from '@/types/exercise'
import { StrengthMetrics, CardioMetrics } from '@/types/performance'
import { FormField, Input, Select, Textarea, Button } from '@/components/ui/form'
import { 
  validatePositiveInteger, 
  validatePositiveFloat, 
  validateDuration, 
  validateCardioMetrics 
} from '@/utils/inputValidation'

interface PerformanceFormProps {
  exerciseType: ExerciseType
  exerciseData: ExerciseCreationData
  onComplete: (performanceData?: StrengthMetrics | CardioMetrics) => Promise<void>
  onBack: () => void
  onSkip: () => Promise<void>
}

/**
 * Étape 3: Formulaire de performance spécialisé
 * Différencie Musculation (poids/reps/sets) et Cardio (durée/distance + métriques spécialisées)
 */
export function PerformanceForm({ 
  exerciseType, 
  exerciseData, 
  onComplete, 
  onBack, 
  onSkip 
}: PerformanceFormProps) {
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

  // Détection du type d'équipement pour métriques spécialisées
  const getEquipmentType = () => {
    const equipment = exerciseData.equipment.toLowerCase()
    
    // Rameur - toutes variantes
    if (equipment.includes('rameur') || equipment.includes('rowing') || equipment.includes('aviron')) {
      return 'rowing'
    }
    
    // Course/Tapis - toutes variantes
    if (equipment.includes('tapis') || equipment.includes('course') || 
        equipment.includes('running') || equipment.includes('treadmill') ||
        equipment.includes('marche') || equipment.includes('jogging')) {
      return 'running'
    }
    
    // Vélo - toutes variantes
    if (equipment.includes('vélo') || equipment.includes('bike') || 
        equipment.includes('cycling') || equipment.includes('cyclisme') ||
        equipment.includes('spinning') || equipment.includes('biking')) {
      return 'cycling'
    }
    
    return null
  }

  const equipmentType = getEquipmentType()

  // Validation sécurisée selon le type
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (exerciseType === 'Musculation') {
      // Validation sécurisée musculation
      const weightResult = validatePositiveFloat(strengthData.weight, 0.5, 1000);
      if (!weightResult.isValid) newErrors.weight = weightResult.error!;

      const repsResult = validatePositiveInteger(strengthData.reps, 1, 200);
      if (!repsResult.isValid) newErrors.reps = repsResult.error!;

      const setsResult = validatePositiveInteger(strengthData.sets, 1, 50);
      if (!setsResult.isValid) newErrors.sets = setsResult.error!;

      if (strengthData.rest_seconds) {
        const restResult = validatePositiveInteger(strengthData.rest_seconds, 5, 600);
        if (!restResult.isValid) newErrors.rest = restResult.error!;
      }
    } else {
      // Validation cardio avec durée sécurisée
      const minutes = Math.floor(cardioData.duration_seconds / 60);
      const seconds = cardioData.duration_seconds % 60;
      const durationResult = validateDuration(minutes, seconds);
      if (!durationResult.isValid) newErrors.duration = durationResult.error!;

      // Validation distance si fournie
      if (cardioData.distance) {
        const distanceResult = validatePositiveFloat(cardioData.distance, 0.1, 1000);
        if (!distanceResult.isValid) newErrors.distance = distanceResult.error!;
      }

      // Heart rate validation
      if (cardioData.heart_rate) {
        const hrResult = validatePositiveInteger(cardioData.heart_rate, 60, 220);
        if (!hrResult.isValid) newErrors.heart_rate = hrResult.error!;
      }

      // Calories validation
      if (cardioData.calories) {
        const caloriesResult = validatePositiveInteger(cardioData.calories, 1, 2000);
        if (!caloriesResult.isValid) newErrors.calories = caloriesResult.error!;
      }

      // Validations spécifiques par équipement avec sécurité
      if (equipmentType && (cardioData.rowing || cardioData.running || cardioData.cycling)) {
        const metricsToValidate = cardioData.rowing || cardioData.running || cardioData.cycling;
        if (metricsToValidate) {
          const cardioResult = validateCardioMetrics(equipmentType, metricsToValidate as Record<string, unknown>);
          if (!cardioResult.isValid) {
            newErrors.cardio_metrics = cardioResult.error!;
          }
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Conversion durée minutes:secondes vers secondes
  const convertDurationToSeconds = (minutes: number, seconds: number): number => {
    return (minutes * 60) + seconds
  }

  const getDurationMinutes = () => Math.floor(cardioData.duration_seconds / 60)
  const getDurationSeconds = () => cardioData.duration_seconds % 60

  const updateDuration = (minutes: number, seconds: number) => {
    const totalSeconds = convertDurationToSeconds(minutes, seconds)
    setCardioData(prev => ({ ...prev, duration_seconds: totalSeconds }))
  }

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const performanceData = exerciseType === 'Musculation' ? strengthData : cardioData
      await onComplete(performanceData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await onSkip()
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
          Première performance
        </h2>
        <p className="text-gray-600 text-lg">
          {exerciseType === 'Musculation' 
            ? 'Enregistre ton premier set pour démarrer le suivi'
            : 'Enregistre ta première session cardio'
          }
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {exerciseType === 'Musculation' ? (
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

              <FormField>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Distance</label>
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
                </div>
              </FormField>
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
                      error={errors.stroke_rate}
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
                      error={errors.watts}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {equipmentType === 'running' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">Métriques course</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField>
                    <Input
                      label="Vitesse (km/h)"
                      type="number"
                      min="1"
                      max="25"
                      step="0.1"
                      value={cardioData.running?.speed || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        running: { 
                          speed: parseFloat(e.target.value) || 0,
                          pace: prev.running?.pace,
                          incline: prev.running?.incline || 0,
                          elevation_gain: prev.running?.elevation_gain
                        }
                      }))}
                      description="Vitesse moyenne"
                      error={errors.speed}
                    />
                  </FormField>
                  <FormField>
                    <Input
                      label="Inclinaison (%)"
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      value={cardioData.running?.incline || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        running: { 
                          speed: prev.running?.speed || 0,
                          pace: prev.running?.pace,
                          incline: parseFloat(e.target.value) || 0,
                          elevation_gain: prev.running?.elevation_gain
                        }
                      }))}
                      description="Inclinaison tapis"
                      error={errors.incline}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {equipmentType === 'cycling' && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">Métriques vélo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField>
                    <Input
                      label="Cadence (RPM)"
                      type="number"
                      min="50"
                      max="120"
                      value={cardioData.cycling?.cadence || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        cycling: { 
                          cadence: parseInt(e.target.value) || 0,
                          resistance: prev.cycling?.resistance || 1,
                          average_speed: prev.cycling?.average_speed,
                          max_speed: prev.cycling?.max_speed
                        }
                      }))}
                      description="Tours par minute"
                      error={errors.cadence}
                    />
                  </FormField>
                  <FormField>
                    <Select
                      label="Résistance"
                      value={cardioData.cycling?.resistance?.toString() || '1'}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        cycling: { 
                          cadence: prev.cycling?.cadence || 0,
                          resistance: parseInt(e.target.value) || 1,
                          average_speed: prev.cycling?.average_speed,
                          max_speed: prev.cycling?.max_speed
                        }
                      }))}
                      options={Array.from({ length: 20 }, (_, i) => ({
                        value: (i + 1).toString(),
                        label: `Niveau ${i + 1}`
                      }))}
                      description="Niveau de résistance"
                      error={errors.resistance}
                    />
                  </FormField>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                />
              </FormField>

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
                />
              </FormField>
            </div>
          </>
        )}

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
          >
            Retour
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
              leftIcon={<SkipForward className="w-4 h-4" />}
            >
              Ignorer
            </Button>
            
            <Button
              type="submit"
              loading={isLoading}
              leftIcon={<Target className="w-4 h-4" />}
            >
              Enregistrer
            </Button>
          </div>
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
          <h4 className="font-semibold text-green-800">Presque fini !</h4>
        </div>
        <p className="text-sm text-green-700">
          {exerciseType === 'Musculation'
            ? 'Cette première performance servira de référence pour suivre tes progrès en force et volume.'
            : 'Cette première session établira ta baseline cardio pour mesurer tes améliorations d\'endurance.'
          }
        </p>
      </motion.div>
    </div>
  )
}