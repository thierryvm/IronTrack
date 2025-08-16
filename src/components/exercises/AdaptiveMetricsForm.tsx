'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Zap, TrendingUp } from 'lucide-react'
import { FormField, Input } from '@/components/ui/form'
import { NumberWheel } from '@/components/ui/NumberWheel'
import { PowerInput2025 } from '@/components/ui/PowerInput2025'
import { TimeInput2025 } from '@/components/ui/TimeInput2025'
import { CadenceInput2025 } from '@/components/ui/CadenceInput2025'
import { CardioMetrics, StrengthMetrics } from '@/types/performance'

interface AdaptiveMetricsFormProps {
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement'
  equipment: string
  exerciseName: string
  cardioData: CardioMetrics
  strengthData: StrengthMetrics
  setCardioData: React.Dispatch<React.SetStateAction<CardioMetrics>>
  setStrengthData: React.Dispatch<React.SetStateAction<StrengthMetrics>>
}

/**
 * Composant qui affiche les métriques appropriées selon l'équipement
 * Basé sur recherche ultrahardcore des métriques par type d'exercice
 */
export function AdaptiveMetricsForm({
  exerciseType,
  equipment,
  exerciseName,
  cardioData,
  strengthData,
  setCardioData,
  setStrengthData
}: AdaptiveMetricsFormProps) {

  // Éviter la boucle infinie - pas de logs en production

  // Détection intelligente de l'équipement - VERSION CORRIGÉE
  const getEquipmentType = (equipment: string, exerciseName: string = '') => {
    const exerciseSearch = (exerciseName || '').toLowerCase()
    const equipmentSearch = (equipment || '').toLowerCase()
    
    // Combine les deux pour la recherche avec normalisation
    const searchText = `${exerciseSearch} ${equipmentSearch}`.trim()
    
    // Debug supprimé pour éviter pollution des tests
    
    // Détection rameur - patterns étendus
    if (searchText.includes('rameur') || 
        searchText.includes('rowing') || 
        searchText.includes('aviron') ||
        (exerciseSearch.includes('rameur') && searchText.includes('endurance'))) {
      // Rameur détecté
      return 'rowing'
    }
    
    // Détection course/tapis
    if (searchText.includes('tapis') || 
        searchText.includes('course') || 
        searchText.includes('running') ||
        searchText.includes('treadmill')) {
      // Course détectée
      return 'running'
    }
    
    // Détection vélo
    if (searchText.includes('vélo') || 
        searchText.includes('bike') || 
        searchText.includes('cycling') ||
        searchText.includes('cyclisme')) {
      // Vélo détecté
      return 'cycling'
    }
    
    // Détection HIIT/Fitness
    if (searchText.includes('hiit') || 
        searchText.includes('fitness') ||
        searchText.includes('tabata') ||
        searchText.includes('circuit')) {
      // HIIT détecté
      return 'hiit'
    }
    
    // Aucun équipement spécialisé détecté
    return 'general'
  }

  const equipmentType = getEquipmentType(equipment, exerciseName)
  
  // Type d'équipement déterminé

  // Rendu des métriques spécialisées par équipement
  const renderSpecializedMetrics = () => {
    if (exerciseType !== 'Cardio') return null

    switch (equipmentType) {
      case 'rowing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900">Métriques Rameur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Split Time - Most important rowing metric */}
              <FormField>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split Time (/500m)
                  </label>
                  <div className="text-lg font-semibold text-blue-900">
                    {cardioData.distance && cardioData.duration_seconds && cardioData.distance > 0
                      ? `${Math.floor((cardioData.duration_seconds / (cardioData.distance / 500)) / 60)}:${String(Math.floor((cardioData.duration_seconds / (cardioData.distance / 500)) % 60)).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Elite: 1:20-1:30 • Good: 1:40-2:00 • Beginner: 2:00+
                  </div>
                </div>
              </FormField>

              {/* SPM - Strokes Per Minute avec CadenceInput2025 */}
              <FormField>
                <CadenceInput2025
                  label="Cadence (SPM)"
                  value={cardioData.rowing?.stroke_rate || 20}
                  onChange={(value) => setCardioData(prev => ({
                    ...prev,
                    rowing: {
                      stroke_rate: value,
                      watts: prev.rowing?.watts || 0
                    }
                  }))}
                  min={16}
                  max={36}
                  step={1}
                  unit="SPM"
                  className="mx-auto"
                />
              </FormField>

              {/* Watts - Power Output avec PowerInput2025 */}
              <FormField>
                <PowerInput2025
                  label="Puissance (Watts)"
                  value={cardioData.rowing?.watts || 150}
                  onChange={(value) => setCardioData(prev => ({
                    ...prev,
                    rowing: {
                      stroke_rate: prev.rowing?.stroke_rate || 0,
                      watts: value
                    }
                  }))}
                  min={50}
                  max={500}
                  step={10}
                  unit="W"
                  presets={[
                    { label: 'Débutant', value: 100 },
                    { label: 'Moyen', value: 150 },
                    { label: 'Bon', value: 200 },
                    { label: 'Excellent', value: 250 },
                    { label: 'Elite', value: 300 }
                  ]}
                  className="mx-auto"
                />
              </FormField>
            </div>
          </motion.div>
        )

      case 'running':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-gray-900">Métriques Course</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Incline */}
              <FormField>
                <Input
                  label="Inclinaison (%)"
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  placeholder="0-15"
                  value={cardioData.running?.incline || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    running: {
                      incline: parseFloat(e.target.value) || 0
                    }
                  }))}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Plat: 0% • Côte douce: 3-6% • Montagne: 10-15%
                </div>
              </FormField>

              {/* Pace calculé automatiquement */}
              <FormField>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allure (min/km)
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {cardioData.distance && cardioData.duration_seconds 
                      ? `${Math.floor((cardioData.duration_seconds / 60) / cardioData.distance)}:${String(Math.floor(((cardioData.duration_seconds / 60) / cardioData.distance % 1) * 60)).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Calculé automatiquement
                  </div>
                </div>
              </FormField>
            </div>
          </motion.div>
        )

      case 'cycling':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-gray-900">Métriques Vélo</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Cadence RPM avec CadenceInput2025 */}
              <FormField>
                <CadenceInput2025
                  label="Cadence (RPM)"
                  value={cardioData.cycling?.cadence || 85}
                  onChange={(value) => setCardioData(prev => ({
                    ...prev,
                    cycling: {
                      cadence: value,
                      resistance: prev.cycling?.resistance || 0
                    }
                  }))}
                  min={50}
                  max={120}
                  step={5}
                  unit="RPM"
                  className="mx-auto"
                />
              </FormField>

              {/* Resistance Level avec NumberWheel */}
              <FormField>
                <NumberWheel
                  label="Résistance (1-20)"
                  value={cardioData.cycling?.resistance || 8}
                  onChange={(value) => setCardioData(prev => ({
                    ...prev,
                    cycling: {
                      cadence: prev.cycling?.cadence || 0,
                      resistance: value
                    }
                  }))}
                  min={1}
                  max={20}
                  step={1}
                  className="mx-auto"
                />
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Facile: 1-5 • Modéré: 6-12 • Difficile: 13-20
                </div>
              </FormField>
            </div>
          </motion.div>
        )

      case 'hiit':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-gray-900">Métriques HIIT</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Work Time */}
              <FormField>
                <Input
                  label="Temps travail (sec)"
                  type="number"
                  min="10"
                  max="300"
                  placeholder="20-60"
                  value={cardioData.duration_seconds || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    duration_seconds: parseInt(e.target.value) || 0
                  }))}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Tabata: 20s • HIIT: 30-60s • EMOM: 60s
                </div>
              </FormField>

              {/* Rounds */}
              <FormField>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format suggéré
                  </label>
                  <div className="text-sm text-gray-900">
                    {cardioData.duration_seconds <= 30 ? 'Tabata (20s/10s)' : 
                     cardioData.duration_seconds <= 60 ? 'HIIT (30s/30s)' : 
                     'Circuit training'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Basé sur la durée de travail
                  </div>
                </div>
              </FormField>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Métriques communes cardio - SUPPRIMÉ car doublons avec formulaire principal
  const renderCommonCardioMetrics = () => {
    // Les champs Heart Rate et Calories sont gérés dans PerformanceAddForm.tsx
    // pour éviter les doublons
    return null
  }

  // Métriques musculation avancées
  const renderStrengthMetrics = () => {
    if (exerciseType !== 'Musculation') return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-orange-800" />
          <h4 className="font-semibold text-gray-900">Métriques Avancées</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* RPE - Rate of Perceived Exertion avec Input simple (peu de valeurs) */}
          <FormField>
            <label htmlFor="rpe" className="block text-sm font-medium text-gray-700 mb-1">
              RPE (1-10)
            </label>
            <Input
              id="rpe"
              type="number"
              min={1}
              max={10}
              value={strengthData.rpe || 7}
              onChange={(e) => setStrengthData(prev => ({
                ...prev,
                rpe: Number(e.target.value)
              }))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              6-7: Could do 2-3 more reps • 8-9: Could do 1 rep • 10: Absolute max
            </div>
          </FormField>

          {/* Rest Time avec TimeInput2025 (valeurs longues 30-300) */}
          <FormField>
            <TimeInput2025
              label="Repos entre séries"
              value={strengthData.rest_seconds || 60}
              onChange={(value) => setStrengthData(prev => ({
                ...prev,
                rest_seconds: value
              }))}
              min={30}
              max={300}
              className="mx-auto"
            />
          </FormField>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {renderCommonCardioMetrics()}
      {renderSpecializedMetrics()}
      {renderStrengthMetrics()}
    </div>
  )
}