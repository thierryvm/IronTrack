'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Calendar, Target } from 'lucide-react'
import { DynamicFieldsByType } from './DynamicFieldsByType'
import { FormField2025 } from '@/components/ui/FormField2025'
import { Input2025 } from '@/components/ui/Input2025'
import { Button2025 } from '@/components/ui/Button2025'

type ExerciseType = 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement'

interface PerformanceData {
  // Type d'exercice
  exercise_type: ExerciseType
  performed_at: string
  
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

export const PerformanceFormDemo2025: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    exercise_type: 'Musculation',
    performed_at: new Date().toISOString().slice(0, 16)
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (newType: ExerciseType) => {
    // Réinitialiser les champs spécifiques quand on change de type
    setPerformanceData({
      exercise_type: newType,
      performed_at: performanceData.performed_at,
      notes: performanceData.notes,
      estimated_calories: performanceData.estimated_calories
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation selon le type d'exercice
    switch (performanceData.exercise_type) {
      case 'Musculation':
        if (!performanceData.sets || performanceData.sets <= 0) {
          newErrors.sets = 'Le nombre de séries est requis'
        }
        if (!performanceData.repetitions || performanceData.repetitions <= 0) {
          newErrors.repetitions = 'Le nombre de répétitions est requis'
        }
        if (!performanceData.weight_kg || performanceData.weight_kg <= 0) {
          newErrors.weight_kg = 'Le poids est requis'
        }
        break

      case 'Cardio':
        if (!performanceData.duration || performanceData.duration <= 0) {
          newErrors.duration = 'La durée est requise'
        }
        break

      case 'Fitness':
        if (!performanceData.sets || performanceData.sets <= 0) {
          newErrors.sets = 'Le nombre de séries est requis'
        }
        if (!performanceData.repetitions && !performanceData.duration) {
          newErrors.repetitions = 'Les répétitions ou la durée sont requises'
        }
        break

      case 'Étirement':
        if (!performanceData.duration || performanceData.duration <= 0) {
          newErrors.duration = 'La durée est requise'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Performance data:', performanceData)
      alert('Performance enregistrée avec succès!')
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button2025
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button2025>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-800" />
                  Nouvelle performance
                </h1>
                <p className="text-sm text-gray-500">Démonstration des champs dynamiques</p>
              </div>
            </div>
            
            <Button2025
              onClick={handleSave}
              loading={saving}
              icon={<Save className="h-4 w-4" />}
            >
              Enregistrer
            </Button2025>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Form Content */}
          <div className="p-6 space-y-8">
            
            {/* Sélection du type d'exercice */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Type d'exercice
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['Musculation', 'Cardio', 'Fitness', 'Étirement'] as const).map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      p-4 border-2 rounded-xl text-left transition-all duration-200
                      ${performanceData.exercise_type === type
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-sm">{type}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-800" />
                Date de la performance
              </h3>
              
              <FormField2025 label="Date et heure">
                <Input2025
                  type="datetime-local"
                  value={performanceData.performed_at}
                  onChange={(e) => setPerformanceData({
                    ...performanceData, 
                    performed_at: e.target.value
                  })}
                />
              </FormField2025>
            </div>

            {/* Champs dynamiques selon le type */}
            <DynamicFieldsByType
              exerciseType={performanceData.exercise_type}
              data={performanceData}
              onChange={(newData) => setPerformanceData({
                ...performanceData,
                ...newData
              })}
              errors={errors}
            />
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button2025
                variant="outline"
                disabled={saving}
                fullWidth
                className="sm:w-auto"
              >
                Annuler
              </Button2025>
              <Button2025
                onClick={handleSave}
                loading={saving}
                icon={!saving ? <Save className="h-4 w-4" /> : undefined}
                fullWidth
                className="sm:w-auto"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer la performance'}
              </Button2025>
            </div>
          </div>
        </div>

        {/* Résumé des données (pour démo) */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Données actuelles (pour démo) :</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(performanceData, null, 2)}
          </pre>
        </div>
      </motion.div>
    </div>
  )
}