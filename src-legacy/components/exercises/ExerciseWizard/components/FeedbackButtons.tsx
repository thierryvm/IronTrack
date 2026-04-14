import React from'react'
import { motion} from'framer-motion'
import { ThumbsUp, ThumbsDown} from'lucide-react'
import { ExerciseSuggestion} from'@/types/exercise-wizard'
import { useSuggestionFeedback} from'@/hooks/useSuggestionFeedback'

interface FeedbackButtonsProps {
 suggestion: ExerciseSuggestion
 className?: string
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ 
 suggestion, 
 className ='' 
}) => {
 const { submitFeedback, getFeedback, isLoading} = useSuggestionFeedback()
 const currentFeedback = getFeedback(suggestion.id)
 const loading = isLoading(suggestion.id)

 const handleFeedback = (e: React.MouseEvent, feedbackType:'helpful' |'not_helpful') => {
 e.stopPropagation() // Empêcher la sélection de la suggestion
 submitFeedback(suggestion, feedbackType)
}

 return (
 <div className={`flex items-center gap-1 ${className}`}>
 <span className="text-xs text-gray-600 mr-1">Utile ?</span>
 
 <motion.button
 whileHover={{ scale: 1.1}}
 whileTap={{ scale: 0.9}}
 onClick={(e) => handleFeedback(e,'helpful')}
 disabled={loading}
 className={`p-1 rounded-full transition-all duration-200 ${
 currentFeedback ==='helpful'
 ?'bg-green-100 text-green-600 border border-green-200'
 :'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-safe-success'
} ${loading ?'opacity-50 cursor-not-allowed' :'cursor-pointer'}`}
 title="Cette suggestion m'aide"
 >
 <ThumbsUp className="w-3 h-3" />
 </motion.button>

 <motion.button
 whileHover={{ scale: 1.1}}
 whileTap={{ scale: 0.9}}
 onClick={(e) => handleFeedback(e,'not_helpful')}
 disabled={loading}
 className={`p-1 rounded-full transition-all duration-200 ${
 currentFeedback ==='not_helpful'
 ?'bg-red-100 text-red-600 border border-red-200'
 :'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-safe-error'
} ${loading ?'opacity-50 cursor-not-allowed' :'cursor-pointer'}`}
 title="Cette suggestion ne m'aide pas"
 >
 <ThumbsDown className="w-3 h-3" />
 </motion.button>

 {loading && (
 <div className="ml-1">
 <div className="w-3 h-3 border border-orange-300 border-t-orange-600 rounded-full animate-spin" />
 </div>
 )}
 </div>
 )
}