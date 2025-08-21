'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Heart, Zap } from 'lucide-react'
import { ExerciseType } from '@/types/exercise'

interface TypeOption {
  value: ExerciseType
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
}

interface TypeSelectionProps {
  selectedType?: ExerciseType
  onNext: (type: ExerciseType) => void
}

const typeOptions: TypeOption[] = [
  {
    value: 'Musculation',
    title: 'Musculation',
    description: 'Force, masse musculaire, définition',
    icon: Dumbbell,
    color: 'orange'
  },
  {
    value: 'Cardio',
    title: 'Cardio', 
    description: 'Endurance, brûlage calories, condition physique',
    icon: Heart,
    color: 'red'
  }
]

interface TypeCardProps {
  option: TypeOption
  selected: boolean
  onSelect: () => void
}

function TypeCard({ option, selected, onSelect }: TypeCardProps) {
  const { title, description, icon: Icon, color } = option

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 text-left w-full ${
        selected
          ? color === 'orange' 
            ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-lg' 
            : 'border-red-500 bg-red-50 shadow-lg'
          : color === 'orange'
            ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-orange-300 hover:bg-orange-50 dark:bg-orange-900/20'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-red-300 hover:bg-red-50'
      }`}
    >
      <div className={`p-3 rounded-lg ${
        selected 
          ? color === 'orange' ? 'bg-orange-600' : 'bg-red-500'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <Icon className={`h-8 w-8 ${
          selected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
        }`} />
      </div>
      
      <div className="flex-1">
        <h3 className={`text-lg font-semibold mb-1 ${
          selected 
            ? color === 'orange' ? 'text-orange-800 dark:text-orange-300' : 'text-red-800'
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          selected 
            ? color === 'orange' ? 'text-orange-800 dark:text-orange-300' : 'text-red-600'
            : 'text-gray-600 dark:text-gray-300'
        }`}>
          {description}
        </p>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={color === 'orange' ? 'text-orange-800 dark:text-orange-300' : 'text-red-500'}
        >
          <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-full" />
          </div>
        </motion.div>
      )}
    </motion.button>
  )
}

/**
 * Étape 1: Sélection du type d'exercice (Musculation ou Cardio uniquement)
 * Architecture simplifiée focalisée sur les 2 types principaux
 */
export function TypeSelection({ selectedType, onNext }: TypeSelectionProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Zap className="w-8 h-8 text-orange-800 dark:text-orange-300" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Quel type d'exercice créer ?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Choisis le type d'entraînement qui correspond à ton objectif
        </p>
      </motion.div>
      
      <div className="space-y-4">
        {typeOptions.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <TypeCard
              option={option}
              selected={selectedType === option.value}
              onSelect={() => onNext(option.value)}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 text-blue-600">💡</div>
          <h4 className="font-semibold text-blue-800">Conseil</h4>
        </div>
        <p className="text-sm text-blue-700">
          <strong>Musculation</strong> : Exercices avec poids, répétitions et séries (développé couché, squats, etc.)
          <br />
          <strong>Cardio</strong> : Exercices d'endurance avec durée et distance (course, rameur, vélo, etc.)
        </p>
      </motion.div>
    </div>
  )
}