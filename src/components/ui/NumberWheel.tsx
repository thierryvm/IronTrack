import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

interface NumberWheelProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

export const NumberWheel: React.FC<NumberWheelProps> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  step = 1,
  label,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Générer la liste des valeurs possibles
  const values = useMemo(() => {
    const result = []
    for (let i = min; i <= max; i += step) {
      result.push(i)
    }
    return result
  }, [min, max, step])

  const currentIndex = values.findIndex(v => v === value)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const deltaY = startY - e.clientY
    const sensitivity = 10 // pixels per step
    const steps = Math.round(deltaY / sensitivity)
    const newIndex = Math.max(0, Math.min(values.length - 1, values.findIndex(v => v === startValue) + steps))
    
    if (values[newIndex] !== value) {
      onChange(values[newIndex])
    }
  }, [isDragging, startY, startValue, values, value, onChange])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartValue(value)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const deltaY = startY - e.touches[0].clientY
    const sensitivity = 10
    const steps = Math.round(deltaY / sensitivity)
    const newIndex = Math.max(0, Math.min(values.length - 1, values.findIndex(v => v === startValue) + steps))
    
    if (values[newIndex] !== value) {
      onChange(values[newIndex])
    }
  }, [isDragging, startY, startValue, values, value, onChange])

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, startY, startValue, handleMouseMove, handleTouchMove])

  const getItemOpacity = (index: number) => {
    const distance = Math.abs(index - currentIndex)
    if (distance === 0) return 1
    if (distance === 1) return 0.6
    if (distance === 2) return 0.3
    return 0.1
  }

  const getItemScale = (index: number) => {
    const distance = Math.abs(index - currentIndex)
    if (distance === 0) return 1
    if (distance === 1) return 0.8
    return 0.6
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div 
        ref={containerRef}
        className={`relative h-32 w-20 min-w-[44px] overflow-hidden rounded-lg border-2 number-wheel ${
          isDragging ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
        } cursor-grab active:cursor-grabbing select-none touch-none focus:ring-2 focus:ring-orange-500 focus:outline-none`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="spinbutton"
        aria-label={label || "Sélectionner une valeur"}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onChange(Math.min(value + step, max))
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            onChange(Math.max(value - step, min))
          } else if (e.key === 'Home') {
            e.preventDefault()
            onChange(min)
          } else if (e.key === 'End') {
            e.preventDefault()
            onChange(max)
          }
        }}
      >
        {/* Indicateur central */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-500 transform -translate-y-0.5 z-10 opacity-50" />
        
        {/* Liste des valeurs */}
        <div className="flex flex-col items-center justify-center h-full">
          {values.map((val, index) => {
            const offsetFromCenter = (index - currentIndex) * 24
            
            return (
              <motion.div
                key={val}
                className="absolute flex items-center justify-center w-full"
                style={{
                  transform: `translateY(${offsetFromCenter}px)`,
                  opacity: getItemOpacity(index),
                  scale: getItemScale(index)
                }}
                animate={{
                  y: offsetFromCenter,
                  opacity: getItemOpacity(index),
                  scale: getItemScale(index)
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <span className={`text-lg font-semibold ${
                  index === currentIndex ? 'text-orange-800 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {val}
                </span>
              </motion.div>
            )
          })}
        </div>
        
        {/* Indicateurs de direction */}
        {!isDragging && (
          <>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        )}
      </div>
      
      {/* Boutons + et - pour les petits ajustements */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          aria-label={`Diminuer ${label || 'la valeur'} (${value - step})`}
          title={`Diminuer ${label || 'la valeur'}`}
          className="p-3 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-orange-500 focus:outline-none flex items-center justify-center touch-manipulation"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          aria-label={`Augmenter ${label || 'la valeur'} (${value + step})`}
          title={`Augmenter ${label || 'la valeur'}`}
          className="p-3 min-w-[44px] min-h-[44px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-orange-500 focus:outline-none flex items-center justify-center touch-manipulation"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}