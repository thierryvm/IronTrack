import React from'react'
import { motion} from'framer-motion'
import { ChevronRight, Dumbbell, Clock, Target, Zap} from'lucide-react'
import { SuggestionCardProps} from'@/types/exercise-wizard'
import { FeedbackButtons} from'./FeedbackButtons'

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
 suggestion, 
 onSelect, 
 delay = 0 
}) => {
 const getRelevanceBadge = (score: number) => {
 if (score >= 80) return { 
 text:'Recommandé', 
 color:'bg-green-100 text-green-800 border-green-200',
 icon: <Target className="w-3 h-3" />
}
 if (score >= 60) return { 
 text:'Populaire', 
 color:'bg-blue-100 text-blue-800 border-blue-200',
 icon: <Zap className="w-3 h-3" />
}
 return { 
 text:'Nouveau', 
 color:'bg-gray-100 text-card-foreground border-border',
 icon: <Dumbbell className="w-3 h-3" />
}
}

 const badge = getRelevanceBadge(suggestion.relevanceScore || 0)

 const getDifficultyColor = (difficulty: string) => {
 switch (difficulty) {
 case'Débutant': return'bg-green-100 text-green-800'
 case'Intermédiaire': return'bg-yellow-100 text-yellow-800'
 case'Avancé': return'bg-red-100 text-red-800'
 default: return'bg-gray-100 text-card-foreground'
}
}

 return (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay, duration: 0.3}}
 whileHover={{ scale: 1.02, y: -2}}
 whileTap={{ scale: 0.98}}
 className="bg-card border border-border rounded-xl p-4 cursor-pointer
 hover:border-orange-300 hover:shadow-lg transition-all duration-200
 group"
 onClick={onSelect}
 >
 <div className="flex items-start justify-between mb-2">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 {suggestion.type ==='Musculation' ? (
 <Dumbbell className="w-4 h-4 text-orange-800" />
 ) : (
 <Clock className="w-4 h-4 text-safe-info" />
 )}
 <h3 className="font-semibold text-foreground group-hover:text-orange-800 transition-colors">
 {suggestion.name}
 </h3>
 </div>
 <p className="text-sm text-gray-600 mb-2">
 {suggestion.muscle_group} • {suggestion.equipment}
 </p>
 <div className="flex items-center gap-2">
 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
 {suggestion.difficulty}
 </span>
 <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badge.color} flex items-center gap-1`}>
 {badge.icon}
 {badge.text}
 </span>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-orange-800 transition-colors" />
 </div>
 
 <div className="flex items-center gap-4 text-sm text-gray-600 bg-background rounded-lg p-2">
 {suggestion.values.firstWeight && (
 <div className="flex items-center gap-1">
 <span className="font-medium">💪</span>
 <span>{suggestion.values.firstWeight}kg</span>
 </div>
 )}
 {suggestion.values.firstReps && (
 <div className="flex items-center gap-1">
 <span className="font-medium">🔢</span>
 <span>{suggestion.values.firstReps} reps</span>
 </div>
 )}
 {suggestion.values.sets && (
 <div className="flex items-center gap-1">
 <span className="font-medium">📊</span>
 <span>{suggestion.values.sets} séries</span>
 </div>
 )}
 {suggestion.values.distance && (
 <div className="flex items-center gap-1">
 <span className="font-medium">📏</span>
 <span>{suggestion.values.distance}{suggestion.values.distanceUnit ||'km'}</span>
 </div>
 )}
 {suggestion.values.duration && (
 <div className="flex items-center gap-1">
 <span className="font-medium">⏱️</span>
 <span>{suggestion.values.duration}min</span>
 </div>
 )}
 {suggestion.values.calories && (
 <div className="flex items-center gap-1">
 <span className="font-medium">🔥</span>
 <span>{suggestion.values.calories} cal</span>
 </div>
 )}
 </div>

 {/* Feedback buttons */}
 <div className="flex justify-end mt-2 pt-2 border-t border-border">
 <FeedbackButtons suggestion={suggestion} />
 </div>
 </motion.div>
 )
}