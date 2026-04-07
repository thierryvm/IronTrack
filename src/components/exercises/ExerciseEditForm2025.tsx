'use client'

import React, { useState, useEffect} from'react'
import { useRouter} from'next/navigation'
import { motion} from'framer-motion'
import { ArrowLeft, Dumbbell, Target, AlertCircle, Activity} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import { toast} from'react-hot-toast'
import { ExercisePhotoUpload} from'@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment} from'@/utils/fileUpload'
import { mapDifficultyFromNumber, mapDifficultyToNumber, difficulties, type DifficultyString} from'@/utils/difficultyMapping'
import { Button} from'@/components/ui/button'
import { Input} from'@/components/ui/input'
import { Textarea} from'@/components/ui/textarea'
import { Label} from'@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from'@/components/ui/select'
import { ExerciseDefaultMetricsForm} from'@/components/exercises/ExerciseDefaultMetricsForm'
import { validateExerciseClientSide, validateExerciseUpdateData, type ExerciseUpdateData} from'@/utils/exerciseValidation'
import { CardioMetrics, StrengthMetrics} from'@/types/performance'

interface ExerciseEditForm2025Props {
 exerciseId: string
}

interface ExerciseData {
 name: string
 exercise_type:'Musculation' |'Cardio'
 muscle_group: string
 equipment_id: number
 difficulty: DifficultyString
 description?: string
 image_url?: string
 notes?: string // Notes from latest performance (read-only)
}

// Les groupes musculaires seront chargés depuis la base de données
interface MuscleGroupOption {
 id: number
 name: string
}

const difficultyColors: Record<DifficultyString, string> = {
'Débutant':'bg-emerald-500/10 text-safe-success border-emerald-500/20',
'Intermédiaire':'bg-amber-500/10 text-safe-warning border-amber-500/20',
'Avancé':'bg-rose-500/10 text-safe-error border-rose-500/20',
'Expert':'bg-primary/10 text-primary border-primary/20',
'Élite':'bg-foreground text-background border-foreground'
}

export const ExerciseEditForm2025: React.FC<ExerciseEditForm2025Props> = ({ exerciseId}) => {
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [exercise, setExercise] = useState<ExerciseData | null>(null)
 const [equipmentOptions, setEquipmentOptions] = useState<{id: number, name: string}[]>([])
 const [muscleGroups, setMuscleGroups] = useState<MuscleGroupOption[]>([])
 const [exercisePhoto, setExercisePhoto] = useState<SecureAttachment | null>(null)
 const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)
 const [errors, setErrors] = useState<Record<string, string>>({})
 const [updateLastPerformance, setUpdateLastPerformance] = useState(false)
 
 // États pour métriques adaptatives (structure simplifiée pour l'UI)
 const [cardioData, setCardioData] = useState<CardioMetrics>({
 duration_seconds: 0,
 distance: 0,
 distance_unit:'km',
 heart_rate: 0
})
 
 const [strengthData, setStrengthData] = useState<StrengthMetrics>({
 weight: 0,
 reps: 0,
 sets: 1,
 rpe: 5,
 rest_seconds: 60
})

 useEffect(() => {
 const fetchData = async () => {
 try {
 const supabase = createClient()
 
 // Récupérer l'exercice avec toutes les colonnes métriques
 const { data: exerciseData, error: exerciseError} = await supabase
 .from('exercises')
 .select('*, default_cardio_metrics, default_strength_metrics')
 .eq('id', exerciseId)
 .single()

 if (exerciseError) {
 if (exerciseError.code ==='PGRST116' || exerciseError.message?.includes('No rows')) {
 // Exercice non trouvé (404)
 toast.error(`Exercice ${exerciseId} non trouvé`)
 router.push('/exercises')
 return
}
 throw exerciseError
}

 // Récupérer la dernière performance complète avec métriques
 const { data: latestPerformanceData} = await supabase
 .from('performance_logs')
 .select('*')
 .eq('exercise_id', exerciseId)
 .order('performed_at', { ascending: false})
 .limit(1)
 
 const latestPerformance = latestPerformanceData?.[0] || null

 // Récupérer les équipements
 const { data: equipmentData, error: equipmentError} = await supabase
 .from('equipment')
 .select('id, name')
 .order('name')

 if (equipmentError) throw equipmentError

 // Récupérer les groupes musculaires
 const { data: muscleGroupData, error: muscleGroupError} = await supabase
 .from('muscle_groups')
 .select('id, name')
 .order('name')

 if (muscleGroupError) throw muscleGroupError

 // Vérification exercice existe
 if (!exerciseData) {
 throw new Error('Exercice non trouvé')
}


 // Format des données
 const formattedExercise: ExerciseData = {
 name: exerciseData.name ||'',
 exercise_type: exerciseData.exercise_type ||'Musculation',
 muscle_group: exerciseData.muscle_group ||'',
 equipment_id: exerciseData.equipment_id || 1,
 difficulty: typeof exerciseData.difficulty ==='number' 
 ? mapDifficultyFromNumber(exerciseData.difficulty)
 : (exerciseData.difficulty as DifficultyString) ||'Débutant',
 description: exerciseData.description ||'',
 image_url: exerciseData.image_url,
 notes: latestPerformance?.notes ||''
}

 setExercise(formattedExercise)
 setEquipmentOptions(equipmentData || [])
 setMuscleGroups(muscleGroupData || [])
 setCurrentPhotoUrl(exerciseData.image_url)
 
 // 📊 CHARGER MÉTRIQUES PAR DÉFAUT depuis exercises
 // Prioriser les métriques par défaut stockées dans exercises
 // Priorité 1: Métriques par défaut stockées dans exercises 
 if (exerciseData.default_cardio_metrics && exerciseData.exercise_type ==='Cardio') {
 setCardioData(exerciseData.default_cardio_metrics)
} else if (latestPerformance && exerciseData.exercise_type ==='Cardio') {
 // Fallback: Dernière performance cardio
 setCardioData({
 duration_seconds: latestPerformance.duration_seconds || 0,
 distance: latestPerformance.distance || 0,
 distance_unit: latestPerformance.distance_unit ||'km',
 heart_rate: latestPerformance.heart_rate || 0,
 calories: latestPerformance.calories || 0,
 // Métriques spécialisées selon équipement
 rowing: {
 stroke_rate: latestPerformance.stroke_rate || 20,
 watts: latestPerformance.watts || 150
},
 cycling: {
 cadence: latestPerformance.cadence || 85,
 resistance: latestPerformance.resistance || 8
},
 running: {
 speed: latestPerformance.speed || 10,
 incline: latestPerformance.incline || 0
}
})
}
 
 // Métriques musculation - même logique 
 if (exerciseData.default_strength_metrics && exerciseData.exercise_type ==='Musculation') {
 setStrengthData(exerciseData.default_strength_metrics)
} else if (latestPerformance && exerciseData.exercise_type ==='Musculation') {
 // Fallback: Dernière performance musculation
 setStrengthData({
 weight: latestPerformance.weight || 0,
 reps: latestPerformance.reps || 0,
 sets: latestPerformance.sets || 1,
 rpe: latestPerformance.rpe || 5,
 rest_seconds: latestPerformance.rest_seconds || 60
})
}

} catch {
 toast.error('Erreur lors du chargement de l\'exercice')
 router.push('/exercises')
} finally {
 setLoading(false)
}
}

 fetchData()
}, [exerciseId, router])

 const validateForm = (): boolean => {
 if (!exercise) return false

 // Utiliser notre nouvelle validation sécurisée
 const validationResult = validateExerciseClientSide({
 name: exercise.name,
 exercise_type: exercise.exercise_type,
 muscle_group: exercise.muscle_group,
 equipment_id: exercise.equipment_id,
 difficulty: mapDifficultyToNumber(exercise.difficulty),
 description: exercise.description
})

 setErrors(validationResult.errors)
 return validationResult.isValid
}

 const handleSave = async () => {
 if (!exercise) {
 return
}
 
 const isValid = validateForm()
 
 if (!isValid) {
 return
}

 setSaving(true)
 
 try {
 const supabase = createClient()

 // Préparer données avec validation sécurisée côté serveur
 const candidateData: ExerciseUpdateData = {
 name: exercise.name,
 exercise_type: exercise.exercise_type,
 muscle_group: exercise.muscle_group,
 equipment_id: exercise.equipment_id,
 difficulty: mapDifficultyToNumber(exercise.difficulty),
 description: exercise.description || null,
 image_url: exercisePhoto?.url || currentPhotoUrl || null,
 // Ajouter métriques par défaut
 default_strength_metrics: strengthData,
 default_cardio_metrics: cardioData
}



 // Validation sécurisée complète côté serveur
 const serverValidation = validateExerciseUpdateData(candidateData)
 
 if (!serverValidation.isValid) {
 // Afficher erreurs serveur
 const errorMessages = serverValidation.errors.join(',')
 toast.error(`Erreurs de validation: ${errorMessages}`)
 return
}

 // Utiliser données validées (type-safe)
 const updateData = {
 ...serverValidation.data,
 updated_at: new Date().toISOString()
}


 // Mettre à jour l'exercice avec données sécurisées
 const { error} = await supabase
 .from('exercises')
 .update(updateData)
 .eq('id', exerciseId)
 .select() // Récupérer les données mises à jour


 if (error) throw error

 // 🔄 MISE À JOUR DERNIÈRE PERFORMANCE si demandée
 if (updateLastPerformance) {
 // Récupérer la dernière performance
 const { data: latestPerfData} = await supabase
 .from('performance_logs')
 .select('*')
 .eq('exercise_id', exerciseId)
 .order('performed_at', { ascending: false})
 .limit(1)
 
 if (latestPerfData && latestPerfData[0]) {
 const latestPerf = latestPerfData[0]
 
 // Préparer les nouvelles données selon le type d'exercice
 const perfUpdateData: Record<string, unknown> = {}
 
 if (exercise.exercise_type ==='Cardio') {
 if (cardioData.distance) perfUpdateData.distance = cardioData.distance
 if (cardioData.duration_seconds) perfUpdateData.duration_seconds = cardioData.duration_seconds
 if (cardioData.heart_rate) perfUpdateData.heart_rate = cardioData.heart_rate
 if (cardioData.calories) perfUpdateData.calories = cardioData.calories
 
 // Métriques spécialisées
 if (cardioData.running?.speed) perfUpdateData.speed = cardioData.running.speed
 if (cardioData.running?.incline) perfUpdateData.incline = cardioData.running.incline
 if (cardioData.rowing?.stroke_rate) perfUpdateData.stroke_rate = cardioData.rowing.stroke_rate
 if (cardioData.rowing?.watts) perfUpdateData.watts = cardioData.rowing.watts
 if (cardioData.cycling?.cadence) perfUpdateData.cadence = cardioData.cycling.cadence
 if (cardioData.cycling?.resistance) perfUpdateData.resistance = cardioData.cycling.resistance
} else if (exercise.exercise_type ==='Musculation') {
 if (strengthData.weight) perfUpdateData.weight = strengthData.weight
 if (strengthData.reps) perfUpdateData.reps = strengthData.reps
 if (strengthData.sets) perfUpdateData.sets = strengthData.sets
 if (strengthData.rpe) perfUpdateData.rpe = strengthData.rpe
 if (strengthData.rest_seconds) perfUpdateData.rest_seconds = strengthData.rest_seconds
}
 
 // Mettre à jour la performance si des données ont changé
 if (Object.keys(perfUpdateData).length > 0) {
 const { error: perfError} = await supabase
 .from('performance_logs')
 .update(perfUpdateData)
 .eq('id', latestPerf.id)
 
 if (perfError) {
 // Ne pas bloquer la sauvegarde de l'exercice pour une erreur de performance
}
}
}
}

 // 📝 MISE À JOUR NOTES PERFORMANCE si modifiées
 if (exercise.notes) {
 // Récupérer la dernière performance pour mettre à jour les notes
 const { data: latestPerformanceData} = await supabase
 .from('performance_logs')
 .select('id')
 .eq('exercise_id', exerciseId)
 .order('performed_at', { ascending: false})
 .limit(1)
 
 if (latestPerformanceData && latestPerformanceData[0]) {
 // Mettre à jour les notes de la dernière performance
 const { error: notesError} = await supabase
 .from('performance_logs')
 .update({ notes: exercise.notes})
 .eq('id', latestPerformanceData[0].id)
 
 if (notesError) {
 // Ne pas bloquer la sauvegarde de l'exercice pour une erreur de notes
}
}
}

 toast.success('Exercice mis à jour avec succès')
 router.push('/exercises')

} catch {
 toast.error('Erreur lors de la sauvegarde')
} finally {
 setSaving(false)
}
}

 const handleCancel = () => {
 router.push('/exercises')
}

 const handlePhotoUploaded = (attachment: SecureAttachment) => {
 setExercisePhoto(attachment)
 setCurrentPhotoUrl(attachment.url)
}

 const handlePhotoRemoved = () => {
 setExercisePhoto(null)
 setCurrentPhotoUrl(undefined)
}

 if (loading) {
 return (
 <div className="min-h-screen bg-muted flex items-center justify-center">
 <motion.div
 animate={{ rotate: 360}}
 transition={{ duration: 1, repeat: Infinity, ease:'linear'}}
 className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
 />
 </div>
 )
}

 if (!exercise) {
 return (
 <div className="min-h-screen bg-muted flex items-center justify-center">
 <div className="text-center">
 <AlertCircle className="mx-auto h-12 w-12 text-safe-error mb-4" />
 <h2 className="text-xl font-semibold text-foreground mb-2">Exercice introuvable</h2>
 <p className="text-muted-foreground mb-4">L'exercice demandé n'existe pas ou a été supprimé.</p>
 <Button onClick={() => router.push('/exercises')}>
 Retour aux exercices
 </Button>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-muted">
 {/* Header */}
 <div className="bg-card border-b border-border sticky top-0 z-10">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 <div className="flex items-center space-x-4">
 <Button
 variant="ghost"
 size="icon"
 onClick={handleCancel}
 className="text-foreground hover:text-foreground"
 >
 <ArrowLeft className="h-5 w-5" />
 </Button>
 <div>
 <h1 className="text-xl font-semibold text-foreground">
 Modifier l'exercice
 </h1>
 <p className="text-sm text-safe-muted">{exercise.name}</p>
 </div>
 </div>
 
 {/* Header épuré : seulement le titre, les actions sont en bas */}
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
 
 {/* Form Content */}
 <div className="p-6 space-y-6">
 
 {/* Photo Upload Section */}
 <div className="border-b border-border pb-6">
 <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
 <Target className="h-5 w-5 text-primary" />
 Photo de l'exercice
 </h3>
 <ExercisePhotoUpload
 currentPhoto={currentPhotoUrl}
 onPhotoUploaded={handlePhotoUploaded}
 onPhotoRemoved={handlePhotoRemoved}
 disabled={saving}
 />
 </div>

 {/* Basic Information */}
 <div className="space-y-6">
 <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
 <Dumbbell className="h-5 w-5 text-primary" />
 Informations de base
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label htmlFor="exercise-name">Nom de l'exercice *</Label>
 <Input
 id="exercise-name"
 value={exercise.name}
 onChange={(e) => setExercise({...exercise, name: e.target.value})}
 placeholder="Ex: Développé couché"
 className={errors.name ?'border-destructive' :''}
 />
 {errors.name && (
 <p className="text-sm text-safe-error">{errors.name}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label>Type d'exercice</Label>
 <div className="flex gap-2">
 {(['Musculation','Cardio'] as const).map((type) => (
 <label
 key={type}
 className={`
 flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all
 ${exercise.exercise_type === type
 ?'border-primary bg-primary/10 text-primary'
 :'border-border hover:border-border'
}
 `}
 >
 <input
 type="radio"
 className="sr-only"
 checked={exercise.exercise_type === type}
 onChange={() => setExercise({...exercise, exercise_type: type})}
 />
 <div className="text-center">
 <div className="font-medium">{type}</div>
 </div>
 </label>
 ))}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label htmlFor="muscle-group">Groupe musculaire *</Label>
 <Select
 value={exercise.muscle_group ||'none'}
 onValueChange={(value) => {
 // SÉCURITÉ: Nettoyer les valeurs de contrôle avant envoi
 const cleanValue = value ==='none' ?'' : value
 setExercise({...exercise, muscle_group: cleanValue})
}}
 >
 <SelectTrigger id="muscle-group" className={errors.muscle_group ?'border-destructive' :''}>
 <SelectValue placeholder="Sélectionner un groupe" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="none">Sélectionner un groupe</SelectItem>
 {muscleGroups.map((group) => (
 <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.muscle_group && (
 <p className="text-sm text-safe-error">{errors.muscle_group}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="equipment">Équipement</Label>
 <Select
 value={exercise.equipment_id?.toString() ||'none'}
 onValueChange={(value) => {
 // SÉCURITÉ: Nettoyer les valeurs de contrôle avant envoi
 const cleanValue = value ==='none' ? 0 : Number(value)
 setExercise({...exercise, equipment_id: cleanValue})
}}
 >
 <SelectTrigger id="equipment">
 <SelectValue placeholder="Sélectionner un équipement" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="none">Sélectionner un équipement</SelectItem>
 {equipmentOptions.map((equipment) => (
 <SelectItem key={equipment.id} value={equipment.id.toString()}>
 {equipment.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-2">
 <Label>Niveau de difficulté</Label>
 <div className="flex gap-2">
 {difficulties.map((level) => (
 <label
 key={level}
 className={`
 flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all
 ${exercise.difficulty === level
 ? difficultyColors[level]
 :'border-border hover:border-border'
}
 `}
 >
 <input
 type="radio"
 className="sr-only"
 checked={exercise.difficulty === level}
 onChange={() => setExercise({...exercise, difficulty: level as DifficultyString})}
 />
 <div className="text-center font-medium">{level}</div>
 </label>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="description">Description</Label>
 <p className="text-sm text-safe-muted">Instructions d'exécution, conseils techniques, muscles ciblés...</p>
 <Textarea
 value={exercise.description ||''}
 onChange={(e) => setExercise({...exercise, description: e.target.value})}
 placeholder="Décrivez l'exercice, la technique d'exécution, les muscles travaillés..."
 rows={4}
 />
 </div>

 {/* Notes de performance (maintenant éditables) */}
 <div className="space-y-2">
 <Label htmlFor="notes">Notes de la dernière performance</Label>
 <p className="text-sm text-safe-muted">Modifiez les notes de votre dernière session. Elles seront mises à jour dans votre historique de performance.</p>
 <Textarea
 value={exercise.notes ||''}
 onChange={(e) => setExercise(prev => ({ ...prev!, notes: e.target.value}))}
 placeholder="Ajoutez des notes sur votre dernière performance..."
 className="focus:ring-primary focus:border-primary"
 rows={3}
 />
 </div>

 {/* Section Métriques Spécifiques - Nouveau */}
 {exercise && (
 <div className="border-t border-border pt-6">
 <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
 <Activity className="h-5 w-5 text-primary" />
 Métriques spécifiques à l'exercice
 </h3>
 <p className="text-sm text-muted-foreground mb-6">
 Configurez les métriques par défaut pour ce type d'exercice. Ces valeurs serviront de base pour les nouvelles performances.
 </p>
 <ExerciseDefaultMetricsForm
 exerciseType={exercise.exercise_type}
 equipment={equipmentOptions.find(eq => eq.id === exercise.equipment_id)?.name ||''}
 exerciseName={exercise.name}
 cardioData={cardioData}
 strengthData={strengthData}
 setCardioData={setCardioData}
 setStrengthData={setStrengthData}
 />
 
 {/* Option de mise à jour de la dernière performance */}
 <div className="mt-6 p-4 bg-tertiary/8 border border-tertiary/25 rounded-lg">
 <label className="flex items-start gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={updateLastPerformance}
 onChange={(e) => setUpdateLastPerformance(e.target.checked)}
 className="mt-1 h-6 w-6 text-primary focus:ring-primary border-border rounded"
 />
 <div className="flex-1">
 <div className="font-medium text-foreground">
 Mettre à jour aussi la dernière performance
 </div>
 <div className="text-sm text-tertiary mt-1">
 💡 Cochez cette option si vous corrigez une erreur de saisie dans vos métriques. 
 Laissez décoché si vous configurez simplement les valeurs par défaut pour de futures performances.
 </div>
 </div>
 </label>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Footer Actions - Position fixe en bas */}
 <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 shadow-lg">
 <div className="flex flex-col sm:flex-row gap-2 sm:justify-end sm:items-center">
 <Button
 variant="secondary"
 onClick={handleCancel}
 disabled={saving}
 fullWidth
 className="sm:w-auto order-2 sm:order-1"
 >
 Annuler
 </Button>
 <Button
 variant="orange"
 onClick={handleSave}
 disabled={saving}
 fullWidth
 className="!bg-primary !hover:bg-primary-hover !text-white sm:w-auto order-1 sm:order-2"
 >
 {saving ?'Enregistrement...' :'Enregistrer les modifications'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
