'use client'

import { motion, AnimatePresence} from'framer-motion'
import { Calendar, Clock, Zap, CheckCircle, Target} from'lucide-react'
import { Slider2025} from'@/components/ui/Slider2025'

interface FrequencySelection2025Props {
 frequencyValue?:'Faible' |'Modérée' |'Élevée'
 availabilityValue?: number
 onChange: (frequency:'Faible' |'Modérée' |'Élevée', availability: number) => void
}

export function FrequencySelection2025({ frequencyValue, availabilityValue, onChange}: FrequencySelection2025Props) {
 const frequencies = [
 {
 id:'Faible',
 title:'Faible',
 description:'J\'ai peu de temps mais je veux rester actif',
 details:'1-2 séances par semaine',
 icon: Clock,
 gradient:'from-green-400 to-emerald-500',
 bgColor:'bg-gradient-to-br from-green-50 to-emerald-50',
 borderColor:'border-green-200',
 selectedBg:'bg-gradient-to-br from-green-100 to-emerald-100',
 selectedBorder:'border-green-500',
 iconBg:'bg-green-100',
 iconColor:'text-green-600',
 badgeColor:'bg-green-100 text-green-700 border-green-200'
},
 {
 id:'Modérée',
 title:'Modérée',
 description:'Je peux m\'entraîner régulièrement',
 details:'3-4 séances par semaine',
 icon: Calendar,
 gradient:'from-tertiary to-cyan-500',
 bgColor:'bg-gradient-to-br from-tertiary/8 to-cyan-50',
 borderColor:'border-tertiary/25',
 selectedBg:'bg-gradient-to-br from-tertiary/12 to-cyan-100',
 selectedBorder:'border-secondary',
 iconBg:'bg-tertiary/12',
 iconColor:'text-secondary',
 badgeColor:'bg-tertiary/12 text-tertiary border-tertiary/25'
},
 {
 id:'Élevée',
 title:'Élevée',
 description:'J\'ai beaucoup de temps à consacrer au sport',
 details:'5+ séances par semaine',
 icon: Zap,
 gradient:'from-purple-400 to-pink-500',
 bgColor:'bg-gradient-to-br from-purple-50 to-pink-50',
 borderColor:'border-purple-200',
 selectedBg:'bg-gradient-to-br from-purple-100 to-pink-100',
 selectedBorder:'border-purple-500',
 iconBg:'bg-purple-100',
 iconColor:'text-purple-600',
 badgeColor:'bg-purple-100 text-purple-700 border-purple-200'
}
 ]

 const handleFrequencyChange = (newFrequency:'Faible' |'Modérée' |'Élevée') => {
 const currentAvailability = availabilityValue || 60
 onChange(newFrequency, currentAvailability)
}

 const handleAvailabilityChange = (newAvailability: number[]) => {
 const currentFrequency = frequencyValue ||'Modérée'
 onChange(currentFrequency, newAvailability[0])
}

 const formatTime = (minutes: number) => {
 if (minutes >= 60) {
 const hours = Math.floor(minutes / 60)
 const remainingMinutes = minutes % 60
 return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}
 return `${minutes}min`
}

 return (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ duration: 0.5}}
 className="space-y-8"
 >
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -10}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.2}}
 className="text-center"
 >
 <h2 className="text-2xl font-bold text-foreground mb-2">
 À quelle fréquence souhaitez-vous vous entraîner ?
 </h2>
 <p className="text-gray-600 leading-relaxed">
 Nous personnaliserons votre programme selon votre disponibilité
 </p>
 </motion.div>

 {/* Frequency selection */}
 <div className="space-y-4">
 {frequencies.map((freq, index) => {
 const Icon = freq.icon
 const isSelected = frequencyValue === freq.id
 
 return (
 <motion.div
 key={freq.id}
 initial={{ opacity: 0, x: -20}}
 animate={{ opacity: 1, x: 0}}
 transition={{ delay: 0.1 * index, duration: 0.4}}
 whileHover={{ scale: 1.01}}
 whileTap={{ scale: 0.99}}
 className={`
 relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden
 ${isSelected 
 ? `${freq.selectedBg} ${freq.selectedBorder} shadow-lg ring-4 ring-orange-100` 
 : `${freq.bgColor} ${freq.borderColor} hover:shadow-md hover:border-border`
}
 `}
 onClick={() => handleFrequencyChange(freq.id as'Faible' |'Modérée' |'Élevée')}
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
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <motion.div
 initial={{ scale: 0}}
 animate={{ scale: 1}}
 transition={{ delay: 0.2 * index, type:"spring", stiffness: 200}}
 className={`
 p-2 rounded-xl transition-all duration-300
 ${isSelected 
 ?'bg-orange-700 text-white shadow-lg' 
 : `${freq.iconBg} ${freq.iconColor}`
}
 `}
 >
 <Icon className="h-6 w-6" />
 </motion.div>
 
 <div className="flex-1">
 <h3 className="text-lg font-bold text-foreground mb-1">{freq.title}</h3>
 <p className="text-gray-700 text-sm mb-2">{freq.description}</p>
 <motion.div
 initial={{ scale: 0}}
 animate={{ scale: 1}}
 transition={{ delay: 0.3 * index}}
 className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${freq.badgeColor}`}
 >
 {freq.details}
 </motion.div>
 </div>
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

 {/* Gradient accent line for selected state */}
 {isSelected && (
 <motion.div
 initial={{ scaleX: 0}}
 animate={{ scaleX: 1}}
 transition={{ delay: 0.3, duration: 0.5}}
 className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${freq.gradient}`}
 />
 )}
 </div>
 </motion.div>
 )
})}
 </div>

 {/* Duration selection */}
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.4}}
 className="space-y-6"
 >
 <div className="text-center">
 <h3 className="text-xl font-bold text-foreground mb-2">
 Combien de temps par séance ?
 </h3>
 <p className="text-gray-600 leading-relaxed">
 Durée moyenne souhaitée pour chaque entraînement
 </p>
 </div>

 <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-border rounded-xl p-6">
 <div className="space-y-6">
 {/* Current value display */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <div className="p-2 bg-orange-100 rounded-lg">
 <Target className="h-5 w-5 text-orange-800" />
 </div>
 <span className="text-sm font-medium text-gray-700">Durée par séance</span>
 </div>
 <motion.div
 key={availabilityValue}
 initial={{ scale: 1.2}}
 animate={{ scale: 1}}
 transition={{ type:"spring", stiffness: 300}}
 className="bg-gradient-to-r from-orange-600 to-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg"
 >
 {formatTime(availabilityValue || 60)}
 </motion.div>
 </div>
 
 {/* Slider */}
 <Slider2025
 value={[availabilityValue || 60]}
 onValueChange={handleAvailabilityChange}
 max={120}
 min={30}
 step={15}
 labels={['30min','45min','1h','1h15','1h30','2h']}
 className="w-full"
 />
 </div>
 </div>
 </motion.div>

 {/* Success message */}
 <AnimatePresence>
 {frequencyValue && availabilityValue && (
 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9}}
 animate={{ opacity: 1, y: 0, scale: 1}}
 exit={{ opacity: 0, y: -20, scale: 0.9}}
 transition={{ type:"spring", stiffness: 200, damping: 20}}
 className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center"
 >
 <motion.div
 initial={{ scale: 0}}
 animate={{ scale: 1}}
 transition={{ delay: 0.2, type:"spring", stiffness: 300}}
 className="flex items-center justify-center space-x-2 mb-2"
 >
 <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
 <Target className="h-5 w-5 text-purple-600" />
 </div>
 <p className="text-lg font-bold text-purple-800">
 Configuration parfaite !
 </p>
 </motion.div>
 <p className="text-purple-700 leading-relaxed mb-2">
 Fréquence <span className="font-semibold">{frequencyValue.toLowerCase()}</span> avec des séances de <span className="font-semibold">{formatTime(availabilityValue)}</span>
 </p>
 <p className="text-sm text-purple-600">
 Votre programme sera optimisé selon ces paramètres
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 )
}