'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Trophy, Trash2, Edit3, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

interface Exercise {
  id: number
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  description?: string
  instructions?: string
  image_url?: string
  sets?: number
  reps?: number
  duration?: number
  distance?: number
  rest_time?: number
}

interface Performance {
  id: number
  performed_at: string
  weight?: number
  reps?: number
  duration?: number
  distance?: number
  calories?: number
  speed?: number
  notes?: string
  set_number?: number
}

interface ExerciseDetailsModalProps {
  exerciseId: string
  isOpen: boolean
  onClose: () => void
}

export const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({
  exerciseId,
  isOpen,
  onClose
}) => {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [performances, setPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [perfToDelete, setPerfToDelete] = useState<Performance | null>(null)
  const router = useRouter()

  const loadExerciseData = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Charger les données de l'exercice
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*, image_url')
        .eq('id', exerciseId)
        .single()

      if (exerciseError) throw exerciseError

      // Charger les performances
      const { data: performanceData, error: perfError } = await supabase
        .from('performance_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('performed_at', { ascending: false })

      if (perfError) throw perfError

      setExercise(exerciseData)
      setPerformances(performanceData || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }, [exerciseId])

  useEffect(() => {
    if (isOpen && exerciseId) {
      loadExerciseData()
    }
  }, [isOpen, exerciseId, loadExerciseData])

  const handleDeletePerformance = async (performance: Performance) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('performance_logs')
        .delete()
        .eq('id', performance.id)

      if (error) throw error

      // Recharger les performances
      await loadExerciseData()
      setDeleteModalOpen(false)
      setPerfToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const getPerfLabel = (perf: Performance, exerciseType: string, exerciseName?: string) => {
    if (exerciseType === 'Cardio') {
      const parts = []
      const isRowing = exerciseName?.toLowerCase().includes('rameur')
      
      if (perf.distance) {
        // Adapter l'unité selon le type d'exercice
        if (isRowing && perf.distance >= 100) {
          parts.push(`${perf.distance}m`)
        } else {
          parts.push(`${perf.distance}km`)
        }
      }
      if (perf.duration) parts.push(`${Math.round(perf.duration / 60)}min`)
      if (perf.calories) parts.push(`${perf.calories} kcal`)
      
      return parts.join(' • ') || 'Performance cardio'
    } else {
      const parts = []
      if (perf.weight) parts.push(`${perf.weight}kg`)
      if (perf.reps) parts.push(`${perf.reps} reps`)
      return parts.join(' × ') || 'Performance musculation'
    }
  }

  const lastPerf = performances[0]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 text-center flex-1">
              Détails de l'exercice
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : exercise ? (
              <div className="space-y-6">
                {/* Photo de l'exercice */}
                {exercise.image_url && (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={exercise.image_url}
                      alt={`Photo de ${exercise.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                )}
                {/* Info exercice */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                      {exercise.muscle_group}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {exercise.equipment}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {exercise.difficulty}
                    </span>
                  </div>
                  {exercise.description && (
                    <p className="mt-3 text-gray-600">{exercise.description}</p>
                  )}
                </div>

                {/* Dernière performance */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  {lastPerf ? (
                    <span className="text-gray-800">
                      Dernière : <span className="font-bold">{getPerfLabel(lastPerf, exercise.exercise_type, exercise.name)}</span>
                      <span className="text-gray-400 ml-2">
                        ({new Date(lastPerf.performed_at).toLocaleDateString()})
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500">Aucune performance enregistrée</span>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose()
                      router.push(`/exercises/${exerciseId}/edit-exercise`)
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier l'exercice
                  </button>
                  <button
                    onClick={() => {
                      onClose()
                      router.push(`/exercises/${exerciseId}/add-performance`)
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle performance
                  </button>
                </div>

                {/* Historique des performances */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Historique des performances ({performances.length})
                  </h4>
                  
                  {performances.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>Aucune performance enregistrée pour cet exercice.</p>
                      <p className="text-sm mt-1">Ajoutez votre première performance !</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {performances.map((perf) => (
                        <div
                          key={perf.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-900">
                                  {getPerfLabel(perf, exercise.exercise_type, exercise.name)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(perf.performed_at).toLocaleDateString()}
                                </span>
                              </div>
                              {perf.notes && (
                                <p className="text-sm text-gray-600 mt-1">{perf.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onClose()
                                  router.push(`/exercises/${exerciseId}/edit-performance/${perf.id}`)
                                }}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier cette performance"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPerfToDelete(perf)
                                  setDeleteModalOpen(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-red-500">
                Erreur lors du chargement de l'exercice
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de confirmation de suppression */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => perfToDelete && handleDeletePerformance(perfToDelete)}
          title="Supprimer la performance"
          message={`Êtes-vous sûr de vouloir supprimer cette performance ? Cette action est irréversible.`}
          confirmText="Supprimer"
        />
      </div>
    </AnimatePresence>
  )
}