'use client'

import React, { useCallback} from'react'
import { motion} from'framer-motion'
import { Activity, Heart, Zap} from'lucide-react'
import { Input} from'@/components/ui/input'
import { Label} from'@/components/ui/label'
// Removed deprecated *MigratedMigrated imports - using basic shadcn/ui components
import { CardioMetrics, StrengthMetrics} from'@/types/performance'

interface ExerciseDefaultMetricsFormProps {
 exerciseType:'Musculation' |'Cardio' |'Fitness' |'Étirement'
 equipment: string
 exerciseName: string
 cardioData: CardioMetrics
 strengthData: StrengthMetrics
 setCardioData: React.Dispatch<React.SetStateAction<CardioMetrics>>
 setStrengthData: React.Dispatch<React.SetStateAction<StrengthMetrics>>
}

/**
 * Composant dédié aux métriques par défaut d'exercice (edit-exercise)
 * Utilise la même logique qu'AdaptiveMetricsForm mais pour valeurs par défaut
 */
export function ExerciseDefaultMetricsForm({
 exerciseType,
 equipment,
 exerciseName,
 cardioData,
 strengthData,
 setCardioData,
 setStrengthData
}: ExerciseDefaultMetricsFormProps) {

 // Détection intelligente de l'équipement (copié d'AdaptiveMetricsForm)
 const getEquipmentType = (equipment: string, exerciseName: string ='') => {
 const exerciseSearch = (exerciseName ||'').toLowerCase()
 const equipmentSearch = (equipment ||'').toLowerCase()
 const searchText = `${exerciseSearch} ${equipmentSearch}`.trim()
 
 // Détection rameur
 if (searchText.includes('rameur') || searchText.includes('rower') || searchText.includes('rowing')) {
 return'rowing'
}
 
 // Détection course/tapis - améliorée pour course extérieure
 if (searchText.includes('tapis') || searchText.includes('course') || searchText.includes('running') || 
 searchText.includes('treadmill') || searchText.includes('run') || searchText.includes('jogging') ||
 searchText.includes('marche') || searchText.includes('footing')) {
 return'running'
}
 
 // Détection vélo
 if (searchText.includes('vélo') || searchText.includes('bike') || searchText.includes('cycling') || searchText.includes('elliptique')) {
 return'cycling'
}
 
 return'general'
}

 const equipmentType = getEquipmentType(equipment, exerciseName)

 // Optimisation: fonctions onChange stables avec useCallback
 const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 setStrengthData(prev => ({
 ...prev,
 weight: parseFloat(e.target.value) || 0
}))
}, [setStrengthData])

 const handleRepsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 setStrengthData(prev => ({
 ...prev,
 reps: parseInt(e.target.value) || 0
}))
}, [setStrengthData])

 const handleSetsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 setStrengthData(prev => ({
 ...prev,
 sets: parseInt(e.target.value) || 0
}))
}, [setStrengthData])

 // Rendu des métriques de musculation
 const renderStrengthMetrics = () => {
 if (exerciseType !=='Musculation') return null

 return (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <Activity className="w-5 h-5 text-primary" />
 <h4 className="font-semibold text-foreground">Métriques par défaut - Musculation</h4>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="default-weight">Poids par défaut (kg)</Label>
 <Input
 id="default-weight"
 type="number"
 value={strengthData.weight ||''}
 onChange={handleWeightChange}
 className="text-center text-lg font-semibold"
 placeholder="0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="default-reps">Répétitions par défaut</Label>
 <Input
 id="default-reps"
 type="number"
 value={strengthData.reps ||''}
 onChange={handleRepsChange}
 className="text-center text-lg font-semibold"
 placeholder="0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="default-sets">Séries par défaut</Label>
 <Input
 id="default-sets"
 type="number"
 value={strengthData.sets ||''}
 onChange={handleSetsChange}
 className="text-center text-lg font-semibold"
 placeholder="0"
 />
 </div>
 </div>
 </motion.div>
 )
}

 // Rendu des métriques cardio spécialisées
 const renderCardioMetrics = () => {
 if (exerciseType !=='Cardio') return null

 switch (equipmentType) {
 case'rowing':
 return (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <Heart className="w-5 h-5 text-safe-info" />
 <h4 className="font-semibold text-foreground">Métriques par défaut - Rameur</h4>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="rowing-distance">Distance par défaut (m)</Label>
 <Input
 id="rowing-distance"
 type="number"
 value={cardioData.distance ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 distance: parseFloat(e.target.value) || 0
}))}
 className="text-center text-lg font-semibold"
 placeholder="2000"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="rowing-spm">SPM par défaut</Label>
 <Input
 id="rowing-spm"
 type="number"
 min={16}
 max={36}
 step={1}
 placeholder="24"
 value={cardioData.rowing?.stroke_rate ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 rowing: { stroke_rate: parseInt(e.target.value) || 24, watts: prev.rowing?.watts || 0}
}))}
 className="text-center"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="rowing-watts">Watts par défaut</Label>
 <Input
 id="rowing-watts"
 type="number"
 min={50}
 max={600}
 step={5}
 placeholder="150"
 value={cardioData.rowing?.watts ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 rowing: { watts: parseInt(e.target.value) || 150, stroke_rate: prev.rowing?.stroke_rate || 24}
}))}
 className="text-center"
 />
 </div>
 </div>
 </motion.div>
 )

 case'running':
 return (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <Zap className="w-5 h-5 text-safe-success" />
 <h4 className="font-semibold text-foreground">Métriques par défaut - Course</h4>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
 <div className="space-y-2">
 <Label htmlFor="running-distance">Distance par défaut (km)</Label>
 <Input
 id="running-distance"
 type="number"
 step="0.1"
 value={cardioData.distance ? (cardioData.distance / 1000) :''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 distance: parseFloat(e.target.value) * 1000 || 0
}))}
 className="text-center text-lg font-semibold"
 placeholder="5.0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="running-speed">Vitesse par défaut (km/h)</Label>
 <Input
 id="running-speed"
 type="number"
 step="0.1"
 value={cardioData.running?.speed ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 running: { 
 speed: parseFloat(e.target.value) || 0,
 incline: prev.running?.incline || 0
}
}))}
 className="text-center text-lg font-semibold"
 placeholder="10.0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="running-heart-rate">Fréquence cardiaque (BPM)</Label>
 <Input
 id="running-heart-rate"
 type="number"
 min="60"
 max="220"
 value={cardioData.heart_rate ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 heart_rate: parseInt(e.target.value) || 0
}))}
 className="text-center text-lg font-semibold"
 placeholder="140"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="running-incline">Inclinaison par défaut (%)</Label>
 <Input
 id="running-incline"
 type="number"
 step="0.5"
 value={cardioData.running?.incline ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 running: { 
 incline: parseFloat(e.target.value) || 0,
 speed: prev.running?.speed || 0
}
}))}
 className="text-center text-lg font-semibold"
 placeholder="0.0"
 />
 <p className="text-xs text-gray-600">Pour tapis de course uniquement</p>
 </div>
 </div>
 </motion.div>
 )

 case'cycling':
 return (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <Activity className="w-5 h-5 text-safe-primary" />
 <h4 className="font-semibold text-foreground">Métriques par défaut - Vélo</h4>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="cycling-distance">Distance par défaut (km)</Label>
 <Input
 id="cycling-distance"
 type="number"
 step="0.1"
 value={cardioData.distance ? (cardioData.distance / 1000) :''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 distance: parseFloat(e.target.value) * 1000 || 0
}))}
 className="text-center text-lg font-semibold"
 placeholder="20.0"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="cycling-cadence">Cadence par défaut (RPM)</Label>
 <Input
 id="cycling-cadence"
 type="number"
 min={40}
 max={150}
 step={1}
 placeholder="80"
 value={cardioData.cycling?.cadence ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 cycling: { 
 cadence: parseInt(e.target.value) || 80, 
 resistance: prev.cycling?.resistance || 5
}
}))}
 className="text-center"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="cycling-resistance">Résistance par défaut</Label>
 <Input
 id="cycling-resistance"
 type="number"
 value={cardioData.cycling?.resistance ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 cycling: { 
 resistance: parseInt(e.target.value) || 0,
 cadence: prev.cycling?.cadence || 80
}
}))}
 className="text-center text-lg font-semibold"
 placeholder="5"
 />
 </div>
 </div>
 </motion.div>
 )

 default:
 return (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-4"
 >
 <div className="flex items-center gap-2 mb-2">
 <Heart className="w-5 h-5 text-safe-error" />
 <h4 className="font-semibold text-foreground">Métriques par défaut - Cardio général</h4>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="general-duration">Durée par défaut (min)</Label>
 <Input
 id="general-duration"
 type="number"
 min={1}
 max={120}
 step={1}
 placeholder="30"
 value={cardioData.duration_seconds ? Math.round(cardioData.duration_seconds / 60) :''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 duration_seconds: (parseInt(e.target.value) || 30) * 60
}))}
 className="text-center"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="general-calories">Calories par défaut</Label>
 <Input
 id="general-calories"
 type="number"
 value={cardioData.calories ||''}
 onChange={(e) => setCardioData(prev => ({
 ...prev,
 calories: parseInt(e.target.value) || 0
}))}
 className="text-center text-lg font-semibold"
 placeholder="300"
 />
 </div>
 </div>
 </motion.div>
 )
}
}

 return (
 <div className="space-y-6">
 {renderStrengthMetrics()}
 {renderCardioMetrics()}
 
 <div className="mt-4 p-2 bg-orange-50 rounded-lg border border-orange-200">
 <p className="text-sm text-orange-800">
 <strong>Note :</strong> Ces valeurs serviront de base lors de la création de nouvelles performances pour cet exercice.
 </p>
 </div>
 </div>
 )
}