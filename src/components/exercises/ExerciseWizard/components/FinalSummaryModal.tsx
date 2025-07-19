'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'
import { CustomExercise } from '@/types/exercise-wizard'

interface FinalSummaryModalProps {
  isOpen: boolean
  exercise: CustomExercise
  onClose: () => void
}

export const FinalSummaryModal: React.FC<FinalSummaryModalProps> = ({
  isOpen,
  exercise,
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
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Modifications sauvegardées !' : 'Exercice créé !'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {isEditMode ? 'Vos modifications ont été sauvegardées avec succès' : 'Votre exercice est prêt'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Récapitulatif de l'exercice */}
            <div className="bg-orange-50 rounded-xl p-6 mb-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">{exercise.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">🏋️</span>
                  <span>{exercise.exercise_type}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">📍</span>
                  <span>{exercise.muscle_group}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <span className="font-medium">⭐</span>
                  <span>{exercise.difficulty}</span>
                </div>
                {exercise.equipment_id && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="font-medium">🛠️</span>
                    <span>{exercise.equipment_name || `Équipement #${exercise.equipment_id}`}</span>
                  </div>
                )}
                
                {/* Données spécifiques selon le type */}
                {exercise.exercise_type === 'Musculation' && exercise.sets && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <span className="font-medium">🔢</span>
                    <span>{exercise.sets} séries</span>
                  </div>
                )}
                
                {exercise.exercise_type === 'Cardio' && (
                  <>
                    {exercise.distance && (
                      <div className="flex items-center gap-2 text-orange-700">
                        <span className="font-medium">📏</span>
                        <span>{exercise.distance} {exercise.distance_unit || 'km'}</span>
                      </div>
                    )}
                    {exercise.speed && (
                      <div className="flex items-center gap-2 text-orange-700">
                        <span className="font-medium">⚡</span>
                        <span>{exercise.speed} {exercise.speed_unit || 'km/h'}</span>
                      </div>
                    )}
                    {exercise.calories && (
                      <div className="flex items-center gap-2 text-orange-700">
                        <span className="font-medium">🔥</span>
                        <span>{exercise.calories} kcal</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {exercise.description && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2 text-orange-700">
                    <span className="font-medium">📝</span>
                    <span className="italic">{exercise.description}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Votre exercice a été créé avec succès ! Vous pouvez maintenant ajouter des performances depuis la page des exercices.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Mode création uniquement - bouton simple pour terminer */}
                <button
                  onClick={onClose}
                  className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Terminer et aller aux exercices
                </button>
              </div>
            </div>

            {/* Note d'aide */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                💡 <strong>Astuce :</strong> Vous pourrez toujours {isEditMode ? 'modifier cet exercice' : 'ajouter des performances'} plus tard depuis la page de l&apos;exercice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}