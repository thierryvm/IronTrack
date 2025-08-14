'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FormField2025 } from '@/components/ui/FormField2025'
import { Input2025 } from '@/components/ui/Input2025'
import { Textarea2025 } from '@/components/ui/Textarea2025'
import { Dumbbell, Heart, Zap, Flower2, Flame } from 'lucide-react'

type ExerciseType = 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'

interface PerformanceData {
  // Musculation
  sets?: number
  repetitions?: number
  weight_kg?: number
  tempo?: string
  rest_between_sets?: number
  rir?: number
  
  // Cardio
  duration?: number
  distance_m?: number
  pace?: string
  heart_rate_avg?: number
  
  // Fitness
  intensity_level?: 'facile' | 'modéré' | 'intense'
  
  // Étirement
  side?: 'gauche' | 'droite' | 'les deux'
  
  // Commun
  estimated_calories?: number
  notes?: string
}

interface DynamicFieldsByTypeProps {
  exerciseType: ExerciseType
  data: PerformanceData
  onChange: (data: PerformanceData) => void
  errors?: Record<string, string>
  className?: string
}

export const DynamicFieldsByType: React.FC<DynamicFieldsByTypeProps> = ({
  exerciseType,
  data,
  onChange,
  errors = {},
  className = ''
}) => {
  const updateField = (field: keyof PerformanceData, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const getIcon = () => {
    switch (exerciseType) {
      case 'Musculation': return <Dumbbell className="h-5 w-5 text-orange-800" />
      case 'Cardio': return <Heart className="h-5 w-5 text-red-500" />
      case 'Fitness': return <Zap className="h-5 w-5 text-yellow-500" />
      case 'Étirement': return <Flower2 className="h-5 w-5 text-green-500" />
      case 'Échauffement': return <Flame className="h-5 w-5 text-blue-500" />
    }
  }

  const renderMusculationFields = () => (
    <motion.div
      key="musculation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField2025
          label="Nombre de séries"
          required
          error={errors.sets}
        >
          <Input2025
            type="number"
            min="1"
            max="20"
            value={data.sets || ''}
            onChange={(e) => updateField('sets', Number(e.target.value))}
            placeholder="3"
            isError={!!errors.sets}
          />
        </FormField2025>

        <FormField2025
          label="Répétitions par série"
          required
          error={errors.repetitions}
        >
          <Input2025
            type="number"
            min="1"
            max="100"
            value={data.repetitions || ''}
            onChange={(e) => updateField('repetitions', Number(e.target.value))}
            placeholder="10"
            isError={!!errors.repetitions}
          />
        </FormField2025>

        <FormField2025
          label="Poids (kg)"
          required
          error={errors.weight_kg}
        >
          <Input2025
            type="number"
            min="0"
            step="0.5"
            value={data.weight_kg || ''}
            onChange={(e) => updateField('weight_kg', Number(e.target.value))}
            placeholder="20"
            isError={!!errors.weight_kg}
          />
        </FormField2025>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField2025
          label="Tempo (optionnel)"
          helpText="Ex: 2-1-2 (montée-pause-descente)"
        >
          <Input2025
            type="text"
            value={data.tempo || ''}
            onChange={(e) => updateField('tempo', e.target.value)}
            placeholder="2-1-2"
          />
        </FormField2025>

        <FormField2025
          label="Repos entre séries (min)"
        >
          <Input2025
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={data.rest_between_sets || ''}
            onChange={(e) => updateField('rest_between_sets', Number(e.target.value))}
            placeholder="2"
          />
        </FormField2025>

        <FormField2025
          label="RIR (optionnel)"
          helpText="Reps in Reserve (0-5)"
        >
          <Input2025
            type="number"
            min="0"
            max="5"
            value={data.rir || ''}
            onChange={(e) => updateField('rir', Number(e.target.value))}
            placeholder="2"
          />
        </FormField2025>
      </div>
    </motion.div>
  )

  const renderCardioFields = () => (
    <motion.div
      key="cardio"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Durée (minutes)"
          required
          error={errors.duration}
        >
          <Input2025
            type="number"
            min="1"
            step="0.1"
            value={data.duration ? Math.round(data.duration / 60 * 10) / 10 : ''}
            onChange={(e) => updateField('duration', Math.round(Number(e.target.value) * 60))}
            placeholder="30"
            isError={!!errors.duration}
          />
        </FormField2025>

        <FormField2025
          label="Distance (m)"
        >
          <Input2025
            type="number"
            min="0"
            value={data.distance_m || ''}
            onChange={(e) => updateField('distance_m', Number(e.target.value))}
            placeholder="2000"
          />
        </FormField2025>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Allure (min/km) (optionnel)"
        >
          <Input2025
            type="text"
            value={data.pace || ''}
            onChange={(e) => updateField('pace', e.target.value)}
            placeholder="5:30"
          />
        </FormField2025>

        <FormField2025
          label="Fréquence cardiaque moyenne (BPM)"
        >
          <Input2025
            type="number"
            min="60"
            max="200"
            value={data.heart_rate_avg || ''}
            onChange={(e) => updateField('heart_rate_avg', Number(e.target.value))}
            placeholder="150"
          />
        </FormField2025>
      </div>
    </motion.div>
  )

  const renderFitnessFields = () => (
    <motion.div
      key="fitness"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Nombre de séries"
          required
          error={errors.sets}
        >
          <Input2025
            type="number"
            min="1"
            max="20"
            value={data.sets || ''}
            onChange={(e) => updateField('sets', Number(e.target.value))}
            placeholder="3"
            isError={!!errors.sets}
          />
        </FormField2025>

        <FormField2025
          label="Répétitions OU Durée"
          helpText="Répétitions (ex: 20) ou durée en secondes (ex: 60)"
        >
          <div className="flex gap-3">
            <Input2025
              type="number"
              min="1"
              value={data.repetitions || ''}
              onChange={(e) => updateField('repetitions', Number(e.target.value))}
              placeholder="20 reps"
              className="flex-1"
            />
            <span className="self-center text-gray-500">ou</span>
            <Input2025
              type="number"
              min="1"
              value={data.duration || ''}
              onChange={(e) => updateField('duration', Number(e.target.value))}
              placeholder="60s"
              className="flex-1"
            />
          </div>
        </FormField2025>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Repos entre séries (min)"
        >
          <Input2025
            type="number"
            min="0.5"
            max="5"
            step="0.5"
            value={data.rest_between_sets || ''}
            onChange={(e) => updateField('rest_between_sets', Number(e.target.value))}
            placeholder="1.5"
          />
        </FormField2025>

        <FormField2025
          label="Intensité"
        >
          <select
            value={data.intensity_level || 'modéré'}
            onChange={(e) => updateField('intensity_level', e.target.value as 'facile' | 'modéré' | 'intense')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="facile">Facile</option>
            <option value="modéré">Modéré</option>
            <option value="intense">Intense</option>
          </select>
        </FormField2025>
      </div>

      {/* Option pour variante lestée */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={!!data.weight_kg}
            onChange={(e) => {
              if (!e.target.checked) {
                updateField('weight_kg', undefined)
              }
            }}
            className="rounded border-gray-300 text-orange-800 focus:ring-orange-500"
          />
          <span className="text-sm font-medium text-blue-900">Variante lestée</span>
        </label>
        {data.weight_kg !== undefined && (
          <div className="mt-3">
            <FormField2025 label="Poids supplémentaire (kg)">
              <Input2025
                type="number"
                min="0"
                step="0.5"
                value={data.weight_kg || ''}
                onChange={(e) => updateField('weight_kg', Number(e.target.value))}
                placeholder="10"
              />
            </FormField2025>
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderEtirementFields = () => (
    <motion.div
      key="etirement"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Durée totale (minutes)"
          required
          error={errors.duration}
        >
          <Input2025
            type="number"
            min="1"
            step="0.5"
            value={data.duration ? Math.round(data.duration / 60 * 10) / 10 : ''}
            onChange={(e) => updateField('duration', Math.round(Number(e.target.value) * 60))}
            placeholder="15"
            isError={!!errors.duration}
          />
        </FormField2025>

        <FormField2025
          label="Côté travaillé"
        >
          <select
            value={data.side || 'les deux'}
            onChange={(e) => updateField('side', e.target.value as 'gauche' | 'droite' | 'les deux')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="les deux">Les deux côtés</option>
            <option value="gauche">Côté gauche</option>
            <option value="droite">Côté droit</option>
          </select>
        </FormField2025>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Nombre de positions (optionnel)"
        >
          <Input2025
            type="number"
            min="1"
            max="10"
            value={data.sets || ''}
            onChange={(e) => updateField('sets', Number(e.target.value))}
            placeholder="5"
          />
        </FormField2025>

        <FormField2025
          label="Temps de maintien par position (s)"
        >
          <Input2025
            type="number"
            min="10"
            max="120"
            step="5"
            value={data.rest_between_sets ? data.rest_between_sets * 60 : ''}
            onChange={(e) => updateField('rest_between_sets', Number(e.target.value) / 60)}
            placeholder="30"
          />
        </FormField2025>
      </div>
    </motion.div>
  )

  const renderEchauffementFields = () => (
    <motion.div
      key="echauffement"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Durée totale (minutes)"
          required
          error={errors.duration}
        >
          <Input2025
            type="number"
            min="1"
            max="15"
            step="0.5"
            value={data.duration ? Math.round(data.duration / 60 * 10) / 10 : ''}
            onChange={(e) => updateField('duration', Math.round(Number(e.target.value) * 60))}
            placeholder="10"
            isError={!!errors.duration}
          />
        </FormField2025>

        <FormField2025
          label="Nombre d'exercices"
          helpText="Nombre de mouvements différents"
        >
          <Input2025
            type="number"
            min="1"
            max="10"
            value={data.sets || ''}
            onChange={(e) => updateField('sets', Number(e.target.value))}
            placeholder="6"
          />
        </FormField2025>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Intensité"
          helpText="Niveau d'activation musculaire"
        >
          <select
            value={data.intensity_level || 'facile'}
            onChange={(e) => updateField('intensity_level', e.target.value as 'facile' | 'modéré' | 'intense')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="facile">Facile - Activation douce</option>
            <option value="modéré">Modéré - Préparation standard</option>
            <option value="intense">Intense - Préparation sportive</option>
          </select>
        </FormField2025>

        <FormField2025
          label="Temps de repos (secondes)"
          helpText="Pause entre chaque exercice"
        >
          <Input2025
            type="number"
            min="5"
            max="60"
            step="5"
            value={data.rest_between_sets ? data.rest_between_sets * 60 : ''}
            onChange={(e) => updateField('rest_between_sets', Number(e.target.value) / 60)}
            placeholder="15"
          />
        </FormField2025>
      </div>

      {/* Info pédagogique échauffement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">💡 Conseils échauffement</span>
        </div>
        <p className="text-sm text-blue-700">
          Un bon échauffement dure 5-15 minutes et augmente progressivement l'intensité. 
          Commence par de la mobilisation articulaire puis ajoute des mouvements dynamiques.
        </p>
      </div>
    </motion.div>
  )

  const renderCommonFields = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6 border-t border-gray-200 pt-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField2025
          label="Calories estimées"
          helpText="Calculé automatiquement ou renseigné manuellement"
        >
          <Input2025
            type="number"
            min="0"
            value={data.estimated_calories || ''}
            onChange={(e) => updateField('estimated_calories', Number(e.target.value))}
            placeholder="300"
          />
        </FormField2025>
      </div>

      <FormField2025
        label="Notes"
        helpText="Ressenti, observations, modifications..."
      >
        <Textarea2025
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
          placeholder="Ressenti général, points d'attention, modifications apportées..."
          autoResize
        />
      </FormField2025>
    </motion.div>
  )

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header avec type d'exercice */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        {getIcon()}
        <h3 className="text-lg font-semibold text-gray-900">
          Métriques pour {exerciseType}
        </h3>
      </div>

      {/* Champs dynamiques selon le type */}
      <AnimatePresence mode="wait">
        {exerciseType === 'Musculation' && renderMusculationFields()}
        {exerciseType === 'Cardio' && renderCardioFields()}
        {exerciseType === 'Fitness' && renderFitnessFields()}
        {exerciseType === 'Étirement' && renderEtirementFields()}
        {exerciseType === 'Échauffement' && renderEchauffementFields()}
      </AnimatePresence>

      {/* Champs communs */}
      {renderCommonFields()}
    </div>
  )
}