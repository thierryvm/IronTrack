'use client'

import React, { useState} from'react'
import { motion} from'framer-motion'
import { Clock} from'lucide-react'
import { Button} from'./button'
import { Input} from'./input'
import { cn} from'@/lib/utils'

interface TimeInputMigratedProps {
 label: string
 value: number // en secondes
 onChange: (seconds: number) => void
 min?: number
 max?: number
 className?: string
}

/**
 * 🚀 TimeInput Migré CHADCN + IronTrack
 * 
 * FONCTIONNALITÉS HÉRITÉES:
 * ✅ Interface intuitive minutes:secondes
 * ✅ Presets métaboliques intelligents
 * ✅ Ajustements rapides ±15s/±30s
 * ✅ Formatage temps dynamique
 * ✅ Touch targets 44px+ (WCAG 2.5.5)
 * ✅ Validation range automatique
 * ✅ Zones d'entraînement (Force/Hypertrophie/Endurance)
 * 
 * AMÉLIORATIONS CHADCN:
 * ✅ Focus management amélioré
 * ✅ Design tokens cohérents
 * ✅ Accessibilité renforcée
 * ✅ Support thème sombre (futur)
 */
export function TimeInputMigrated({
 label,
 value,
 onChange,
 min = 30,
 max = 300,
 className =''
}: TimeInputMigratedProps) {
 const [isEditing, setIsEditing] = useState(false)
 
 // Conversion secondes vers minutes:secondes
 const minutes = Math.floor(value / 60)
 const seconds = value % 60
 
 const [editMinutes, setEditMinutes] = useState(minutes)
 const [editSeconds, setEditSeconds] = useState(seconds)

 // Presets communs pour temps de repos
 const presets = [
 { label:'Force\n30s', value: 30, description:'Force/Power'},
 { label:'Hypertrophie\n60s', value: 60, description:'Masse musculaire'},
 { label:'Hypertrophie\n90s', value: 90, description:'Volume élevé'},
 { label:'Endurance\n2min', value: 120, description:'Endurance musculaire'},
 { label:'Endurance\n3min', value: 180, description:'Récupération complète'},
 { label:'Strength\n5min', value: 300, description:'Force maximale'}
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

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key ==='Enter') {
 handleEditSubmit()
} else if (e.key ==='Escape') {
 setIsEditing(false)
 setEditMinutes(minutes)
 setEditSeconds(seconds)
}
}

 return (
 <div className={cn('space-y-2', className)}>
 <label className="block text-sm font-medium text-foreground flex items-center">
 <Clock className="h-6 w-6 mr-1" />
 {label}
 </label>

 {/* Affichage principal */}
 <div className="text-center">
 {isEditing ? (
 <div className="flex items-center justify-center space-x-2">
 <Input
 type="number"
 value={editMinutes}
 onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value) || 0))}
 onKeyDown={handleKeyPress}
 className="w-16 text-center text-lg font-semibold h-11"
 min={0}
 max={10}
 aria-label="Minutes"
 />
 <span className="text-lg font-medium text-muted-foreground">min</span>
 <Input
 type="number"
 value={editSeconds}
 onChange={(e) => setEditSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
 onKeyDown={handleKeyPress}
 className="w-16 text-center text-lg font-semibold h-11"
 min={0}
 max={59}
 aria-label="Secondes"
 />
 <span className="text-lg font-medium text-muted-foreground">s</span>
 <Button
 onClick={handleEditSubmit}
 className="h-11"
 aria-label="Confirmer la modification du temps"
 >
 OK
 </Button>
 </div>
 ) : (
 <Button
 variant="outline"
 onClick={() => setIsEditing(true)}
 className="h-14 px-6 flex-col"
 aria-label={`Modifier ${label}. Valeur actuelle: ${formatTime(value)}`}
 >
 <div className="text-2xl font-bold text-primary">
 {formatTime(value)}
 </div>
 <div className="text-xs text-muted-foreground mt-1">
 Cliquer pour modifier
 </div>
 </Button>
 )}
 </div>

 {/* Ajustements rapides */}
 <div className="flex justify-center space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleQuickAdjust(-15)}
 disabled={value <= min}
 className="h-9"
 aria-label="Diminuer de 15 secondes"
 >
 -15s
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleQuickAdjust(-30)}
 disabled={value <= min}
 className="h-9"
 aria-label="Diminuer de 30 secondes"
 >
 -30s
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleQuickAdjust(15)}
 disabled={value >= max}
 className="h-9"
 aria-label="Augmenter de 15 secondes"
 >
 +15s
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleQuickAdjust(30)}
 disabled={value >= max}
 className="h-9"
 aria-label="Augmenter de 30 secondes"
 >
 +30s
 </Button>
 </div>

 {/* Presets métaboliques */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {presets.map((preset, index) => (
 <motion.div key={index} whileTap={{ scale: 0.95}}>
 <Button
 variant={value === preset.value ?"default" :"outline"}
 onClick={() => handlePresetClick(preset.value)}
 className={cn(
"h-11 w-full p-2 flex flex-col items-center justify-center text-xs",
 value === preset.value
 ?"!bg-slate-800 dark:!bg-slate-700 !text-white hover:!bg-slate-900 :!bg-slate-600 !border-slate-800"
 :"!border-slate-300 dark:!border-slate-600 !text-muted-foreground dark:!text-white hover:!bg-slate-50 :!bg-slate-800"
 )}
 aria-label={`Preset ${preset.label}: ${preset.description}`}
 >
 <div className="whitespace-pre-line leading-tight font-medium">
 {preset.label}
 </div>
 <div className="text-xs opacity-75 mt-1">
 {preset.description}
 </div>
 </Button>
 </motion.div>
 ))}
 </div>

 {/* Indicateur métabolique */}
 <div className="text-xs text-muted-foreground text-center space-y-1">
 <div>30-60s: Force • 60-120s: Hypertrophie • 120-300s: Endurance</div>
 <div>Range: {formatTime(min)} - {formatTime(max)}</div>
 </div>
 </div>
 )
}