'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { ButtonMigrated } from './ButtonMigrated'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface PowerInputMigratedProps {
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
 * 🚀 PowerInput Migré CHADCN + IronTrack
 * 
 * FONCTIONNALITÉS HÉRITÉES:
 * ✅ Contrôles +/- tactiles optimisés
 * ✅ Édition directe par clic
 * ✅ Presets intelligents pour watts
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
export function PowerInputMigrated({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
  unit = '',
  presets = [],
  className = ''
}: PowerInputMigratedProps) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setInputValue(value.toString())
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {/* Valeur principale avec contrôles +/- */}
      <div className="flex items-center space-x-3">
        <ButtonMigrated
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="shrink-0"
          aria-label={`Diminuer ${label} de ${step}`}
        >
          <Minus className="h-4 w-4" />
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
            className="flex-1 h-11 justify-center"
            aria-label={`Modifier ${label}. Valeur actuelle: ${value} ${unit}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold">
                <span className="text-orange-600">{value}</span>
                {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
              </span>
              {(() => {
                const currentPreset = defaultPresets.find(p => p.value === value)
                return currentPreset ? (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {currentPreset.label}
                  </span>
                ) : null
              })()} 
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
          <Plus className="h-4 w-4" />
        </ButtonMigrated>
      </div>

      {/* Presets rapides - Mobile optimisé */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {defaultPresets.map((preset, index) => (
          <motion.div key={index} whileTap={{ scale: 0.95 }}>
            <ButtonMigrated
              variant={value === preset.value ? "default" : "outline"}
              onClick={() => handlePresetClick(preset.value)}
              className="h-9 w-full px-2 py-1 flex items-center justify-center"
              aria-label={`Preset ${preset.label}: ${preset.value} ${unit}`}
            >
              <div className={cn(
                "text-sm font-semibold leading-none",
                value === preset.value 
                  ? "text-primary-foreground" 
                  : "text-orange-600"
              )}>
                {preset.value}
              </div>
            </ButtonMigrated>
          </motion.div>
        ))}
      </div>

      {/* Indicateur range */}
      <div className="text-xs text-muted-foreground text-center">
        Range: {min} - {max} {unit} (par {step})
      </div>
    </div>
  )
}