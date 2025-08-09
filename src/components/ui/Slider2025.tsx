'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Slider2025Props {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
  disabled?: boolean
  labels?: string[]
}

const Slider2025 = React.forwardRef<HTMLDivElement, Slider2025Props>(
  ({ value, onValueChange, max = 100, min = 0, step = 1, className, disabled = false, labels, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const thumbRef = React.useRef<HTMLDivElement>(null)

    const currentValue = value[0] || min
    const percentage = ((currentValue - min) / (max - min)) * 100

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e)
    }

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging || disabled) return
      updateValue(e)
    }, [isDragging, disabled])

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    const updateValue = (e: MouseEvent | React.MouseEvent) => {
      if (!sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = Math.max(0, Math.min(1, clickX / width))
      
      const rawValue = percentage * (max - min) + min
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      
      onValueChange([clampedValue])
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = 'none'
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.body.style.userSelect = ''
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    React.useImperativeHandle(ref, () => sliderRef.current!, [])

    return (
      <div className={cn('w-full space-y-3', className)} {...props}>
        <div
          ref={sliderRef}
          className={cn(
            'relative h-6 cursor-pointer group',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onMouseDown={handleMouseDown}
        >
          {/* Track */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2 bg-gray-200 rounded-full">
            {/* Progress */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.2 }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full relative"
            >
              {/* Glow effect when dragging */}
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-orange-400 rounded-full blur-sm"
                />
              )}
            </motion.div>
          </div>

          {/* Thumb */}
          <motion.div
            ref={thumbRef}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-orange-500 rounded-full shadow-lg cursor-grab',
              'transition-all duration-200 hover:scale-110 active:cursor-grabbing',
              isDragging && 'scale-125 shadow-xl ring-4 ring-orange-200'
            )}
            style={{ left: `calc(${percentage}% - 12px)` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.25 }}
            animate={{
              scale: isDragging ? 1.25 : 1
            }}
          >
            {/* Inner dot */}
            <div className="absolute inset-2 bg-orange-500 rounded-full" />
          </motion.div>

          {/* Value tooltip when dragging */}
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
              style={{ left: `calc(${percentage}% - 20px)` }}
            >
              {currentValue}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </motion.div>
          )}
        </div>

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="flex justify-between text-xs text-gray-500 px-1">
            {labels.map((label, index) => (
              <span key={index} className="text-center">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Slider2025.displayName = 'Slider2025'

export { Slider2025 }