'use client'

import React, { useState, useEffect} from'react'
import { useRouter} from'next/navigation'
import { motion} from'framer-motion'
import { ArrowLeft, Save, X, Dumbbell, Target, Activity, Calendar, AlertCircle} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import { toast} from'react-hot-toast'
import { Button} from'@/components/ui/button'
import { Input} from'@/components/ui/input'
import { Textarea} from'@/components/ui/textarea'
import { Label} from'@/components/ui/label'

interface PerformanceEditForm2025Props {
 performanceId: string
 exerciseId: string
}

interface PerformanceData {
 exercise_name: string
 exercise_type:'Musculation' |'Cardio' |'Fitness' |'Étirement'
 performed_at: string
 
 // Musculation
 weight?: number
 reps?: number
 set_number?: number
 
 // Cardio général
 duration?: number // en secondes
 distance?: number
 distance_unit?: string
 speed?: number
 calories?: number
 
 // Cardio avancé
 stroke_rate?: number // SPM pour rameur
 watts?: number // watts pour rameur
 heart_rate?: number // BPM
 incline?: number // % pour tapis
 cadence?: number // RPM pour vélo
 resistance?: number // niveau pour vélo
 
 notes?: string
}

export const PerformanceEditForm2025: React.FC<PerformanceEditForm2025Props> = ({ 
 performanceId, 
 exerciseId 
}) => {
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [performance, setPerformance] = useState<PerformanceData | null>(null)
 const [errors, setErrors] = useState<Record<string, string>>({})
 const [originalPerformedAt, setOriginalPerformedAt] = useState<string | null>(null)
 const [showDateWarning, setShowDateWarning] = useState(false)

 useEffect(() => {
 const fetchPerformance = async () => {
 try {
 const supabase = createClient()
 
 // Récupérer la performance avec l'exercice associé
 const { data, error} = await supabase
 .from('performance_logs')
 .select(`
 *,
 exercises!inner(name, exercise_type)
 `)
 .eq('id', performanceId)
 .single()

 if (error) throw error

 // Formater les données
 const formattedPerformance: PerformanceData = {
 exercise_name: data.exercises.name,
 exercise_type: data.exercises.exercise_type,
 performed_at: data.performed_at,
 weight: data.weight,
 reps: data.reps,
 set_number: data.set_number,
 duration: data.duration,
 distance: data.distance,
 distance_unit: data.distance_unit,
 speed: data.speed,
 calories: data.calories,
 stroke_rate: data.stroke_rate,
 watts: data.watts,
 heart_rate: data.heart_rate,
 incline: data.incline,
 cadence: data.cadence,
 resistance: data.resistance,
 notes: data.notes
}

 setPerformance(formattedPerformance)
 setOriginalPerformedAt(data.performed_at)

} catch (error) {
 console.error('Erreur lors du chargement:', error)
 toast.error('Erreur lors du chargement de la performance')
 router.push(`/exercises`)
} finally {
 setLoading(false)
}
}

 fetchPerformance()
}, [performanceId, exerciseId, router])

 const validateForm = (): boolean => {
 const newErrors: Record<string, string> = {}

 // Validation date - empêcher les dates futures
 if (performance?.performed_at) {
 const performanceDate = new Date(performance.performed_at)
 const now = new Date()
 if (performanceDate > now) {
 newErrors.performed_at ='La date ne peut pas être dans le futur'
}
}

 if (performance?.exercise_type ==='Musculation') {
 if (!performance.weight || performance.weight <= 0) {
 newErrors.weight ='Le poids est requis et doit être supérieur à 0'
}
 if (!performance.reps || performance.reps <= 0) {
 newErrors.reps ='Le nombre de répétitions est requis'
}
} else if (performance?.exercise_type ==='Cardio') {
 if (!performance.duration || performance.duration <= 0) {
 newErrors.duration ='La durée est requise'
}
}

 setErrors(newErrors)
 return Object.keys(newErrors).length === 0
}

 const handleSave = async () => {
 if (!performance || !validateForm()) return

 setSaving(true)
 
 try {
 const supabase = createClient()

 // Préparer les données pour la mise à jour
 const updateData: Record<string, unknown> = {
 performed_at: performance.performed_at,
 notes: performance.notes?.trim() || null,
 updated_at: new Date().toISOString()
}

 // Ajouter les champs selon le type d'exercice
 if (performance.exercise_type ==='Musculation') {
 updateData.weight = performance.weight
 updateData.reps = performance.reps
 updateData.set_number = performance.set_number
} else if (performance.exercise_type ==='Cardio') {
 updateData.duration_seconds = performance.duration
 updateData.distance = performance.distance
 updateData.distance_unit = performance.distance_unit
 updateData.speed = performance.speed
 updateData.calories = performance.calories
 updateData.stroke_rate = performance.stroke_rate
 updateData.watts = performance.watts
 updateData.heart_rate = performance.heart_rate
 updateData.incline = performance.incline
 updateData.cadence = performance.cadence
 updateData.resistance = performance.resistance
}

 // Mettre à jour la performance
 const { error} = await supabase
 .from('performance_logs')
 .update(updateData)
 .eq('id', performanceId)

 if (error) throw error

 toast.success('Performance mise à jour avec succès')
 router.push('/exercises')

} catch (error) {
 console.error('Erreur lors de la sauvegarde:', error)
 toast.error('Erreur lors de la sauvegarde')
} finally {
 setSaving(false)
}
}

 const handleCancel = () => {
 router.push(`/exercises`)
}

 if (loading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <motion.div
 animate={{ rotate: 360}}
 transition={{ duration: 1, repeat: Infinity, ease:'linear'}}
 className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
 />
 </div>
 )
}

 if (!performance) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <AlertCircle className="mx-auto h-12 w-12 text-safe-error mb-4" />
 <h2 className="text-xl font-semibold text-foreground mb-2">Performance introuvable</h2>
 <p className="text-gray-600 mb-4">La performance demandée n'existe pas ou a été supprimée.</p>
 <Button onClick={() => router.push('/exercises')}>
 Retour aux exercices
 </Button>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-background">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 className="bg-card border-b border-border sticky top-0 z-10"
 >
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <div className="flex items-center space-x-4">
 <Button
 variant="ghost"
 size="icon"
 onClick={handleCancel}
 className="text-gray-700 hover:text-foreground dark:text-foreground"
 >
 <ArrowLeft className="h-5 w-5" />
 </Button>
 <div>
 <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
 {performance.exercise_type ==='Musculation' ? (
 <Dumbbell className="h-5 w-5 text-orange-800" />
 ) : (
 <Activity className="h-5 w-5 text-orange-800" />
 )}
 Modifier la performance
 </h1>
 <p className="text-sm text-gray-600">{performance.exercise_name}</p>
 </div>
 </div>
 
 <div className="flex items-center space-x-2">
 <Button
 variant="secondary"
 onClick={handleCancel}
 disabled={saving}
 className="hidden sm:flex items-center gap-2"
 >
 <X className="h-6 w-6" />
 Annuler
 </Button>
 <Button
 onClick={handleSave}
 disabled={saving}
 className="flex items-center gap-2"
 >
 <Save className="h-6 w-6" />
 {saving ?'Enregistrement...' :'Enregistrer'}
 </Button>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Content */}
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.1}}
 className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
 >
 <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
 
 {/* Form Content */}
 <div className="p-6 space-y-6">
 
 {/* Date et temps */}
 <div className="border-b border-border pb-6">
 <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
 <Calendar className="h-5 w-5 text-orange-800" />
 Date de la performance
 </h3>
 
 <div className="space-y-2">
 <Label htmlFor="performed_at">Date et heure</Label>
 <Input
 id="performed_at"
 type="datetime-local"
 value={performance.performed_at ? new Date(performance.performed_at).toISOString().slice(0, 16) :''}
 onChange={(e) => {
 const newDate = new Date(e.target.value).toISOString()
 setPerformance({
 ...performance, 
 performed_at: newDate
})
 
 // Avertissement si changement de date significatif
 if (originalPerformedAt && newDate !== originalPerformedAt) {
 const originalDate = new Date(originalPerformedAt)
 const newDateObj = new Date(newDate)
 const daysDiff = Math.abs((newDateObj.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24))
 
 if (daysDiff > 1) {
 setShowDateWarning(true)
}
}
}}
 className={errors.performed_at ?'border-red-500 focus:border-red-500 focus:ring-red-500' :''}
 />
 {errors.performed_at && (
 <p className="text-sm text-safe-error">{errors.performed_at}</p>
 )}
 </div>
 </div>

 {/* Métriques selon le type */}
 <div className="space-y-6">
 <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
 {performance.exercise_type ==='Musculation' ? (
 <Dumbbell className="h-5 w-5 text-orange-800" />
 ) : (
 <Target className="h-5 w-5 text-orange-800" />
 )}
 Métriques de performance
 </h3>

 {performance.exercise_type ==='Musculation' ? (
 // Formulaire Musculation
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="space-y-2">
 <Label htmlFor="weight" className="text-sm font-medium">
 Poids (kg) <span className="text-safe-error">*</span>
 </Label>
 <Input
 id="weight"
 type="number"
 min="0"
 step="0.5"
 value={performance.weight ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 weight: Number(e.target.value)
})}
 placeholder="60"
 className={errors.weight ?'border-red-500 focus:border-red-500 focus:ring-red-500' :''}
 />
 {errors.weight && (
 <p className="text-sm text-safe-error">{errors.weight}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="reps" className="text-sm font-medium">
 Répétitions <span className="text-safe-error">*</span>
 </Label>
 <Input
 id="reps"
 type="number"
 min="1"
 value={performance.reps ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 reps: Number(e.target.value)
})}
 placeholder="10"
 className={errors.reps ?'border-red-500 focus:border-red-500 focus:ring-red-500' :''}
 />
 {errors.reps && (
 <p className="text-sm text-safe-error">{errors.reps}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="set_number" className="text-sm font-medium">Nombre de séries</Label>
 <Input
 id="set_number"
 type="number"
 min="1"
 value={performance.set_number ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 set_number: Number(e.target.value)
})}
 placeholder="3"
 />
 </div>
 </div>
 ) : (
 // Formulaire Cardio
 <div className="space-y-6">
 {/* Métriques de base */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label htmlFor="duration" className="text-sm font-medium">
 Durée (minutes) <span className="text-safe-error">*</span>
 </Label>
 <Input
 id="duration"
 type="number"
 min="0"
 step="0.1"
 value={performance.duration ? Math.round(performance.duration / 60 * 10) / 10 :''}
 onChange={(e) => setPerformance({
 ...performance, 
 duration: Math.round(Number(e.target.value) * 60)
})}
 placeholder="30"
 className={errors.duration ?'border-red-500 focus:border-red-500 focus:ring-red-500' :''}
 />
 {errors.duration && (
 <p className="text-sm text-safe-error">{errors.duration}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="distance" className="text-sm font-medium">Distance</Label>
 <div className="flex gap-2">
 <Input
 id="distance"
 type="number"
 min="0"
 step="0.1"
 value={performance.distance ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 distance: Number(e.target.value)
})}
 placeholder="5"
 className="flex-1"
 />
 <select
 value={performance.distance_unit ||'km'}
 onChange={(e) => setPerformance({
 ...performance, 
 distance_unit: e.target.value
})}
 className="px-2 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
 >
 <option value="km">km</option>
 <option value="m">m</option>
 <option value="miles">miles</option>
 </select>
 </div>
 </div>
 </div>

 {/* Métriques avancées */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="space-y-2">
 <Label htmlFor="speed" className="text-sm font-medium">Vitesse (km/h)</Label>
 <Input
 id="speed"
 type="number"
 min="0"
 step="0.1"
 value={performance.speed ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 speed: Number(e.target.value)
})}
 placeholder="12"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="calories" className="text-sm font-medium">Calories</Label>
 <Input
 id="calories"
 type="number"
 min="0"
 value={performance.calories ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 calories: Number(e.target.value)
})}
 placeholder="300"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="heart_rate" className="text-sm font-medium">Fréquence cardiaque (BPM)</Label>
 <Input
 id="heart_rate"
 type="number"
 min="60"
 max="200"
 value={performance.heart_rate ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 heart_rate: Number(e.target.value)
})}
 placeholder="150"
 />
 </div>
 </div>

 {/* Métriques spécialisées */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="space-y-2">
 <Label htmlFor="stroke_rate" className="text-sm font-medium">Cadence rameur (SPM)</Label>
 <Input
 id="stroke_rate"
 type="number"
 min="16"
 max="36"
 value={performance.stroke_rate ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 stroke_rate: Number(e.target.value)
})}
 placeholder="28"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="watts" className="text-sm font-medium">Puissance (watts)</Label>
 <Input
 id="watts"
 type="number"
 min="50"
 max="500"
 value={performance.watts ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 watts: Number(e.target.value)
})}
 placeholder="180"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="incline" className="text-sm font-medium">Inclinaison (%)</Label>
 <Input
 id="incline"
 type="number"
 min="-15"
 max="15"
 step="0.1"
 value={performance.incline ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 incline: Number(e.target.value)
})}
 placeholder="0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="cadence" className="text-sm font-medium">Cadence vélo (RPM)</Label>
 <Input
 id="cadence"
 type="number"
 min="50"
 max="120"
 value={performance.cadence ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 cadence: Number(e.target.value)
})}
 placeholder="85"
 />
 </div>
 </div>
 </div>
 )}

 {/* Avertissement changement de date */}
 {showDateWarning && (
 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
 <div className="flex items-start space-x-2">
 <div className="flex-shrink-0">
 <AlertCircle className="h-5 w-5 text-amber-500" />
 </div>
 <div className="flex-1">
 <h4 className="text-sm font-medium text-amber-800">
 Attention : Changement de date détecté
 </h4>
 <p className="mt-1 text-sm text-amber-700">
 Modifier la date de cette performance peut affecter son classement dans l'historique. 
 Si cette performance devient la plus récente, elle s'affichera comme"dernière performance" 
 sur la carte de l'exercice, même si d'autres performances récentes sont meilleures.
 </p>
 <button
 type="button"
 onClick={() => setShowDateWarning(false)}
 className="mt-2 text-sm text-amber-800 underline hover:no-underline"
 >
 J'ai compris
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Notes */}
 <div className="space-y-2">
 <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
 <Textarea
 id="notes"
 value={performance.notes ||''}
 onChange={(e) => setPerformance({
 ...performance, 
 notes: e.target.value
})}
 placeholder="Notes sur cette performance, ressenti, observations..."
 rows={3}
 className="resize-none"
 />
 </div>
 </div>
 </div>

 {/* Footer Actions */}
 <div className="bg-background px-6 py-4 border-t border-border">
 <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
 <Button
 variant="secondary"
 onClick={handleCancel}
 disabled={saving}
 className="w-full sm:w-auto"
 >
 Annuler
 </Button>
 <Button
 onClick={handleSave}
 disabled={saving}
 className="w-full sm:w-auto"
 >
 {saving ?'Enregistrement...' :'Enregistrer les modifications'}
 </Button>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 )
}