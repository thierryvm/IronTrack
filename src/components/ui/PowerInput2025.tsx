'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface PowerInput2025Props {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  presets?: { label: string; value: number }[]
  className?: string
}

/**
 * 🔧 Remplacement UX pour NumberWheel inappropriés
 * Spécialement conçu pour valeurs larges (ex: Watts 50-500)
 * Alternative tactile optimisée avec presets rapides
 */
export function PowerInput2025({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
  unit = '',
  presets = [],
  className = ''
}: PowerInput2025Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  // Presets par défaut pour watts si non fournis
  const defaultPresets = presets.length > 0 ? presets : [
    { label: 'Débutant', value: 100 },
    { label: 'Moyen', value: 150 },
    { label: 'Bon', value: 200 },
    { label: 'Excellent', value: 250 },
    { label: 'Elite', value: 300 }
  ]

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleInputSubmit = () => {
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue)
    }
    setIsEditing(false)
    setInputValue(value.toString())
  }

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Valeur principale avec contrôles +/- */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Minus className="h-4 w-4" />
        </button>

        {isEditing ? (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
            className="flex-1 text-center text-lg font-semibold bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            style={{ minHeight: '44px' }}
            autoFocus
            min={min}
            max={max}
            step={step}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 text-center text-lg font-semibold bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <span className="text-orange-600">{value}</span>
            {unit && <span className="text-gray-500 ml-1">{unit}</span>}
          </button>
        )}

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Presets rapides - Responsive amélioré */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {defaultPresets.map((preset, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            className={`px-2 py-2 text-center rounded-lg transition-colors touch-manipulation overflow-hidden ${
              value === preset.value
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ minHeight: '48px' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-xs font-medium truncate leading-tight">
              {preset.label}
            </div>
            <div className={`text-xs font-semibold mt-1 ${
              value === preset.value ? 'text-orange-100' : 'text-orange-600'
            }`}>
              {preset.value}{unit}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Indicateur range */}
      <div className="text-xs text-gray-500 text-center">
        Range: {min} - {max} {unit} (par {step})
      </div>
    </div>
  )
}