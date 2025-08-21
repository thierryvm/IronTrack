import React from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Target, Zap, Heart, Flower2, Flame } from 'lucide-react'
import { TypeCardProps } from '@/types/exercise-wizard'

const TypeCard: React.FC<TypeCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  selected, 
  onClick 
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center space-x-4 p-6 rounded-xl border-2 transition-all duration-200 text-left w-full ${
      selected
        ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-orange-300 hover:bg-orange-50 dark:bg-orange-900/20'
    }`}
  >
    <div className={`p-3 rounded-lg ${
      selected ? 'bg-orange-600' : 'bg-gray-100 dark:bg-gray-800'
    }`}>
      <Icon className={`h-8 w-8 ${
        selected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
      }`} />
    </div>
    <div className="flex-1">
      <h3 className={`text-lg font-semibold mb-1 ${
        selected ? 'text-orange-800 dark:text-orange-300' : 'text-gray-900 dark:text-gray-100'
      }`}>
        {title}
      </h3>
      <p className={`text-sm ${
        selected ? 'text-orange-800 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'
      }`}>
        {description}
      </p>
    </div>
    {selected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-orange-800 dark:text-orange-300"
      >
        <Target className="w-6 h-6" />
      </motion.div>
    )}
  </motion.button>
)

interface TypeSelectionProps {
  selectedType?: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement'
  onNext: (type: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement' | 'Échauffement') => void
}

export const TypeSelection: React.FC<TypeSelectionProps> = ({ 
  selectedType, 
  onNext 
}) => {
  const exerciseTypes = [
    {
      value: 'Musculation' as const,
      title: 'Musculation',
      description: 'Force, masse musculaire, définition',
      icon: Dumbbell
    },
    {
      value: 'Cardio' as const,
      title: 'Cardio',
      description: 'Endurance, brûlage calories, condition physique',
      icon: Heart
    },
    {
      value: 'Fitness' as const,
      title: 'Fitness',
      description: 'Exercices fonctionnels, gainage, pliométrie',
      icon: Zap
    },
    {
      value: 'Étirement' as const,
      title: 'Étirement',
      description: 'Mobilité, flexibilité, récupération',
      icon: Flower2
    },
    {
      value: 'Échauffement' as const,
      title: 'Échauffement',
      description: 'Mobilisation, activation, préparation',
      icon: Flame
    }
  ]

  return (
    <div className="wizard-step max-w-2xl mx-auto">
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
          Quel type d'exercice aujourd'hui ?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Choisis le type d'entraînement qui correspond à tes objectifs
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {exerciseTypes.map((type, index) => (
          <motion.div
            key={type.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <TypeCard
              title={type.title}
              description={type.description}
              icon={type.icon}
              selected={selectedType === type.value}
              onClick={() => onNext(type.value)}
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
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">💡 Conseil</h4>
        </div>
        <p className="text-sm text-blue-700">
          Pas sûr de ton choix ? L'<strong>échauffement</strong> prépare le corps, la <strong>musculation</strong> développe force et muscle, 
          le <strong>cardio</strong> améliore l'endurance, le <strong>fitness</strong> combine force et cardio, 
          et les <strong>étirements</strong> améliorent la mobilité. Tu peux toujours changer plus tard !
        </p>
      </motion.div>
    </div>
  )
}