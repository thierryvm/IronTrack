'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Gauge } from 'lucide-react'

interface CadenceInput2025Props {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

/**
 * 🔧 Remplacement UX pour NumberWheel cadence 
 * Optimisé pour desktop avec contrôles tactiles et visuels
 * Alternative pour plages moyennes (16-36 SPM, 50-120 RPM)
 */
export function CadenceInput2025({
  label,
  value,
  onChange,
  min = 16,
  max = 36,
  step = 1,
  unit = 'SPM',
  className = ''
}: CadenceInput2025Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  // Presets adaptés selon le type de cadence
  const getPresets = () => {
    if (unit === 'SPM') {
      // Rameur - Strokes Per Minute
      return [
        { label: 'Échauffement', value: 20, description: 'Warm-up' },
        { label: 'Endurance', value: 24, description: 'Base pace' },
        { label: 'Tempo', value: 26, description: 'Moderate effort' },
        { label: 'Intensif', value: 30, description: 'High intensity' }
      ]
    } else if (unit === 'RPM') {
      // Vélo - Rotations Per Minute  
      return [
        { label: 'Facile', value: 70, description: 'Easy pace' },
        { label: 'Modéré', value: 85, description: 'Moderate' },
        { label: 'Soutenu', value: 95, description: 'Sustained' },
        { label: 'Sprint', value: 110, description: 'High cadence' }
      ]
    }
    return []
  }

  const presets = getPresets()

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

  // Déterminer la couleur selon la zone de cadence
  const getCadenceZone = () => {
    if (unit === 'SPM') {
      if (value <= 22) return { color: 'text-green-600', zone: 'Échauffement' }
      if (value <= 25) return { color: 'text-blue-600', zone: 'Endurance' } 
      if (value <= 28) return { color: 'text-orange-600', zone: 'Tempo' }
      return { color: 'text-red-600', zone: 'Intensif' }
    } else {
      if (value <= 80) return { color: 'text-green-600', zone: 'Facile' }
      if (value <= 90) return { color: 'text-blue-600', zone: 'Modéré' }
      if (value <= 100) return { color: 'text-orange-600', zone: 'Soutenu' }
      return { color: 'text-red-600', zone: 'Sprint' }
    }
  }

  const cadenceZone = getCadenceZone()

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        <Gauge className="h-4 w-4 mr-1" />
        {label}
      </label>

      {/* Valeur principale avec contrôles */}
      <div className="flex items-center space-x-2">
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
            className="flex-1 text-center bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <div className={`text-lg font-semibold ${cadenceZone.color}`}>
              {value} {unit}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {cadenceZone.zone}
            </div>
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

      {/* Presets rapides - horizontal pour économiser l'espace */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map((preset, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors touch-manipulation ${
              value === preset.value
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ minHeight: '36px' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="font-medium">{preset.label}</div>
            <div className="text-xs opacity-75">{preset.value}{unit}</div>
          </motion.button>
        ))}
      </div>

      {/* Indicateur range */}
      <div className="text-xs text-gray-500 text-center">
        Range: {min} - {max} {unit} • Zone actuelle: {cadenceZone.zone}
      </div>
    </div>
  )
}