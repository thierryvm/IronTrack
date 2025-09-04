'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, SkipForward, Target } from 'lucide-react'
import { ExerciseType, ExerciseCreationData } from '@/types/exercise'
import { StrengthMetrics, CardioMetrics } from '@/types/performance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
            <Trophy className="w-8 h-8 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Première performance
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
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
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="20"
                  value={strengthData.weight || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    weight: parseFloat(e.target.value) || 0 
                  }))}
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-sm text-red-600">{errors.weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reps">Répétitions *</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={strengthData.reps || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    reps: parseInt(e.target.value) || 0 
                  }))}
                  className={errors.reps ? 'border-red-500' : ''}
                />
                {errors.reps && (
                  <p className="text-sm text-red-600">{errors.reps}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sets">Séries *</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={strengthData.sets || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    sets: parseInt(e.target.value) || 0 
                  }))}
                  className={errors.sets ? 'border-red-500' : ''}
                />
                {errors.sets && (
                  <p className="text-sm text-red-600">{errors.sets}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rest-seconds">Repos entre séries (sec)</Label>
                <Input
                  id="rest-seconds"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={strengthData.rest_seconds || ''}
                  onChange={(e) => setStrengthData(prev => ({ 
                    ...prev, 
                    rest_seconds: parseInt(e.target.value) || 60 
                  }))}
                />
                <p className="text-xs text-muted-foreground">Temps de récupération entre séries</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpe">RPE (optionnel)</Label>
                <Select
                  value={strengthData.rpe?.toString() || 'undefined'}
                  onValueChange={(value) => setStrengthData(prev => ({ 
                    ...prev, 
                    rpe: value === 'undefined' ? undefined : parseInt(value) 
                  }))}
                >
                  <SelectTrigger id="rpe">
                    <SelectValue placeholder="Non défini" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">Non défini</SelectItem>
                    <SelectItem value="1">1 - Très facile</SelectItem>
                    <SelectItem value="2">2 - Facile</SelectItem>
                    <SelectItem value="3">3 - Modéré</SelectItem>
                    <SelectItem value="4">4 - Difficile</SelectItem>
                    <SelectItem value="5">5 - Très difficile</SelectItem>
                    <SelectItem value="6">6 - Dur</SelectItem>
                    <SelectItem value="7">7 - Très dur</SelectItem>
                    <SelectItem value="8">8 - Extrêmement dur</SelectItem>
                    <SelectItem value="9">9 - Maximum</SelectItem>
                    <SelectItem value="10">10 - Au-delà du maximum</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Rate of Perceived Exertion (1-10)</p>
              </div>
            </div>
          </>
        ) : (
          // Formulaire Cardio
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Durée <span className="text-safe-error">*</span>
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
              </div>

              <div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Distance</label>
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
                      onValueChange={(value) => setCardioData(prev => ({ 
                        ...prev, 
                        distance_unit: value as 'km' | 'm' | 'miles' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">km</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="miles">miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques spécialisées selon l'équipement */}
            {equipmentType === 'rowing' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Métriques rameur</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stroke-rate">Cadence (SPM)</Label>
                    <Input
                      id="stroke-rate"
                      type="number"
                      min="16"
                      max="36"
                      placeholder="24"
                      value={cardioData.rowing?.stroke_rate || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        rowing: { 
                          stroke_rate: parseInt(e.target.value) || 0,
                          watts: prev.rowing?.watts || 0,
                          split_time: prev.rowing?.split_time
                        }
                      }))}
                      className={errors.stroke_rate ? 'border-red-500' : ''}
                    />
                    {errors.stroke_rate && (
                      <p className="text-sm text-red-600">{errors.stroke_rate}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Coups par minute</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="watts">Puissance (watts)</Label>
                    <Input
                      id="watts"
                      type="number"
                      min="50"
                      max="500"
                      placeholder="150"
                      value={cardioData.rowing?.watts || ''}
                      onChange={(e) => setCardioData(prev => ({
                        ...prev,
                        rowing: { 
                          stroke_rate: prev.rowing?.stroke_rate || 0,
                          watts: parseInt(e.target.value) || 0,
                          split_time: prev.rowing?.split_time
                        }
                      }))}
                      className={errors.watts ? 'border-red-500' : ''}
                    />
                    {errors.watts && (
                      <p className="text-sm text-red-600">{errors.watts}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {equipmentType === 'running' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">Métriques course</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speed">Vitesse (km/h)</Label>
                    <Input
                      id="speed"
                      type="number"
                      min="1"
                      max="25"
                      step="0.1"
                      placeholder="8.5"
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
                      className={errors.speed ? 'border-red-500' : ''}
                    />
                    {errors.speed && (
                      <p className="text-sm text-red-600">{errors.speed}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Vitesse moyenne</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incline">Inclinaison (%)</Label>
                    <Input
                      id="incline"
                      type="number"
                      min="0"
                      max="15"
                      step="0.5"
                      placeholder="2.0"
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
                      className={errors.incline ? 'border-red-500' : ''}
                    />
                    {errors.incline && (
                      <p className="text-sm text-red-600">{errors.incline}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Inclinaison tapis</p>
                  </div>
                </div>
              </div>
            )}

            {equipmentType === 'cycling' && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">Métriques vélo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cadence">Cadence (RPM)</Label>
                    <Input
                      id="cadence"
                      type="number"
                      min="50"
                      max="120"
                      placeholder="85"
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
                      className={errors.cadence ? 'border-red-500' : ''}
                    />
                    {errors.cadence && (
                      <p className="text-sm text-red-600">{errors.cadence}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Tours par minute</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resistance">Résistance</Label>
                    <Select
                      value={cardioData.cycling?.resistance?.toString() || '1'}
                      onValueChange={(value) => setCardioData(prev => ({
                        ...prev,
                        cycling: { 
                          cadence: prev.cycling?.cadence || 0,
                          resistance: parseInt(value) || 1,
                          average_speed: prev.cycling?.average_speed,
                          max_speed: prev.cycling?.max_speed
                        }
                      }))}
                    >
                      <SelectTrigger id="resistance" className={errors.resistance ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Niveau 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>Niveau {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.resistance && (
                      <p className="text-sm text-red-600">{errors.resistance}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Niveau de résistance</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Fréquence cardiaque (BPM)</Label>
                <Input
                  id="heart-rate"
                  type="number"
                  min="60"
                  max="200"
                  placeholder="140"
                  value={cardioData.heart_rate || ''}
                  onChange={(e) => setCardioData(prev => ({ 
                    ...prev, 
                    heart_rate: parseInt(e.target.value) || undefined 
                  }))}
                  className={errors.heart_rate ? 'border-red-500' : ''}
                />
                {errors.heart_rate && (
                  <p className="text-sm text-red-600">{errors.heart_rate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Calories brûlées</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  placeholder="250"
                  value={cardioData.calories || ''}
                  onChange={(e) => setCardioData(prev => ({ 
                    ...prev, 
                    calories: parseInt(e.target.value) || undefined 
                  }))}
                  className={errors.calories ? 'border-red-500' : ''}
                />
                {errors.calories && (
                  <p className="text-sm text-red-600">{errors.calories}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            placeholder="Ressenti, observations, modifications..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

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
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Ignorer
            </Button>
            
            <Button
              type="submit"
              variant="orange"
              loading={isLoading}
            >
              <Target className="w-4 h-4 mr-2" />
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