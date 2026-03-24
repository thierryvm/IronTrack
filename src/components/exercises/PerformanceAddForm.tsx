'use client'

import React, { useState} from'react'
import { motion} from'framer-motion'
import { Trophy, ArrowLeft} from'lucide-react'
import { ExerciseType} from'@/types/exercise'
import { StrengthMetrics, CardioMetrics} from'@/types/performance'
import { Button} from'@/components/ui/button'
import { Input} from'@/components/ui/input'
import { Textarea} from'@/components/ui/textarea'
import { Label} from'@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from'@/components/ui/select'
import { AdaptiveMetricsForm} from'./AdaptiveMetricsForm'
import { getFieldVisibility, getFieldHelpText} from'@/utils/exerciseFieldLogic'

interface ExerciseInfo {
 id: number
 name: string
 type: ExerciseType
 equipment: string
}

interface PerformanceAddFormProps {
 exercise: ExerciseInfo
 onComplete: (performanceData: StrengthMetrics | CardioMetrics, notes?: string) => Promise<void>
 onBack: () => void
}

/**
 * Formulaire d'ajout de performance pour un exercice existant
 * Réutilise la logique du PerformanceForm mais adapté pour un exercice existant
 */
export function PerformanceAddForm({ exercise, onComplete, onBack}: PerformanceAddFormProps) {
 // État pour musculation
 const [strengthData, setStrengthData] = useState<StrengthMetrics>({
 weight: 0,
 reps: 0,
 sets: 0,
 rest_seconds: 60,
 rpe: undefined
})

 // État pour cardio
 const [cardioData, setCardioData] = useState<CardioMetrics>({
 duration_seconds: 0,
 distance: 0,
 distance_unit:'km',
 heart_rate: undefined,
 calories: undefined,
 rowing: undefined,
 running: undefined,
 cycling: undefined
})

 const [notes, setNotes] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [errors, setErrors] = useState<Record<string, string>>({})

 // Logique de visibilité des champs selon type d'exercice
 const fieldVisibility = getFieldVisibility(exercise.type, exercise.name, exercise.equipment)

 // Détection du type d'équipement pour métriques spécialisées
 const getEquipmentType = () => {
 const equipment = exercise.equipment.toLowerCase()
 if (equipment.includes('rameur')) return'rowing'
 if (equipment.includes('tapis') || equipment.includes('course')) return'running'
 if (equipment.includes('vélo') || equipment.includes('bike')) return'cycling'
 return null
}

 const equipmentType = getEquipmentType()

 // Validation sécurisée selon le type
 const validateForm = (): boolean => {
 const newErrors: Record<string, string> = {}

 if (exercise.type ==='Musculation') {
 // Validation sécurisée des nombres avec limites réalistes
 if (!strengthData.weight || strengthData.weight <= 0 || strengthData.weight > 1000) {
 newErrors.weight ='Le poids doit être entre 0.5 et 1000 kg'
}
 if (!strengthData.reps || strengthData.reps <= 0 || strengthData.reps > 500) {
 newErrors.reps ='Le nombre de répétitions doit être entre 1 et 500'
}
 if (!strengthData.sets || strengthData.sets <= 0 || strengthData.sets > 100) {
 newErrors.sets ='Le nombre de séries doit être entre 1 et 100'
}
 // Validation RPE si renseigné
 if (strengthData.rpe !== undefined && (strengthData.rpe < 1 || strengthData.rpe > 10)) {
 newErrors.rpe ='Le RPE doit être entre 1 et 10'
}
} else {
 // Validation cardio avec limites réalistes
 if (cardioData.duration_seconds <= 0 || cardioData.duration_seconds > 43200) { // Max 12h
 newErrors.duration ='La durée doit être entre 1 seconde et 12 heures'
}
 // Validation optionnelle des métriques cardio
 if (cardioData.distance !== undefined && (cardioData.distance < 0 || cardioData.distance > 1000)) {
 newErrors.distance ='La distance doit être entre 0 et 1000 km'
}
 if (cardioData.heart_rate !== undefined && (cardioData.heart_rate < 40 || cardioData.heart_rate > 250)) {
 newErrors.heartRate ='La fréquence cardiaque doit être entre 40 et 250 BPM'
}
}

 // Validation des notes (sécurité XSS)
 if (notes && notes.length > 2000) {
 newErrors.notes ='Les notes ne peuvent pas dépasser 2000 caractères'
}

 setErrors(newErrors)
 return Object.keys(newErrors).length === 0
}

 // Conversion durée minutes:secondes vers secondes
 const getDurationMinutes = () => Math.floor(cardioData.duration_seconds / 60)
 const getDurationSeconds = () => cardioData.duration_seconds % 60

 const updateDuration = (minutes: number, seconds: number) => {
 const totalSeconds = (minutes * 60) + seconds
 setCardioData(prev => ({ ...prev, duration_seconds: totalSeconds}))
}

 // Soumission sécurisée
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 
 if (!validateForm()) return

 setIsLoading(true)
 try {
 // Sanitisation des données avant envoi
 const performanceData = exercise.type ==='Musculation' ? {
 ...strengthData,
 // Arrondi sécurisé pour éviter les float précision issues
 weight: Math.round((strengthData.weight || 0) * 100) / 100,
 reps: Math.max(0, Math.floor(strengthData.reps || 0)),
 sets: Math.max(0, Math.floor(strengthData.sets || 0)),
 rest_seconds: Math.max(0, Math.floor(strengthData.rest_seconds || 60)),
 rpe: strengthData.rpe ? Math.max(1, Math.min(10, Math.floor(strengthData.rpe))) : undefined
} : {
 ...cardioData,
 // Sanitisation cardio
 duration_seconds: Math.max(1, Math.floor(cardioData.duration_seconds || 0)),
 distance: cardioData.distance ? Math.max(0, Math.round(cardioData.distance * 100) / 100) : undefined,
 heart_rate: cardioData.heart_rate ? Math.max(40, Math.min(250, Math.floor(cardioData.heart_rate))) : undefined,
 calories: cardioData.calories ? Math.max(0, Math.floor(cardioData.calories)) : undefined
}
 
 // Sanitisation des notes (trim + limite)
 const sanitizedNotes = notes?.trim().slice(0, 2000) || undefined
 
 console.log('📤 PerformanceAddForm - Données sécurisées:', performanceData)
 console.log('📝 Notes sécurisées:', sanitizedNotes)
 console.log('🏋️ Type exercice:', exercise.type)
 
 await onComplete(performanceData, sanitizedNotes)
} catch (error) {
 console.error('💥 PerformanceAddForm - Erreur handleSubmit:', error)
 console.error('📋 Détails erreur form:', JSON.stringify(error, null, 2))
 // Re-throw pour que l'erreur remonte à la page parent
 throw error
} finally {
 setIsLoading(false)
}
}

 return (
 <div className="max-w-2xl mx-auto">
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="text-center mb-8"
 >
 <div className="flex justify-center mb-4">
 <div className="p-2 bg-orange-100 rounded-full">
 <Trophy className="w-8 h-8 text-orange-800" />
 </div>
 </div>
 <h2 className="text-3xl font-bold text-foreground mb-2">
 Nouvelle performance
 </h2>
 <p className="text-gray-600 text-lg">
 {exercise.name} • {exercise.type}
 </p>
 </motion.div>

 <motion.form
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.1}}
 onSubmit={handleSubmit}
 className="space-y-6"
 >
 {exercise.type ==='Musculation' ? (
 // Formulaire Musculation
 <>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="weight">Poids (kg) *</Label>
 <Input
 id="weight"
 type="number"
 min="0"
 step="0.5"
 placeholder="20"
 value={strengthData.weight ||''}
 onChange={(e) => setStrengthData(prev => ({ 
 ...prev, 
 weight: parseFloat(e.target.value) || 0 
}))}
 className={errors.weight ?'border-red-500' :''}
 />
 {errors.weight && (
 <p className="text-sm text-red-600">{errors.weight}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="reps">Répétitions *</Label>
 <Input
 id="reps"
 type="number"
 min="1"
 placeholder="10"
 value={strengthData.reps ||''}
 onChange={(e) => setStrengthData(prev => ({ 
 ...prev, 
 reps: parseInt(e.target.value) || 0 
}))}
 className={errors.reps ?'border-red-500' :''}
 />
 {errors.reps && (
 <p className="text-sm text-red-600">{errors.reps}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="sets">Séries *</Label>
 <Input
 id="sets"
 type="number"
 min="1"
 placeholder="3"
 value={strengthData.sets ||''}
 onChange={(e) => setStrengthData(prev => ({ 
 ...prev, 
 sets: parseInt(e.target.value) || 0 
}))}
 className={errors.sets ?'border-red-500' :''}
 />
 {errors.sets && (
 <p className="text-sm text-red-600">{errors.sets}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="rest-seconds">Repos entre séries (sec)</Label>
 <Input
 id="rest-seconds"
 type="number"
 min="0"
 placeholder="60"
 value={strengthData.rest_seconds ||''}
 onChange={(e) => setStrengthData(prev => ({ 
 ...prev, 
 rest_seconds: parseInt(e.target.value) || 60 
}))}
 />
 <p className="text-xs text-gray-600">Temps de récupération entre séries</p>
 </div>

 <div className="space-y-2">
 <Label htmlFor="rpe">RPE (optionnel)</Label>
 <Select value={strengthData.rpe?.toString() ||'undefined'} onValueChange={(value) => setStrengthData(prev => ({ 
 ...prev, 
 rpe: value ==='undefined' ? undefined : parseInt(value) 
}))}>
 <SelectTrigger id="rpe">
 <SelectValue placeholder="Non défini" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="undefined">Non défini</SelectItem>
 <SelectItem value="1">1 - Très facile</SelectItem>
 <SelectItem value="2">2 - Facile</SelectItem>
 <SelectItem value="3">3 - Modéré</SelectItem>
 <SelectItem value="4">4 - Difficile</SelectItem>
 <SelectItem value="5">5 - Très difficile</SelectItem>
 <SelectItem value="6">6 - Dur</SelectItem>
 <SelectItem value="7">7 - Très dur</SelectItem>
 <SelectItem value="8">8 - Extrêmement dur</SelectItem>
 <SelectItem value="9">9 - Maximum</SelectItem>
 <SelectItem value="10">10 - Au-delà du maximum</SelectItem>
 </SelectContent>
 </Select>
 <p className="text-xs text-gray-600">Rate of Perceived Exertion (1-10)</p>
 </div>
 </div>
 </>
 ) : (
 // Formulaire Cardio
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700">
 Durée <span className="text-safe-error">*</span>
 </label>
 <div className="flex gap-2">
 <Input
 type="number"
 min="0"
 placeholder="Min"
 value={getDurationMinutes() ||''}
 onChange={(e) => updateDuration(parseInt(e.target.value) || 0, getDurationSeconds())}
 />
 <Input
 type="number"
 min="0"
 max="59"
 placeholder="Sec"
 value={getDurationSeconds() ||''}
 onChange={(e) => updateDuration(getDurationMinutes(), parseInt(e.target.value) || 0)}
 />
 </div>
 {errors.duration && (
 <p className="text-sm text-red-600">{errors.duration}</p>
 )}
 </div>
 </div>

 {/* Distance - Masquée pour exercices statiques comme squats */}
 {fieldVisibility.distance && (
 <div className="space-y-2">
 <Label htmlFor="distance">Distance</Label>
 <div className="flex gap-2">
 <Input
 id="distance"
 type="number"
 min="0"
 step="0.1"
 value={cardioData.distance ||''}
 onChange={(e) => setCardioData(prev => ({ 
 ...prev, 
 distance: parseFloat(e.target.value) || 0 
}))}
 placeholder="5.0"
 className="flex-1"
 />
 <Select value={cardioData.distance_unit} onValueChange={(value) => setCardioData(prev => ({ 
 ...prev, 
 distance_unit: value as'km' |'m' |'miles' 
}))}>
 <SelectTrigger className="w-20">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="km">km</SelectItem>
 <SelectItem value="m">m</SelectItem>
 <SelectItem value="miles">mi</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <p className="text-xs text-gray-600">
 {getFieldHelpText('distance', exercise.type, exercise.name)}
 </p>
 </div>
 )}
 </div>

 {/* Métriques spécialisées selon l'équipement */}
 {equipmentType ==='rowing' && (
 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
 <h4 className="font-semibold text-blue-800 mb-2">Métriques rameur</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="rowing-cadence">Cadence (SPM)</Label>
 <Input
 id="rowing-cadence"
 type="number"
 min="16"
 max="36"
 placeholder="24"
 value={cardioData.rowing?.stroke_rate ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 rowing: { 
 stroke_rate: parseInt(e.target.value) || 0,
 watts: prev.rowing?.watts || 0,
 split_time: prev.rowing?.split_time
}
}))}
 aria-describedby="rowing-cadence-help"
 />
 <p id="rowing-cadence-help" className="text-xs text-muted-foreground">Coups par minute (débutant: 20-24, expérimenté: 26-32)</p>
 </div>
 <div className="space-y-2">
 <Label htmlFor="rowing-watts">Puissance (watts)</Label>
 <Input
 id="rowing-watts"
 type="number"
 min="50"
 max="500"
 placeholder="150"
 value={cardioData.rowing?.watts ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 rowing: { 
 stroke_rate: prev.rowing?.stroke_rate || 0,
 watts: parseInt(e.target.value) || 0,
 split_time: prev.rowing?.split_time
}
}))}
 aria-describedby="rowing-watts-help"
 />
 <p id="rowing-watts-help" className="text-xs text-muted-foreground">Débutant: 100W, Moyen: 150W, Bon: 200W+</p>
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Heart Rate - Visible selon configuration */}
 {fieldVisibility.heartRate && (
 <div className="space-y-2">
 <Label htmlFor="heart-rate">Fréquence cardiaque (BPM)</Label>
 <Input
 id="heart-rate"
 type="number"
 min="60"
 max="200"
 placeholder="140"
 value={cardioData.heart_rate ||''}
 onChange={(e) => setCardioData(prev => ({ 
 ...prev, 
 heart_rate: parseInt(e.target.value) || undefined 
}))}
 aria-describedby="heart-rate-help"
 />
 <p id="heart-rate-help" className="text-xs text-muted-foreground">{getFieldHelpText('heartRate', exercise.type, exercise.name)}</p>
 </div>
 )}

 {/* Calories - Visible selon configuration */}
 {fieldVisibility.calories && (
 <div className="space-y-2">
 <Label htmlFor="calories">Calories brûlées</Label>
 <Input
 id="calories"
 type="number"
 min="0"
 placeholder="300"
 value={cardioData.calories ||''}
 onChange={(e) => setCardioData(prev => ({ 
 ...prev, 
 calories: parseInt(e.target.value) || undefined 
}))}
 aria-describedby="calories-help"
 />
 <p id="calories-help" className="text-xs text-muted-foreground">{getFieldHelpText('calories', exercise.type, exercise.name)}</p>
 </div>
 )}
 </div>
 </>
 )}

 {/* Métriques Avancées Adaptatives */}
 <AdaptiveMetricsForm
 exerciseType={exercise.type}
 equipment={exercise.equipment ||''}
 exerciseName={exercise.name}
 cardioData={cardioData}
 strengthData={strengthData}
 setCardioData={setCardioData}
 setStrengthData={setStrengthData}
 />

 {/* Notes */}
 <div className="space-y-2">
 <Label htmlFor="notes">Notes (optionnel)</Label>
 <Textarea
 id="notes"
 placeholder="Ressenti, observations, modifications..."
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={3}
 className="resize-none"
 aria-describedby="notes-help"
 />
 <p id="notes-help" className="text-xs text-muted-foreground">
 Partagez vos impressions sur cette séance pour mieux suivre vos progrès
 </p>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-6 border-t border-border/50">
 <Button
 type="button"
 variant="secondary"
 onClick={onBack}
 disabled={isLoading}
 className="min-w-[100px]"
 aria-label="Retourner à la liste des exercices"
 >
 <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
 Retour
 </Button>
 
 <Button
 type="submit"
 variant="orange"
 disabled={isLoading}
 className="min-w-[160px]"
 aria-label="Enregistrer cette performance"
 >
 {isLoading ? (
 <>
 <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-white" aria-hidden="true" />
 Enregistrement...
 </>
 ) : (
 <>
 <Trophy className="w-4 h-4 mr-2" aria-hidden="true" />
 Enregistrer performance
 </>
 )}
 </Button>
 </div>
 </motion.form>

 {/* Info - Support dark mode */}
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 transition={{ delay: 0.3}}
 className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200"
 role="complementary"
 aria-labelledby="success-info"
 >
 <div className="flex items-center gap-2 mb-2">
 <Trophy className="w-5 h-5 text-green-600" />
 <h4 className="font-semibold text-green-800">Excellente séance !</h4>
 </div>
 <p className="text-sm text-green-700">
 Cette performance sera ajoutée à ton historique d'entraînement pour suivre tes progrès.
 </p>
 </motion.div>
 </div>
 )
}