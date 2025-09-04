import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Trophy } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'

interface PerformanceEditFormProps {
  exerciseId: string
  performanceId: string
}

interface PerformanceData {
  weight?: number
  reps?: number
  sets?: number
  rest_time?: number
  time_under_tension?: number
  rpe?: number
  distance?: number
  distance_unit?: string
  duration?: number
  speed?: number
  calories?: number
  // Champs cardio avancés
  stroke_rate?: number
  watts?: number
  heart_rate?: number
  incline?: number
  cadence?: number
  resistance?: number
  notes?: string
  performed_at: string
}

interface ExerciseData {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
}

export const PerformanceEditForm: React.FC<PerformanceEditFormProps> = ({ 
  exerciseId, 
  performanceId 
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [exercise, setExercise] = useState<ExerciseData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Chargement performance ID:', performanceId, 'pour exercice ID:', exerciseId)
        const supabase = createClient()
        
        // Récupérer la performance
        const { data: perfData, error: perfError } = await supabase
          .from('performance_logs')
          .select('*')
          .eq('id', performanceId)
          .single()

        if (perfError) {
          console.error('Erreur performance:', perfError)
          throw new Error(`Performance non trouvée: ${perfError.message}`)
        }

        // Récupérer l'exercice
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('name, exercise_type')
          .eq('id', exerciseId)
          .single()

        if (exerciseError) {
          console.error('Erreur exercice:', exerciseError)
          throw new Error(`Exercice non trouvé: ${exerciseError.message}`)
        }

        // Convertir la durée de secondes à minutes pour l'affichage
        const processedPerf = {
          ...perfData,
          duration: perfData.duration ? Math.round(perfData.duration / 60) : undefined
        }

        setPerformance(processedPerf)
        setExercise(exerciseData)
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [performanceId, exerciseId])

  const handleSave = async () => {
    if (!performance) return

    setSaving(true)
    try {
      const supabase = createClient()
      
      const updateData = {
        weight: performance.weight || null,
        reps: performance.reps || null,
        sets: performance.sets || null,
        // Nouvelles métriques musculation
        rest_time: performance.rest_time || null,
        time_under_tension: performance.time_under_tension || null,
        rpe: performance.rpe || null,
        // Métriques cardio
        distance: performance.distance || null,
        distance_unit: performance.distance_unit || null,
        duration: performance.duration ? performance.duration * 60 : null, // Convertir minutes en secondes
        speed: performance.speed || null,
        calories: performance.calories || null,
        // Champs cardio avancés
        stroke_rate: performance.stroke_rate || null,
        watts: performance.watts || null,
        heart_rate: performance.heart_rate || null,
        incline: performance.incline || null,
        cadence: performance.cadence || null,
        resistance: performance.resistance || null,
        notes: performance.notes || null
      }

      const { error } = await supabase
        .from('performance_logs')
        .update(updateData)
        .eq('id', performanceId)

      if (error) throw error

      toast.success('Performance modifiée avec succès !')
      router.push('/exercises')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/exercises')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!performance || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Performance non trouvée</p>
          <button onClick={handleCancel} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-safe-muted" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Modifier la performance
            </h1>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-safe-muted" />
          </button>
        </div>
      </div>

      <div className="py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-lg p-6"
        >
          {/* Info exercice */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <Trophy className="w-6 h-6 text-orange-800 dark:text-orange-300" />
            <div>
              <h2 className="font-semibold text-orange-800 dark:text-orange-300">{exercise.name}</h2>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Performance du {new Date(performance.performed_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {exercise.exercise_type === 'Musculation' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={performance.weight || ''}
                      onChange={(e) => setPerformance({...performance, weight: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Répétitions
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={performance.reps || ''}
                      onChange={(e) => setPerformance({...performance, reps: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de séries
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={performance.sets || ''}
                      onChange={(e) => setPerformance({...performance, sets: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="3"
                    />
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
                      onChange={(e) => setPerformance({...performance, rest_time: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="2"
                    />
                  </div>
                </div>
                
                {/* Métriques avancées musculation */}
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
                        onChange={(e) => setPerformance({...performance, time_under_tension: Number(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        RPE (1-10)
                      </label>
                      <select
                        value={performance.rpe || ''}
                        onChange={(e) => setPerformance({...performance, rpe: Number(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="6">6 - Très facile</option>
                        <option value="7">7 - Facile</option>
                        <option value="8">8 - Modéré</option>
                        <option value="9">9 - Difficile</option>
                        <option value="10">10 - Très difficile</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Métriques de base */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Distance
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={performance.distance || ''}
                        onChange={(e) => setPerformance({...performance, distance: Number(e.target.value)})}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="5"
                      />
                      <select
                        value={performance.distance_unit || 'km'}
                        onChange={(e) => setPerformance({...performance, distance_unit: e.target.value})}
                        className="w-20 sm:w-24 px-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="km">km</option>
                        <option value="meters">m</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={performance.duration || ''}
                      onChange={(e) => setPerformance({...performance, duration: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vitesse (km/h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={performance.speed || ''}
                      onChange={(e) => setPerformance({...performance, speed: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Calories brûlées
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={performance.calories || ''}
                      onChange={(e) => setPerformance({...performance, calories: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="300"
                    />
                  </div>
                </div>

                {/* Métriques spécifiques selon le type d'exercice */}
                {exercise.name.toLowerCase().includes('rameur') && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Métriques rameur</h4>
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
                          onChange={(e) => setPerformance({...performance, stroke_rate: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="24"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Puissance (Watts)
                        </label>
                        <input
                          type="number"
                          min="50"
                          value={performance.watts || ''}
                          onChange={(e) => setPerformance({...performance, watts: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="120"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(exercise.name.toLowerCase().includes('course') || exercise.name.toLowerCase().includes('tapis')) && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Métriques course/tapis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fréquence cardiaque (BPM)
                        </label>
                        <input
                          type="number"
                          min="60"
                          max="220"
                          value={performance.heart_rate || ''}
                          onChange={(e) => setPerformance({...performance, heart_rate: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="140"
                        />
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
                          onChange={(e) => setPerformance({...performance, incline: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {exercise.name.toLowerCase().includes('vélo') && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Métriques vélo</h4>
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
                          onChange={(e) => setPerformance({...performance, cadence: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="80"
                        />
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
                          onChange={(e) => setPerformance({...performance, resistance: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={performance.notes || ''}
                onChange={(e) => setPerformance({...performance, notes: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Commentaires sur cette performance..."
              />
            </div>
          </div>

          {/* Boutons - CORRIGÉ: bouton Sauvegarder aligné à droite */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 dark:bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              <Save className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}