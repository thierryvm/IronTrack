'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import { CustomExercise, ExerciseSuggestion, ExercisePerformance } from '@/types/exercise-wizard'

interface FinalSummaryModalProps {
  isOpen: boolean
  exercise: CustomExercise | ExerciseSuggestion
  performance?: ExercisePerformance
  onConfirm: () => Promise<void>
  loading: boolean
  onClose: () => void
}

export const FinalSummaryModal: React.FC<FinalSummaryModalProps> = ({
  isOpen,
  exercise,
  performance,
  onConfirm,
  loading,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Exercice sauvegardé !
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Votre exercice a été sauvegardé avec succès
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-safe-muted" />
              </button>
            </div>

            {/* Récapitulatif de l'exercice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 mb-6 border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4">{exercise.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">🏋️</span>
                  <span>{'type' in exercise ? exercise.type : exercise.exercise_type}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">📍</span>
                  <span>{exercise.muscle_group}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">⭐</span>
                  <span>{exercise.difficulty}</span>
                </div>
                {'equipment_id' in exercise && exercise.equipment_id && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="font-medium">🛠️</span>
                    <span>{exercise.equipment_name || `Équipement #${exercise.equipment_id}`}</span>
                  </div>
                )}
                {'equipment' in exercise && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="font-medium">🛠️</span>
                    <span>{exercise.equipment}</span>
                  </div>
                )}
                
                {/* Données spécifiques selon le type */}
                {(('type' in exercise ? exercise.type : exercise.exercise_type) === 'Musculation') && 'sets' in exercise && exercise.sets && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="font-medium">🔢</span>
                    <span>{exercise.sets} séries</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">✅</span>
                  <span>Exercice {('type' in exercise ? exercise.type : exercise.exercise_type).toLowerCase()} créé avec succès</span>
                </div>
              </div>
              
              {'description' in exercise && exercise.description && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2 text-orange-700">
                    <span className="font-medium">📝</span>
                    <span className="italic">{exercise.description}</span>
                  </div>
                </div>
              )}
              
            </div>

            {/* Performance Summary */}
            {performance && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Performance ajoutée</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(('type' in exercise ? exercise.type : exercise.exercise_type) === 'Cardio') ? (
                    <>
                      {performance.distance && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">📏</span>
                          <span>
                            {performance.distance}
                            {performance.distance_unit === 'meters' ? 'm' : 'km'}
                          </span>
                        </div>
                      )}
                      {performance.duration && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">⏱️</span>
                          <span>{performance.duration} min</span>
                        </div>
                      )}
                      {performance.speed && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🏃</span>
                          <span>{performance.speed} km/h</span>
                        </div>
                      )}
                      {performance.calories && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🔥</span>
                          <span>{performance.calories} kcal</span>
                        </div>
                      )}
                      {performance.stroke_rate && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🚣</span>
                          <span>{performance.stroke_rate} SPM</span>
                        </div>
                      )}
                      {performance.watts && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">⚡</span>
                          <span>{performance.watts} watts</span>
                        </div>
                      )}
                      {performance.heart_rate && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">❤️</span>
                          <span>{performance.heart_rate} BPM</span>
                        </div>
                      )}
                      {performance.incline && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">📈</span>
                          <span>{performance.incline}% inclinaison</span>
                        </div>
                      )}
                      {performance.cadence && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🚴</span>
                          <span>{performance.cadence} RPM</span>
                        </div>
                      )}
                      {performance.resistance && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">💪</span>
                          <span>Résistance {performance.resistance}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {performance.weight && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🏋️</span>
                          <span>{performance.weight} kg</span>
                        </div>
                      )}
                      {performance.reps && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">🔢</span>
                          <span>{performance.reps} répétitions</span>
                        </div>
                      )}
                      {performance.sets && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">📊</span>
                          <span>{performance.sets} séries</span>
                        </div>
                      )}
                      {performance.rest_time && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">⏸️</span>
                          <span>{performance.rest_time} min repos</span>
                        </div>
                      )}
                      {performance.time_under_tension && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">⏱️</span>
                          <span>{performance.time_under_tension}s TUT</span>
                        </div>
                      )}
                      {performance.rpe && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="font-medium">📈</span>
                          <span>RPE {performance.rpe}/10</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {performance.notes && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2 text-blue-700">
                      <span className="font-medium">💭</span>
                      <span className="italic">{performance.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Votre exercice a été créé avec succès ! Vous pouvez maintenant ajouter des performances depuis la page des exercices.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Mode création uniquement - bouton simple pour terminer */}
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-700"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {loading ? 'Sauvegarde...' : 'Terminer et aller aux exercices'}
                </button>
              </div>
            </div>

            {/* Note d'aide */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                💡 <strong>Astuce :</strong> Vous pourrez toujours ajouter des performances plus tard depuis la page de l'exercice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}