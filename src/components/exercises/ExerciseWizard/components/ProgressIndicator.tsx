import React from 'react'
import { motion } from 'framer-motion'
import { ProgressIndicatorProps } from '@/types/exercise-wizard'

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  variant = 'dots' 
}) => {
  if (variant === 'dots') {
    return (
      <div className="flex justify-center items-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i <= currentStep 
                ? 'bg-orange-500' 
                : 'bg-gray-300'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: i === currentStep ? 1.2 : 1,
              backgroundColor: i <= currentStep ? '#f97316' : '#d1d5db'
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'bar') {
    const progress = ((currentStep + 1) / totalSteps) * 100

    return (
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStep + 1} sur {totalSteps}
          </span>
          <span className="text-sm font-medium text-orange-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'steps') {
    return (
      <div className="flex justify-between items-center mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <motion.div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm ${
                i <= currentStep
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: i === currentStep ? 1.1 : 1,
                borderColor: i <= currentStep ? '#f97316' : '#d1d5db',
                backgroundColor: i <= currentStep ? '#f97316' : '#ffffff'
              }}
              transition={{ duration: 0.3 }}
            >
              {i + 1}
            </motion.div>
            
            {i < totalSteps - 1 && (
              <div className="flex-1 h-px bg-gray-300 mx-4">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: i < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return null
}