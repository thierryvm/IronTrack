'use client'

import { motion, AnimatePresence} from'framer-motion'
import { Target, TrendingUp, Activity, Zap, CheckCircle} from'lucide-react'

interface GoalSelection2025Props {
 value?:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance'
 onChange: (goal:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance') => void
}

export function GoalSelection2025({ value, onChange}: GoalSelection2025Props) {
 const goals = [
 {
 id:'Prise de masse',
 title:'Prise de masse',
 description:'Développer ma masse musculaire et gagner en force',
 icon: TrendingUp,
 gradient:'from-green-400 to-emerald-500',
 bgColor:'bg-gradient-to-br from-green-50 to-emerald-50',
 borderColor:'border-green-200',
 selectedBg:'bg-gradient-to-br from-green-100 to-emerald-100',
 selectedBorder:'border-green-500',
 iconBg:'bg-green-100',
 iconColor:'text-green-600'
},
 {
 id:'Perte de poids',
 title:'Perte de poids', 
 description:'Perdre du poids et améliorer ma composition corporelle',
 icon: Target,
 gradient:'from-blue-400 to-cyan-500',
 bgColor:'bg-gradient-to-br from-blue-50 to-cyan-50',
 borderColor:'border-blue-200',
 selectedBg:'bg-gradient-to-br from-blue-100 to-cyan-100',
 selectedBorder:'border-secondary',
 iconBg:'bg-blue-100',
 iconColor:'text-secondary'
},
 {
 id:'Maintien',
 title:'Maintien',
 description:'Maintenir mon poids actuel et rester en forme',
 icon: Activity,
 gradient:'from-orange-400 to-red-500',
 bgColor:'bg-gradient-to-br from-orange-50 to-red-50',
 borderColor:'border-orange-200',
 selectedBg:'bg-gradient-to-br from-orange-100 to-red-100',
 selectedBorder:'border-primary',
 iconBg:'bg-orange-100',
 iconColor:'text-orange-800'
},
 {
 id:'Performance',
 title:'Performance',
 description:'Améliorer mes performances sportives et ma condition physique',
 icon: Zap,
 gradient:'from-purple-400 to-pink-500',
 bgColor:'bg-gradient-to-br from-purple-50 to-pink-50',
 borderColor:'border-purple-200',
 selectedBg:'bg-gradient-to-br from-purple-100 to-pink-100',
 selectedBorder:'border-purple-500',
 iconBg:'bg-purple-100',
 iconColor:'text-purple-600'
}
 ]

 return (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ duration: 0.5}}
 className="space-y-8"
 >
 <motion.div
 initial={{ opacity: 0, y: -10}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.2}}
 className="text-center"
 >
 <h2 className="text-2xl font-bold text-foreground mb-2">
 Quel est votre objectif principal ?
 </h2>
 <p className="text-gray-600 leading-relaxed">
 Choisissez l'objectif qui vous correspond le mieux pour personnaliser votre programme
 </p>
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {goals.map((goal, index) => {
 const Icon = goal.icon
 const isSelected = value === goal.id
 
 return (
 <motion.div
 key={goal.id}
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.1 * index, duration: 0.4}}
 whileHover={{ scale: 1.02}}
 whileTap={{ scale: 0.98}}
 className={`
 relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden
 ${isSelected 
 ? `${goal.selectedBg} ${goal.selectedBorder} shadow-lg ring-4 ring-orange-100` 
 : `${goal.bgColor} ${goal.borderColor} hover:shadow-md hover:border-border`
}
 `}
 onClick={() => onChange(goal.id as'Prise de masse' |'Perte de poids' |'Maintien' |'Performance')}
 >
 {/* Background gradient overlay for selected state */}
 {isSelected && (
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-orange-100/30"
 />
 )}

 <div className="relative p-6">
 {/* Header with icon and title */}
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center space-x-4">
 <motion.div
 initial={{ scale: 0}}
 animate={{ scale: 1}}
 transition={{ delay: 0.2 * index, type:"spring", stiffness: 200}}
 className={`
 p-2 rounded-xl transition-all duration-300
 ${isSelected 
 ?'bg-orange-700 text-white shadow-lg' 
 : `${goal.iconBg} ${goal.iconColor}`
}
 `}
 >
 <Icon className="h-6 w-6" />
 </motion.div>
 <h3 className="text-lg font-bold text-foreground">{goal.title}</h3>
 </div>
 
 {/* Selection indicator */}
 <AnimatePresence>
 {isSelected && (
 <motion.div
 initial={{ scale: 0, rotate: -180}}
 animate={{ scale: 1, rotate: 0}}
 exit={{ scale: 0, rotate: 180}}
 transition={{ type:"spring", stiffness: 200}}
 className="text-orange-800"
 >
 <CheckCircle className="h-6 w-6" />
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Description */}
 <p className="text-gray-700 leading-relaxed text-sm">
 {goal.description}
 </p>

 {/* Gradient accent line for selected state */}
 {isSelected && (
 <motion.div
 initial={{ scaleX: 0}}
 animate={{ scaleX: 1}}
 transition={{ delay: 0.3, duration: 0.5}}
 className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${goal.gradient}`}
 />
 )}
 </div>
 </motion.div>
 )
})}
 </div>

 {/* Success message */}
 <AnimatePresence>
 {value && (
 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9}}
 animate={{ opacity: 1, y: 0, scale: 1}}
 exit={{ opacity: 0, y: -20, scale: 0.9}}
 transition={{ type:"spring", stiffness: 200, damping: 20}}
 className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 text-center"
 >
 <motion.div
 initial={{ scale: 0}}
 animate={{ scale: 1}}
 transition={{ delay: 0.2, type:"spring", stiffness: 300}}
 className="flex items-center justify-center space-x-2 mb-2"
 >
 <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
 <CheckCircle className="h-5 w-5 text-green-600" />
 </div>
 <p className="text-lg font-bold text-orange-800">
 Excellent choix !
 </p>
 </motion.div>
 <p className="text-orange-700 leading-relaxed">
 Nous personnaliserons votre programme pour : <span className="font-semibold">{value}</span>
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 )
}