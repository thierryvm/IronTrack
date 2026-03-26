'use client'

import React, { useState, useEffect, useCallback} from'react'
import Image from'next/image'
import { motion, AnimatePresence} from'framer-motion'
import { X, ArrowLeft, Trophy, Trash2, Edit3, Plus} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import { useRouter} from'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from'@/components/ui/dialog'
import { Button} from'@/components/ui/button'

// Types pour les métriques JSONB (champs Supabase non typés)
interface CardioMetrics {
 distance?: number
 running?: { speed?: number; incline?: number}
 rowing?: { stroke_rate?: number; watts?: number}
 cycling?: { cadence?: number; resistance?: number}
}
interface StrengthMetrics {
 weight?: number
 reps?: number
 sets?: number
}

interface Exercise {
 id: number
 name: string
 exercise_type:'Musculation' |'Cardio'
 muscle_group: string
 equipment: string
 difficulty:'Débutant' |'Intermédiaire' |'Avancé'
 description?: string
 instructions?: string
 image_url?: string
 sets?: number
 reps?: number
 duration?: number
 distance?: number
 rest_time?: number
 default_cardio_metrics?: Record<string, unknown>
 default_strength_metrics?: Record<string, unknown>
}

interface Performance {
 id: number
 performed_at: string
 weight?: number
 reps?: number
 duration?: number
 distance?: number
 calories?: number
 speed?: number
 notes?: string
 set_number?: number
}

interface ExerciseDetailsModalProps {
 exerciseId: string
 isOpen: boolean
 onClose: () => void
}

export const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({
 exerciseId,
 isOpen,
 onClose
}) => {
 const [exercise, setExercise] = useState<Exercise | null>(null)
 const [performances, setPerformances] = useState<Performance[]>([])
 const [loading, setLoading] = useState(true)
 const [deleteModalOpen, setDeleteModalOpen] = useState(false)
 const [perfToDelete, setPerfToDelete] = useState<Performance | null>(null)
 const router = useRouter()

 const loadExerciseData = useCallback(async () => {
 try {
 setLoading(true)
 const supabase = createClient()

 // Charger les données de l'exercice avec métriques par défaut
 const { data: exerciseData, error: exerciseError} = await supabase
 .from('exercises')
 .select('*, image_url, default_cardio_metrics, default_strength_metrics')
 .eq('id', exerciseId)
 .single()

 if (exerciseError) throw exerciseError

 // Charger les performances
 const { data: performanceData, error: perfError} = await supabase
 .from('performance_logs')
 .select('*')
 .eq('exercise_id', exerciseId)
 .order('performed_at', { ascending: false})

 if (perfError) throw perfError

 setExercise(exerciseData)
 setPerformances(performanceData || [])
} catch (error) {
 console.error('Erreur lors du chargement:', error)
} finally {
 setLoading(false)
}
}, [exerciseId])

 useEffect(() => {
 if (isOpen && exerciseId) {
 loadExerciseData()
}
}, [isOpen, exerciseId, loadExerciseData])

 const handleDeletePerformance = async (performance: Performance) => {
 try {
 const supabase = createClient()
 
 const { error} = await supabase
 .from('performance_logs')
 .delete()
 .eq('id', performance.id)

 if (error) throw error

 // Recharger les performances
 await loadExerciseData()
 setDeleteModalOpen(false)
 setPerfToDelete(null)
} catch (error) {
 console.error('Erreur lors de la suppression:', error)
}
}

 const getPerfLabel = (perf: Performance, exerciseType: string, exerciseName?: string) => {
 if (exerciseType ==='Cardio') {
 const parts = []
 const isRowing = exerciseName?.toLowerCase().includes('rameur')
 
 if (perf.distance) {
 // Adapter l'unité selon le type d'exercice avec conversion intelligente
 if (isRowing) {
 // Rameur â†’ afficher en mètres (ex: 2000m, 5000m)
 parts.push(`${perf.distance}m`)
} else {
 // Course/vélo â†’ vérifier si données en mètres ou km
 const distance = perf.distance
 if (distance > 100) {
 // Probablement en mètres si > 100, convertir en km
 parts.push(`${(distance / 1000).toFixed(1).replace('.0','')}km`)
} else {
 // Probablement déjà en km si â‰¤ 100
 parts.push(`${distance}km`)
}
}
}
 if (perf.duration) parts.push(`${Math.round(perf.duration / 60)}min`)
 if (perf.calories) parts.push(`${perf.calories} kcal`)
 
 return parts.join(' â€¢') ||'Performance cardio'
} else {
 const parts = []
 if (perf.weight) parts.push(`${perf.weight}kg`)
 if (perf.reps) parts.push(`${perf.reps} reps`)
 return parts.join(' ×') ||'Performance musculation'
}
}

 const lastPerf = performances[0]

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden p-0 bg-card">
 <DialogHeader className="sr-only">
 <DialogTitle>
 Détails de l'exercice {exercise?.name ||''}
 </DialogTitle>
 <DialogDescription>
 Consultation des informations détaillées et performances de cet exercice
 </DialogDescription>
 </DialogHeader>
 
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20}}
 animate={{ opacity: 1, scale: 1, y: 0}}
 exit={{ opacity: 0, scale: 0.95, y: 20}}
 className="w-full h-full"
 >
 {/* Header visuel - conservé pour l'UI */}
 <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
 <Button
 onClick={onClose}
 variant="ghost"
 size="sm"
 className="p-2 hover:bg-muted"
 aria-label="Retour à la liste des exercices"
 >
 <ArrowLeft className="w-5 h-5 text-gray-600" />
 </Button>
 <h2 className="text-lg font-semibold text-foreground text-center flex-1">
 Détails de l'exercice
 </h2>
 {/* Bouton X supprimé - DialogContent gère déjà la fermeture */}
 </div>

 {/* Content */}
 <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
 {loading ? (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 ) : exercise ? (
 <div className="space-y-6">
 {/* Photo de l'exercice */}
 {exercise.image_url && (
 <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-muted">
 <Image
 src={exercise.image_url}
 alt={`Photo de ${exercise.name}`}
 fill
 className="object-cover object-center"
 sizes="(max-width: 640px) 100vw, 50vw"
 />
 </div>
 )}
 {/* Info exercice */}
 <div>
 <div className="flex items-start justify-between mb-2">
 <h3 className="text-xl font-bold text-foreground">{exercise.name}</h3>
 {(() => {
 // Calcul du score de complétion
 let score = 60 // Base pour champs requis
 if (exercise.description) score += 20
 if (exercise.instructions) score += 15
 if (exercise.image_url) score += 5
 
 const getScoreColor = (s: number) => {
 if (s >= 95) return'text-green-600 bg-green-50 border-green-200'
 if (s >= 80) return'text-secondary bg-tertiary/8 border-tertiary/25'
 if (s >= 60) return'text-orange-800 bg-orange-50 border-orange-200'
 return'text-red-600 bg-red-50 border-red-200'
}
 
 return (
 <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${getScoreColor(score)}`}>
 <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
 Profil {score}%
 {score >= 95 && <span>âœ¨</span>}
 </div>
 )
})()}
 </div>
 <div className="flex flex-wrap gap-2 text-sm">
 <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
 {exercise.muscle_group}
 </span>
 <span className="bg-tertiary/12 text-tertiary px-2 py-1 rounded-full">
 {exercise.equipment}
 </span>
 <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
 {exercise.difficulty}
 </span>
 </div>
 {/* Description et instructions */}
 <div className="mt-4 space-y-2">
 {exercise.description ? (
 <div>
 <h5 className="text-sm font-medium text-foreground mb-1">Description</h5>
 <p className="text-muted-foreground">{exercise.description}</p>
 </div>
 ) : (
 <div className="bg-tertiary/8 border border-tertiary/25 rounded-lg p-2">
 <p className="text-sm text-tertiary">
 💡 <strong>Améliore ton exercice :</strong> Ajoute une description pour le rendre plus facile à identifier
 </p>
 </div>
 )}
 
 {exercise.instructions ? (
 <div>
 <h5 className="text-sm font-medium text-foreground mb-1">Instructions</h5>
 <p className="text-muted-foreground text-sm whitespace-pre-line">{exercise.instructions}</p>
 </div>
 ) : (
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
 <p className="text-sm text-yellow-700">
 📝 <strong>Complète ton exercice :</strong> Ajoute des instructions détaillées d'exécution
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Dernière performance */}
 <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
 <Trophy className="h-6 w-6 text-safe-warning" />
 {lastPerf ? (
 <span className="text-foreground">
 Dernière : <span className="font-bold">{getPerfLabel(lastPerf, exercise.exercise_type, exercise.name)}</span>
 <span className="text-foreground ml-2">
 ({new Date(lastPerf.performed_at).toLocaleDateString()})
 </span>
 </span>
 ) : (
 <span className="text-gray-600">Aucune performance enregistrée</span>
 )}
 </div>

 {/* Métriques par défaut - Seulement si aucune performance enregistrée */}
 {(exercise.default_cardio_metrics || exercise.default_strength_metrics) && performances.length === 0 && (
 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
 <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
 <span className="text-primary">🎯</span>
 Valeurs recommandées pour démarrer
 </h5>
 
 {/* Métriques cardio */}
 {exercise.default_cardio_metrics && exercise.exercise_type ==='Cardio' && (
 <div className="space-y-2">
 {((exercise.default_cardio_metrics as CardioMetrics).distance ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Distance :</strong> {((exercise.default_cardio_metrics as CardioMetrics).distance ?? 0) >= 1000 
 ? `${(((exercise.default_cardio_metrics as CardioMetrics).distance ?? 0) / 1000).toFixed(1)} km`
 : `${(exercise.default_cardio_metrics as CardioMetrics).distance ?? 0} m`}
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).running?.speed ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Vitesse :</strong> {(exercise.default_cardio_metrics as CardioMetrics).running?.speed} km/h
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).running?.incline ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Inclinaison :</strong> {(exercise.default_cardio_metrics as CardioMetrics).running?.incline}%
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).rowing?.stroke_rate ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>SPM :</strong> {(exercise.default_cardio_metrics as CardioMetrics).rowing?.stroke_rate}
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).rowing?.watts ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Puissance :</strong> {(exercise.default_cardio_metrics as CardioMetrics).rowing?.watts} watts
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).cycling?.cadence ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Cadence :</strong> {(exercise.default_cardio_metrics as CardioMetrics).cycling?.cadence} RPM
 </div>
 )}
 {((exercise.default_cardio_metrics as CardioMetrics).cycling?.resistance ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Résistance :</strong> {(exercise.default_cardio_metrics as CardioMetrics).cycling?.resistance}
 </div>
 )}
 </div>
 )}
 
 {/* Métriques musculation */}
 {exercise.default_strength_metrics && exercise.exercise_type ==='Musculation' && (
 <div className="space-y-2">
 {((exercise.default_strength_metrics as StrengthMetrics).weight ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Poids :</strong> {(exercise.default_strength_metrics as StrengthMetrics).weight} kg
 </div>
 )}
 {((exercise.default_strength_metrics as StrengthMetrics).reps ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Répétitions :</strong> {(exercise.default_strength_metrics as StrengthMetrics).reps}
 </div>
 )}
 {((exercise.default_strength_metrics as StrengthMetrics).sets ?? 0) > 0 && (
 <div className="text-sm text-orange-800">
 <strong>Séries :</strong> {(exercise.default_strength_metrics as StrengthMetrics).sets}
 </div>
 )}
 </div>
 )}
 
 <p className="text-xs text-orange-700 mt-2 italic">
 💡 Ces valeurs suggérées vous aideront à commencer votre première session !
 </p>
 </div>
 )}

 {/* Actions rapides */}
 <div className="flex gap-2">
 <button
 onClick={() => {
 onClose()
 router.push(`/exercises/${exerciseId}/edit-exercise`)
}}
 className="flex-1 bg-muted hover:bg-muted text-foreground py-2 px-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
 >
 <Edit3 className="h-4 w-4" />
 Modifier l'exercice
 </button>
 <button
 onClick={() => {
 onClose()
 router.push(`/exercises/${exerciseId}/add-performance`)
}}
 className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
 >
 <Plus className="h-4 w-4" />
 Nouvelle performance
 </button>
 </div>

 {/* Historique des performances */}
 <div>
 <h4 className="text-lg font-semibold text-foreground mb-4">
 Historique des performances ({performances.length})
 </h4>
 
 {performances.length === 0 ? (
 <div className="text-center py-8 text-gray-600">
 <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
 <p>Aucune performance enregistrée pour cet exercice.</p>
 <p className="text-sm mt-1">Ajoutez votre première performance !</p>
 </div>
 ) : (
 <div className="space-y-2">
 {performances.map((perf) => (
 <div
 key={perf.id}
 className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
 >
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-4">
 <span className="font-medium text-foreground">
 {getPerfLabel(perf, exercise.exercise_type, exercise.name)}
 </span>
 <span className="text-sm text-gray-600">
 {new Date(perf.performed_at).toLocaleDateString()}
 </span>
 </div>
 {perf.notes && (
 <p className="text-sm text-muted-foreground mt-1">{perf.notes}</p>
 )}
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => {
 onClose()
 router.push(`/exercises/${exerciseId}/edit-performance/${perf.id}`)
}}
 className="p-2 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
 title="Modifier cette performance"
 >
 <Edit3 className="h-6 w-6" />
 </button>
 <button
 onClick={() => {
 setPerfToDelete(perf)
 setDeleteModalOpen(true)
}}
 className="p-2 text-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 title="Supprimer"
 >
 <Trash2 className="h-6 w-6" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="text-center py-12 text-safe-error">
 Erreur lors du chargement de l'exercice
 </div>
 )}
 </div>
 </motion.div>
 
 {/* Modal de confirmation - Dialog shadcn pour accessibilité ARIA correcte */}
 <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
 <DialogContent className="max-w-sm">
 <DialogHeader>
 <DialogTitle>Supprimer la performance</DialogTitle>
 <DialogDescription>
 Êtes-vous sûr de vouloir supprimer cette performance ? Cette action est irréversible.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="flex gap-2 sm:gap-2">
 <Button
 onClick={() => setDeleteModalOpen(false)}
 variant="outline"
 className="flex-1"
 >
 Annuler
 </Button>
 <Button
 onClick={() => perfToDelete && handleDeletePerformance(perfToDelete)}
 variant="destructive"
 className="flex-1"
 >
 Supprimer
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </DialogContent>
 </Dialog>
 )
}
