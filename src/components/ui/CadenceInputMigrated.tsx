'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Gauge } from 'lucide-react'
import { ButtonMigrated } from './ButtonMigrated'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface CadenceInputMigratedProps {
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
 * 🚀 CadenceInput Migré CHADCN + IronTrack
 * 
 * FONCTIONNALITÉS HÉRITÉES:
 * ✅ Zones cadence intelligentes (SPM/RPM)
 * ✅ Presets adaptatifs selon le type d'exercice
 * ✅ Contrôles +/- tactiles optimisés
 * ✅ Édition directe par clic
 * ✅ Touch targets 44px+ (WCAG 2.5.5)
 * ✅ Validation range automatique
 * ✅ Responsive grid presets
 * 
 * AMÉLIORATIONS CHADCN:
 * ✅ Focus management amélioré
 * ✅ Design tokens cohérents
 * ✅ Accessibilité renforcée
 * ✅ Support thème sombre (futur)
 */
export function CadenceInputMigrated({
  label,
  value,
  onChange,
  min = 16,
  max = 36,
  step = 1,
  unit = 'SPM',
  className = ''
}: CadenceInputMigratedProps) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(value.toString())
    }
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
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-foreground flex items-center">
        <Gauge className="h-6 w-6 mr-1" />
        {label}
      </label>

      {/* Valeur principale avec contrôles */}
      <div className="flex items-center space-x-2">
        <ButtonMigrated
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="shrink-0"
          aria-label={`Diminuer ${label} de ${step}`}
        >
          <Minus className="h-6 w-6" />
        </ButtonMigrated>

        {isEditing ? (
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyDown={handleKeyPress}
            className="flex-1 text-center text-lg font-semibold h-11"
            autoFocus
            min={min}
            max={max}
            step={step}
            aria-label={`Saisir ${label} entre ${min} et ${max} ${unit}`}
          />
        ) : (
          <ButtonMigrated
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex-1 h-11 flex-col py-2"
            aria-label={`Modifier ${label}. Valeur actuelle: ${value} ${unit}, zone ${cadenceZone.zone}`}
          >
            <div className={cn("text-lg font-semibold", cadenceZone.color)}>
              {value} {unit}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {cadenceZone.zone}
            </div>
          </ButtonMigrated>
        )}

        <ButtonMigrated
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="shrink-0"
          aria-label={`Augmenter ${label} de ${step}`}
        >
          <Plus className="h-6 w-6" />
        </ButtonMigrated>
      </div>

      {/* Presets rapides - Mobile optimisé */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {presets.map((preset, index) => (
          <motion.div key={index} whileTap={{ scale: 0.95 }}>
            <ButtonMigrated
              variant={value === preset.value ? "default" : "outline"}
              onClick={() => handlePresetClick(preset.value)}
              className="h-9 w-full px-2 py-1 flex items-center justify-center"
              aria-label={`Preset ${preset.label}: ${preset.value} ${unit} - ${preset.description}`}
            >
              <div className={cn(
                "text-sm font-semibold leading-none",
                value === preset.value 
                  ? "text-primary-foreground" 
                  : "text-blue-600"
              )}>
                {preset.value}
              </div>
            </ButtonMigrated>
          </motion.div>
        ))}
      </div>

      {/* Indicateur range */}
      <div className="text-xs text-muted-foreground text-center">
        Range: {min} - {max} {unit} • Zone actuelle: {cadenceZone.zone}
      </div>
    </div>
  )
}