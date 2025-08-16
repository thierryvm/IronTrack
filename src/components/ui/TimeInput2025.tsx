'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface TimeInput2025Props {
  label: string
  value: number // en secondes
  onChange: (seconds: number) => void
  min?: number
  max?: number
  className?: string
}

/**
 * 🔧 Remplacement UX pour NumberWheel temps inapproprié
 * Interface intuitive minutes:secondes avec presets communs
 * Alternative tactile optimisée pour temps de repos (30-300s)
 */
export function TimeInput2025({
  label,
  value,
  onChange,
  min = 30,
  max = 300,
  className = ''
}: TimeInput2025Props) {
  const [isEditing, setIsEditing] = useState(false)
  
  // Conversion secondes vers minutes:secondes
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  
  const [editMinutes, setEditMinutes] = useState(minutes)
  const [editSeconds, setEditSeconds] = useState(seconds)

  // Presets communs pour temps de repos
  const presets = [
    { label: 'Force\n30s', value: 30, description: 'Force/Power' },
    { label: 'Hypertrophie\n60s', value: 60, description: 'Masse musculaire' },
    { label: 'Hypertrophie\n90s', value: 90, description: 'Volume élevé' },
    { label: 'Endurance\n2min', value: 120, description: 'Endurance musculaire' },
    { label: 'Endurance\n3min', value: 180, description: 'Récupération complète' },
    { label: 'Strength\n5min', value: 300, description: 'Force maximale' }
  ]

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    if (mins === 0) {
      return `${secs}s`
    }
    return secs === 0 ? `${mins}min` : `${mins}min${secs}s`
  }

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue)
  }

  const handleEditSubmit = () => {
    const totalSeconds = editMinutes * 60 + editSeconds
    const clampedValue = Math.max(min, Math.min(max, totalSeconds))
    onChange(clampedValue)
    setIsEditing(false)
  }

  const handleQuickAdjust = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta))
    onChange(newValue)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {label}
      </label>

      {/* Affichage principal */}
      <div className="text-center">
        {isEditing ? (
          <div className="flex items-center justify-center space-x-2">
            <input
              type="number"
              value={editMinutes}
              onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center text-lg font-semibold bg-white border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-orange-500"
              style={{ minHeight: '44px' }}
              min={0}
              max={10}
            />
            <span className="text-lg font-medium text-gray-600">min</span>
            <input
              type="number"
              value={editSeconds}
              onChange={(e) => setEditSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-16 text-center text-lg font-semibold bg-white border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-orange-500"
              style={{ minHeight: '44px' }}
              min={0}
              max={59}
            />
            <span className="text-lg font-medium text-gray-600">s</span>
            <button
              type="button"
              onClick={handleEditSubmit}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-white border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <div className="text-2xl font-bold text-orange-600">
              {formatTime(value)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Cliquer pour modifier
            </div>
          </button>
        )}
      </div>

      {/* Ajustements rapides */}
      <div className="flex justify-center space-x-2">
        <button
          type="button"
          onClick={() => handleQuickAdjust(-15)}
          disabled={value <= min}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '36px' }}
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdjust(-30)}
          disabled={value <= min}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '36px' }}
        >
          -30s
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdjust(15)}
          disabled={value >= max}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '36px' }}
        >
          +15s
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdjust(30)}
          disabled={value >= max}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          style={{ minHeight: '36px' }}
        >
          +30s
        </button>
      </div>

      {/* Presets métaboliques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {presets.map((preset, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            className={`p-2 text-xs font-medium rounded-lg transition-colors touch-manipulation ${
              value === preset.value
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ minHeight: '44px' }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="whitespace-pre-line leading-tight">
              {preset.label}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {preset.description}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Indicateur métabolique */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <div>30-60s: Force • 60-120s: Hypertrophie • 120-300s: Endurance</div>
        <div>Range: {formatTime(min)} - {formatTime(max)}</div>
      </div>
    </div>
  )
}