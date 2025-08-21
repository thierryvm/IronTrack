'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Zap, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberWheel } from '@/components/ui/NumberWheel'
// Removed deprecated *Migrated imports - using basic shadcn/ui components
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

  // AdaptiveMetricsForm est dédié aux PERFORMANCES (add-performance)
  // Pour les métriques par défaut d'exercice, voir ExerciseDefaultMetricsForm

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
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Métriques Rameur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 items-start">
              {/* Split Time - Most important rowing metric */}
              <div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Split Time (/500m)
                  </label>
                  <div className="text-lg font-semibold text-blue-900">
                    {cardioData.distance && cardioData.duration_seconds && cardioData.distance > 0
                      ? `${Math.floor((cardioData.duration_seconds / (cardioData.distance / 500)) / 60)}:${String(Math.floor((cardioData.duration_seconds / (cardioData.distance / 500)) % 60)).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Elite: 1:20-1:30 • Good: 1:40-2:00 • Beginner: 2:00+
                  </div>
                </div>
              </div>

              {/* SPM - Strokes Per Minute */}
              <div className="flex flex-col h-full">
                <Label htmlFor="stroke-rate">Cadence (SPM)</Label>
                <Input
                  id="stroke-rate"
                  type="number"
                  min={16}
                  max={36}
                  step={1}
                  placeholder="20-28"
                  value={cardioData.rowing?.stroke_rate || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    rowing: {
                      stroke_rate: parseInt(e.target.value) || 20,
                      watts: prev.rowing?.watts || 0
                    }
                  }))}
                  className="text-center"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Débutant: 20-24 • Expérimenté: 26-32 SPM
                </div>
              </div>

              {/* Watts - Power Output */}
              <div className="flex flex-col h-full">
                <Label htmlFor="watts">Puissance (Watts)</Label>
                <Input
                  id="watts"
                  type="number"
                  min={50}
                  max={500}
                  step={10}
                  placeholder="100-300"
                  value={cardioData.rowing?.watts || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    rowing: {
                      stroke_rate: prev.rowing?.stroke_rate || 0,
                      watts: parseInt(e.target.value) || 150
                    }
                  }))}
                  className="text-center"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Débutant: 100W • Moyen: 150W • Bon: 200W+
                </div>
              </div>
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
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Métriques Course</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Incline */}
              <div>
                <Label htmlFor="incline">Inclinaison (%)</Label>
                <Input
                  id="incline"
                  type="number"
                  min="-15"
                  max="15"
                  step="0.5"
                  placeholder="-15 à +15"
                  value={cardioData.running?.incline || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    running: {
                      incline: parseFloat(e.target.value) || 0
                    }
                  }))}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Descente: -15 à -3% • Plat: 0% • Côte: 3-15%
                </div>
              </div>

              {/* Pace calculé automatiquement */}
              <div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Allure (min/km)
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {cardioData.distance && cardioData.duration_seconds 
                      ? `${Math.floor((cardioData.duration_seconds / 60) / cardioData.distance)}:${String(Math.floor(((cardioData.duration_seconds / 60) / cardioData.distance % 1) * 60)).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Calculé automatiquement
                  </div>
                </div>
              </div>
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
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Métriques Vélo</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Cadence RPM */}
              <div>
                <Label htmlFor="cadence">Cadence (RPM)</Label>
                <Input
                  id="cadence"
                  type="number"
                  min={50}
                  max={120}
                  step={5}
                  placeholder="80-90"
                  value={cardioData.cycling?.cadence || ''}
                  onChange={(e) => setCardioData(prev => ({
                    ...prev,
                    cycling: {
                      cadence: parseInt(e.target.value) || 85,
                      resistance: prev.cycling?.resistance || 0
                    }
                  }))}
                  className="text-center"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Endurance: 80-90 • Sprint: 100-120 RPM
                </div>
              </div>

              {/* Resistance Level avec NumberWheel */}
              <div>
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
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                  Facile: 1-5 • Modéré: 6-12 • Difficile: 13-20
                </div>
              </div>
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
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Métriques HIIT</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Work Time */}
              <div>
                <Label htmlFor="work-time">Temps travail (sec)</Label>
                <Input
                  id="work-time"
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
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tabata: 20s • HIIT: 30-60s • EMOM: 60s
                </div>
              </div>

              {/* Rounds */}
              <div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format suggéré
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {cardioData.duration_seconds <= 30 ? 'Tabata (20s/10s)' : 
                     cardioData.duration_seconds <= 60 ? 'HIIT (30s/30s)' : 
                     'Circuit training'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Basé sur la durée de travail
                  </div>
                </div>
              </div>
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
          <TrendingUp className="w-5 h-5 text-orange-800 dark:text-orange-300" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Métriques Avancées</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* RPE - Rate of Perceived Exertion */}
          <div className="space-y-2">
            <Label htmlFor="rpe">RPE (1-10)</Label>
            <Input
              id="rpe"
              type="number"
              min={1}
              max={10}
              placeholder="7"
              value={strengthData.rpe || ''}
              onChange={(e) => setStrengthData(prev => ({
                ...prev,
                rpe: e.target.value ? Number(e.target.value) : undefined
              }))}
              className="text-center"
              aria-describedby="rpe-help"
            />
            <p id="rpe-help" className="text-xs text-muted-foreground">
              6-7: Pourriez faire 2-3 rép. de plus • 8-9: Pourriez faire 1 rép. de plus • 10: Maximum absolu
            </p>
          </div>

          {/* Rest Time */}
          <div className="space-y-2">
            <Label htmlFor="rest-time">Repos entre séries (sec)</Label>
            <Input
              id="rest-time"
              type="number"
              min={30}
              max={300}
              step={15}
              placeholder="60"
              value={strengthData.rest_seconds ? Math.round(strengthData.rest_seconds) : ''}
              onChange={(e) => setStrengthData(prev => ({
                ...prev,
                rest_seconds: parseInt(e.target.value) || 60
              }))}
              className="text-center"
              aria-describedby="rest-time-help"
            />
            <p id="rest-time-help" className="text-xs text-muted-foreground">
              Force: 120-180s • Hypertrophie: 60-90s • Endurance: 30-60s
            </p>
          </div>
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