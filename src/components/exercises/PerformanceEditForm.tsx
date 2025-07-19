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
  distance?: number
  duration?: number
  speed?: number
  calories?: number
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
        distance: performance.distance || null,
        duration: performance.duration ? performance.duration * 60 : null, // Convertir minutes en secondes
        speed: performance.speed || null,
        calories: performance.calories || null,
        notes: performance.notes || null
      }

      const { error } = await supabase
        .from('performance_logs')
        .update(updateData)
        .eq('id', performanceId)

      if (error) throw error

      toast.success('Performance modifiée avec succès !')
      router.push(`/exercises/${exerciseId}`)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/exercises/${exerciseId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!performance || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Modifier la performance
            </h1>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6"
        >
          {/* Info exercice */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Trophy className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="font-semibold text-orange-800">{exercise.name}</h2>
              <p className="text-sm text-orange-600">
                Performance du {new Date(performance.performed_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {exercise.exercise_type === 'Musculation' ? (
              <>
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
                      onChange={(e) => setPerformance({...performance, weight: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="60"
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
                      onChange={(e) => setPerformance({...performance, reps: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de séries
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={performance.sets || ''}
                    onChange={(e) => setPerformance({...performance, sets: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="3"
                  />
                </div>
              </>
            ) : (
              <>
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
                      onChange={(e) => setPerformance({...performance, distance: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="5"
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
                      onChange={(e) => setPerformance({...performance, duration: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="30"
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
                      onChange={(e) => setPerformance({...performance, speed: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="10"
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
                      onChange={(e) => setPerformance({...performance, calories: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="300"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={performance.notes || ''}
                onChange={(e) => setPerformance({...performance, notes: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Commentaires sur cette performance..."
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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