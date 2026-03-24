'use client'

import { motion} from'framer-motion'
import { Plus, Eye, Trash2, Target, Dumbbell, TrendingUp, Calendar, Heart, Zap, Activity, Users, Bike, Footprints} from'lucide-react'
import Image from'next/image'
import { Card, CardContent} from'@/components/ui/card'
import { Button} from'@/components/ui/button'
import { Badge} from'@/components/ui/badge'

interface Performance {
 weight?: number
 reps?: number
 sets?: number
 distance?: number
 duration?: number
 stroke_rate?: number
 watts?: number
 heart_rate?: number
 incline?: number
 cadence?: number
 resistance?: number
 calories?: number
 speed?: number
 running?: {
 speed?: number
 distance?: number
}
 performed_at: string
}

interface Exercise {
 id: number
 name: string
 muscle_group: string
 equipment: string
 difficulty: string | number // Support difficulté BDD (1-5) et affichage (texte)
 exercise_type:'Musculation' |'Cardio' |'Fitness' |'Étirement'
 image_url?: string
 description?: string
}

interface ExerciseCard2025Props {
 exercise: Exercise
 lastPerformance?: Performance
 variant?:'default' |'compact' |'detailed'
 priority?: boolean // ULTRAHARDCORE LCP: eager loading pour premières images
 onAddPerformance: (exerciseId: number) => void
 onViewDetails: (exerciseId: number) => void
 onDelete?: (exerciseId: number) => void
 className?: string
 testId?: string
}

export function ExerciseCard2025({
 exercise,
 lastPerformance,
 priority = false,
 variant ='default',
 onAddPerformance,
 onViewDetails,
 onDelete,
 className ='',
 testId
}: ExerciseCard2025Props) {


 // Format intelligent des performances selon type d'exercice
 const formatPerformance = (): string => {
 if (!lastPerformance) return'Aucune performance enregistrée'



 if (exercise.exercise_type ==='Musculation') {
 const parts = []
 if (lastPerformance.weight) parts.push(`${lastPerformance.weight}kg`)
 if (lastPerformance.reps) parts.push(`${lastPerformance.reps} reps`)
 if (lastPerformance.sets) parts.push(`${lastPerformance.sets} sets`)
 return parts.join(' ×') ||'Performance musculation'
} else {
 // Cardio - Format adaptatif selon type d'exercice avec priorisation intelligente
 const parts = []
 const isRowing = (exercise.name ||'').toLowerCase().includes('rameur')
 const isRunning = (exercise.name ||'').toLowerCase().includes('run') || 
 (exercise.name ||'').toLowerCase().includes('course') ||
 (exercise.name ||'').toLowerCase().includes('marche') ||
 (exercise.equipment ||'').toLowerCase().includes('tapis')
 
 // Métriques prioritaires selon le type d'exercice
 if (lastPerformance.distance) {
 // Adapter unité selon type d'exercice et données stockées
 if (isRowing) {
 // Rameur → afficher en mètres (ex: 2000m, 5000m)
 parts.push(`${lastPerformance.distance}m`)
} else {
 // Course/vélo → vérifier si données en mètres ou km
 const distance = lastPerformance.distance
 if (distance > 100) {
 // Probablement en mètres si > 100, convertir en km
 parts.push(`${(distance / 1000).toFixed(1).replace('.0','')}km`)
} else {
 // Probablement déjà en km si ≤ 100
 parts.push(`${distance}km`)
}
}
}
 
 // Pour la course : prioriser vitesse et BPM avec structure correcte
 if (isRunning) {
 // Vitesse peut être dans running.speed ou speed direct (compatibilité)
 const speed = lastPerformance.running?.speed || lastPerformance.speed
 if (speed) parts.push(`${speed} km/h`)
 
 // Heart rate directement disponible
 if (lastPerformance.heart_rate) parts.push(`${lastPerformance.heart_rate} BPM`)
 
 // Durée
 if (lastPerformance.duration) {
 const minutes = Math.floor(lastPerformance.duration / 60)
 const seconds = lastPerformance.duration % 60
 parts.push(`${minutes}:${seconds.toString().padStart(2,'0')}`)
}
} else {
 // Autres cardio : ordre standard
 if (lastPerformance.duration) {
 const minutes = Math.floor(lastPerformance.duration / 60)
 const seconds = lastPerformance.duration % 60
 parts.push(`${minutes}:${seconds.toString().padStart(2,'0')}`)
}
 
 // Métriques spécialisées selon équipement
 if (lastPerformance.stroke_rate) parts.push(`${lastPerformance.stroke_rate} SPM`)
 if (lastPerformance.watts) parts.push(`${lastPerformance.watts}W`)
 if (lastPerformance.speed) parts.push(`${lastPerformance.speed} km/h`)
 if (lastPerformance.heart_rate) parts.push(`${lastPerformance.heart_rate} BPM`)
 if (lastPerformance.cadence) parts.push(`${lastPerformance.cadence} RPM`)
 if (lastPerformance.resistance) parts.push(`Niv.${lastPerformance.resistance}`)
 if (lastPerformance.incline && lastPerformance.incline !== 0) {
 const inclineText = lastPerformance.incline > 0 ? `+${lastPerformance.incline}%` : `${lastPerformance.incline}%`
 parts.push(inclineText)
}
}
 
 // Augmenter la limite d'affichage pour la course
 const maxDisplayItems = isRunning ? 4 : 3
 return parts.slice(0, maxDisplayItems).join(' •') ||'Performance cardio'
}
}

 // Couleurs badges difficulté avec protection complète
 const difficultyMapping: Record<string, { text: string; class: string}> = {
 // Valeurs standard françaises
'Débutant': { text:'Débutant', class:'bg-green-100 text-green-700'},
'Intermédiaire': { text:'Intermédiaire', class:'bg-yellow-100 text-yellow-700'},
'Avancé': { text:'Avancé', class:'bg-red-100 text-red-700'},
 // Valeurs alternatives possibles
'debutant': { text:'Débutant', class:'bg-green-100 text-green-700'},
'intermediaire': { text:'Intermédiaire', class:'bg-yellow-100 text-yellow-700'},
'avance': { text:'Avancé', class:'bg-red-100 text-red-700'},
'facile': { text:'Débutant', class:'bg-green-100 text-green-700'},
'moyen': { text:'Intermédiaire', class:'bg-yellow-100 text-yellow-700'},
'difficile': { text:'Avancé', class:'bg-red-100 text-red-700'},
 // Valeurs numériques possibles (1-5)
'1': { text:'Débutant', class:'bg-green-100 text-green-700'},
'2': { text:'Intermédiaire', class:'bg-yellow-100 text-yellow-700'},
'3': { text:'Avancé', class:'bg-red-100 text-red-700'},
'4': { text:'Expert', class:'bg-purple-100 text-purple-700'},
'5': { text:'Élite', class:'bg-black text-white'},
 // Valeurs anglaises possibles
'beginner': { text:'Débutant', class:'bg-green-100 text-green-700'},
'intermediate': { text:'Intermédiaire', class:'bg-yellow-100 text-yellow-700'},
'advanced': { text:'Avancé', class:'bg-red-100 text-red-700'}
}
 
 // Fonction pour obtenir la difficulté normalisée
 const getDifficultyDisplay = (difficulty: string | number | null | undefined) => {
 if (!difficulty && difficulty !== 0) {
 return { text:'Non défini', class:'bg-muted text-muted-foreground'}
}
 
 const diffStr = String(difficulty).trim()
 
 // Recherche directe (insensible à la casse)
 const mapping = difficultyMapping[diffStr] || difficultyMapping[diffStr.toLowerCase()]
 if (mapping) {
 return mapping
}
 
 // Fallback: afficher la valeur brute avec style neutre
 console.warn(`🚨 Difficulté non reconnue:"${diffStr}" pour"${exercise.name}"`)
 return { text: diffStr, class:'bg-muted text-muted-foreground'}
}
 
 const { text: difficultyText, class: difficultyClass} = getDifficultyDisplay(exercise.difficulty)

 // Fonction pour obtenir icône et couleurs selon exercice
 const getPlaceholderConfig = () => {
 const exerciseType = exercise.exercise_type
 const muscleGroup = (exercise.muscle_group ||'').toLowerCase()
 const equipment = (exercise.equipment ||'').toLowerCase()
 const exerciseName = (exercise.name ||'').toLowerCase()

 // Configuration selon type cardio/musculation ET groupe musculaire/équipement
 if (exerciseType ==='Cardio') {
 if (equipment.includes('rameur') || exerciseName.includes('rameur')) {
 return {
 icon: Activity,
 gradient:'from-blue-100 to-blue-200',
 iconColor:'text-safe-info'
}
}
 if (equipment.includes('vélo') || equipment.includes('bike')) {
 return {
 icon: Bike,
 gradient:'from-green-100 to-green-200',
 iconColor:'text-safe-success'
}
}
 if (equipment.includes('tapis') || exerciseName.includes('course') || exerciseName.includes('marche') || exerciseName.includes('running')) {
 return {
 icon: Footprints,
 gradient:'from-purple-100 to-purple-200',
 iconColor:'text-safe-primary'
}
}
 // Cardio général
 return {
 icon: Heart,
 gradient:'from-red-100 to-red-200',
 iconColor:'text-safe-error'
}
}

 // Musculation selon groupe musculaire
 if (muscleGroup.includes('pectoral') || muscleGroup.includes('poitrine')) {
 return {
 icon: Dumbbell,
 gradient:'from-orange-100 to-orange-200',
 iconColor:'text-orange-800'
}
}
 if (muscleGroup.includes('dos') || muscleGroup.includes('dorsal')) {
 return {
 icon: Target,
 gradient:'from-indigo-100 to-indigo-200',
 iconColor:'text-indigo-500'
}
}
 if (muscleGroup.includes('jambes') || muscleGroup.includes('cuisse') || muscleGroup.includes('mollet')) {
 return {
 icon: Zap,
 gradient:'from-yellow-100 to-yellow-200',
 iconColor:'text-yellow-600'
}
}
 if (muscleGroup.includes('épaule') || muscleGroup.includes('deltoïde')) {
 return {
 icon: Users,
 gradient:'from-pink-100 to-pink-200',
 iconColor:'text-pink-500'
}
}
 if (muscleGroup.includes('bras') || muscleGroup.includes('biceps') || muscleGroup.includes('triceps')) {
 return {
 icon: Dumbbell,
 gradient:'from-cyan-100 to-cyan-200',
 iconColor:'text-cyan-500'
}
}

 // Défaut musculation
 return {
 icon: Dumbbell,
 gradient:'from-gray-100 to-gray-200',
 iconColor:'text-gray-600'
}
}

 const placeholderConfig = getPlaceholderConfig()

 // Classes selon variante pour Card ShadCN UI
 const getCardClasses = () => {
 const base ='hover:shadow-lg border-border hover:border-orange-200 dark:border-primary transition-all duration-300 overflow-hidden group flex flex-col min-h-[500px]'
 
 switch (variant) {
 case'compact':
 return `${base} max-w-sm min-h-[400px]`
 case'detailed':
 return `${base} max-w-2xl min-h-[600px]`
 default:
 return base
}
}

 return (
 <motion.div
 data-testid={testId}
 className={className}
 whileHover={{ y: -2}}
 transition={{ duration: 0.2}}
 >
 <Card className={getCardClasses()}>
 <CardContent className="p-0">
 {/* Image héro avec badge difficulté */}
 <div className="relative h-48 w-full">
 {exercise.image_url ? (
 <Image
 src={exercise.image_url}
 alt={`Photo de ${exercise.name}`}
 fill
 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 className="object-cover object-center"
 loading={priority ?"eager" :"lazy"}
 quality={priority ? 90 : 60}
 placeholder="blur"
 blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
 />
 ) : (
 // Placeholder avec icône et couleurs adaptées selon exercice
 <div className={`w-full h-full bg-gradient-to-br ${placeholderConfig.gradient} flex items-center justify-center`}>
 <placeholderConfig.icon className={`h-16 w-16 ${placeholderConfig.iconColor}`} />
 </div>
 )}
 
 {/* Badge difficulté COMPLÈTEMENT CORRIGÉ */}
 <div className="absolute top-4 right-4">
 <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyClass}`}>
 {difficultyText}
 </span>
 </div>
 </div>

 <div className="p-6 flex flex-col flex-1">
 {/* Header avec titre et métadonnées */}
 <div className="mb-4">
 <h3 className="text-xl font-bold text-foreground group-hover:text-orange-800 dark:text-orange-300 transition-colors mb-2 line-clamp-2">
 {exercise.name}
 </h3>
 <div className="flex items-center space-x-4 text-sm text-gray-600">
 {/* CORRIGÉ: Icône muscle group seulement si data disponible */}
 {exercise.muscle_group && (
 <div className="flex items-center space-x-1">
 <Target className="h-6 w-6 flex-shrink-0" />
 <span className="truncate">{exercise.muscle_group}</span>
 </div>
 )}
 {/* CORRIGÉ: Icône équipement seulement si data disponible */}
 {exercise.equipment && (
 <div className="flex items-center space-x-1">
 <Dumbbell className="h-6 w-6 flex-shrink-0" />
 <span className="truncate">{exercise.equipment}</span>
 </div>
 )}
 {/* CORRIGÉ: Fallback si pas de métadonnées */}
 {!exercise.muscle_group && !exercise.equipment && (
 <span className="text-foreground italic">Métadonnées à compléter</span>
 )}
 </div>
 </div>

 {/* Section performance avec design amélioré */}
 <div className="mb-6 p-4 bg-muted rounded-lg flex-1">
 <div className="flex items-center space-x-2 text-sm mb-2">
 <TrendingUp className="h-6 w-6 text-orange-800 flex-shrink-0" />
 <span className="text-muted-foreground font-medium">Dernière performance</span>
 </div>
 <p className="text-base font-semibold text-foreground mb-1 line-clamp-2">
 {formatPerformance()}
 </p>
 {lastPerformance && (
 <p className="text-xs text-gray-600 flex items-center">
 <Calendar className="h-5 w-5 mr-1 flex-shrink-0" />
 {new Date(lastPerformance.performed_at).toLocaleDateString('fr-FR')}
 </p>
 )}
 </div>

 {/* HIÉRARCHIE D'ACTIONS 2025 - Fixé en bas */}
 <div className="flex items-center space-x-2 mt-auto">
 {/* ACTION PRIMAIRE - CTA Principal (90% des interactions) */}
 <button
 onClick={(e) => {
 e.stopPropagation()
 onAddPerformance(exercise.id)
}}
 className="flex-1 bg-gradient-to-r from-orange-600 to-red-500 
 text-white font-semibold py-2 px-4 rounded-lg 
 hover:from-orange-600 hover:to-red-600 
 focus:from-orange-600 focus:to-red-600
 transition-all duration-200 
 flex items-center justify-center gap-2
 shadow-md hover:shadow-lg
 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
 aria-label={`Ajouter une nouvelle performance pour ${exercise.name}`}
 data-testid="add-performance-btn"
 >
 <Plus className="h-5 w-5 flex-shrink-0" />
 <span>Performance</span>
 </button>

 {/* ACTION SECONDAIRE - Style discret (15% des interactions) */}
 <button
 onClick={(e) => {
 e.stopPropagation()
 onViewDetails(exercise.id)
}}
 className="px-4 py-2 bg-muted hover:bg-muted
 focus:bg-muted
 text-foreground rounded-lg font-medium
 transition-colors duration-200 
 flex items-center gap-2
 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
 aria-label={`Voir les détails de ${exercise.name}`}
 data-testid="view-details-btn"
 >
 <Eye className="h-6 w-6 flex-shrink-0" />
 <span className="hidden sm:inline">Détails</span>
 </button>

 {/* ACTION TERTIAIRE - Supprimer (icône corbeille directe) */}
 {onDelete && (
 <motion.button
 onClick={(e) => {
 e.stopPropagation()
 onDelete(exercise.id)
}}
 whileHover={{ scale: 1.05}}
 whileTap={{ scale: 0.95}}
 className="p-2 text-gray-600 hover:text-safe-error dark:text-safe-error hover:bg-red-50 dark:bg-red-900/20 
 focus:text-safe-error dark:text-safe-error focus:bg-red-50 dark:bg-red-900/20
 rounded-lg transition-all duration-200
 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
 aria-label={`Supprimer ${exercise.name}`}
 data-testid="delete-button"
 >
 <Trash2 className="h-6 w-6" />
 </motion.button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 )
}